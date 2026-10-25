"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import MediaPicker from "@/components/MediaPicker";

/**
 * The blog editor, intentionally limited (architecture note #4):
 * Paragraph · H2 · H3 · Bold · Italic · Link · Image · Lists · Quote.
 * No tables, no buttons, no layouts — that is what Pages are for.
 */
export default function TiptapEditor({
  name,
  initialContent,
  onUpdate,
}: {
  name: string;
  initialContent?: string;
  /** Optional listener so parents (SEO checklist) can react to the HTML. */
  onUpdate?: (html: string) => void;
}) {
  const [html, setHtml] = useState(initialContent ?? "");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg" } }),
    ],
    content: initialContent ?? "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const next = editor.getHTML();
      setHtml(next);
      onUpdate?.(next);
    },
    editorProps: {
      attributes: { class: "tiptap", "data-placeholder": "Write your article…" },
    },
  });

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`toolbar-btn ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="editor-toolbar">
        <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </Btn>
        <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </Btn>
        <span className="toolbar-sep" />
        <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Btn>
        <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Btn>
        <span className="toolbar-sep" />
        <Btn
          title="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = prompt("Link URL:");
            if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          Link
        </Btn>
        <MediaPicker
          triggerLabel="Image"
          onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
        />
        <span className="toolbar-sep" />
        <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </Btn>
        <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </Btn>
        <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </Btn>
      </div>
      <EditorContent editor={editor} />
      {/* content is submitted with the surrounding form */}
      <textarea hidden name={name} value={html} readOnly />
    </div>
  );
}
