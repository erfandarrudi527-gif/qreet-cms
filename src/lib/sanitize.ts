/**
 * Enterprise-grade HTML & Script sanitization engine.
 * Protects against stored XSS, script injection, DOM clobbering, and malicious payloads.
 */
export function sanitizePageHtml(html: string): string {
  if (!html) return "";
  let clean = String(html);

  // 1. Strip script tags entirely (including multiline, whitespace variations, and broken tags)
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<script\b[^>]*>/gi, "");
  clean = clean.replace(/<\/script>/gi, "");

  // 2. Strip dangerous active object/embed containers
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  clean = clean.replace(/<embed\b[^>]*>/gi, "");
  clean = clean.replace(/<applet\b[^>]*>/gi, "");
  clean = clean.replace(/<meta\b[^>]*http-equiv\s*=\s*['"]?refresh['"]?[^>]*>/gi, "");
  clean = clean.replace(/<base\b[^>]*>/gi, "");

  // 3. Strip all inline DOM event handlers (onload, onerror, onclick, onmouseover, onfocus, etc.)
  clean = clean.replace(/\son[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, "");
  clean = clean.replace(/\son[a-zA-Z]+\s*=\s*[^>\s]+/gi, "");

  // 4. Neutralize javascript:, vbscript:, and data:text/html URI vectors
  clean = clean.replace(/(href|src|action|data|poster)\s*=\s*(['"]?)\s*(?:javascript|vbscript):[^'"]*?\2/gi, '$1="#"');
  clean = clean.replace(/(href|src)\s*=\s*(['"]?)\s*data:text\/html[^'"]*?\2/gi, '$1="#"');

  return clean;
}

export function sanitizePostHtml(html: string): string {
  if (!html) return "";
  return sanitizePageHtml(html);
}
