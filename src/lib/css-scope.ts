/**
 * CSS namespacing for raw page CSS (architecture note #3).
 *
 * A page's CSS is rewritten so every selector is prefixed with a scope
 * (e.g. `.qreet-page[data-page="about"]`). This guarantees that rules like
 * `body { ... }` or `* { ... }` written by a designer can never leak out
 * and break the rest of qreet.com.
 *
 * - `html` / `body` selectors are mapped onto the scope element itself.
 * - `@keyframes` / `@font-face` / `@import` pass through untouched
 *   (keyframe names should be prefixed by the author if they collide).
 * - `@media` / `@supports` blocks are processed recursively.
 */
export function scopeCss(css: string, scope: string): string {
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return processRules(cleaned, scope);
}

function processRules(css: string, scope: string): string {
  let out = "";
  let i = 0;

  while (i < css.length) {
    const braceIdx = css.indexOf("{", i);
    if (braceIdx === -1) {
      out += css.slice(i);
      break;
    }
    const prelude = css.slice(i, braceIdx).trim();
    const bodyEnd = findMatchingBrace(css, braceIdx);
    const body = css.slice(braceIdx + 1, bodyEnd);

    if (prelude.startsWith("@")) {
      const atRule = prelude.split(/\s/)[0].toLowerCase();
      if (["@media", "@supports", "@layer", "@container"].includes(atRule)) {
        out += `${prelude} {\n${processRules(body, scope)}\n}\n`;
      } else {
        // @keyframes, @font-face, @import, … pass through as-is
        out += bodyEnd < css.length && !prelude.startsWith("@import")
          ? `${prelude} {${body}}\n`
          : `${prelude};\n`;
      }
    } else {
      const selectors = prelude
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => scopeSelector(s, scope))
        .join(",\n");
      if (selectors) out += `${selectors} {${body}}\n`;
    }
    i = bodyEnd + 1;
  }
  return out;
}

function scopeSelector(selector: string, scope: string): string {
  // :root / html / body → the scope element itself
  if (/^(?::root|html|body)(?![\w-])/.test(selector)) {
    return selector.replace(/^(?::root|html|body)/, scope);
  }
  // bare universal selector → scoped universal
  if (selector === "*") return `${scope} *`;
  return `${scope} ${selector}`;
}

function findMatchingBrace(css: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return css.length;
}

/** Build the scope selector used for a page render. */
export function pageScopeSelector(slug: string): string {
  return `.qreet-page[data-page="${slug.replace(/"/g, "")}"]`;
}
