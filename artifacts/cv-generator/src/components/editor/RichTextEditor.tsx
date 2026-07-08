import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useCallback, useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const ToolbarBtn = ({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={cn(
      "h-7 w-7 flex items-center justify-center rounded transition-colors text-sm",
      active
        ? "bg-primary text-primary-foreground"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    {children}
  </button>
);

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí...",
  className,
  minHeight = "80px",
}: RichTextEditorProps) {
  const [alignOpen, setAlignOpen] = useState(false);
  const alignRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
        strike: false,
        // StarterKit v3 bundles underline and link — disable them here
        // so our explicit instances below don't conflict.
        underline: false,
        link: false,
      }),
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none px-3 py-2 text-gray-800",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_li]:my-0.5",
          "[&_p]:my-0 [&_p+p]:mt-1"
        ),
        style: `min-height: ${minHeight}`,
        "data-placeholder": placeholder,
      },
    },
    onUpdate({ editor }) {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
  });

  // Sync external value changes (e.g., initial load from DB)
  const lastExternalValue = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value === lastExternalValue.current) return;
    lastExternalValue.current = value;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (current !== value) {
      // setContent(content, emitUpdate) — boolean is valid in TipTap v2
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  // Close alignment dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alignRef.current && !alignRef.current.contains(e.target as Node)) {
        setAlignOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const currentAlign = editor?.isActive({ textAlign: "center" })
    ? "center"
    : editor?.isActive({ textAlign: "right" })
      ? "right"
      : editor?.isActive({ textAlign: "justify" })
        ? "justify"
        : "left";

  const AlignIcon =
    currentAlign === "center"
      ? AlignCenter
      : currentAlign === "right"
        ? AlignRight
        : currentAlign === "justify"
          ? AlignJustify
          : AlignLeft;

  if (!editor) return null;

  return (
    <div className={cn("border rounded-md overflow-hidden bg-white", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-gray-50">
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Subrayado (Ctrl+U)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn
          active={editor.isActive("link")}
          onClick={setLink}
          title="Insertar enlace"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista de viñetas"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Alignment dropdown */}
        <div className="relative" ref={alignRef}>
          <button
            type="button"
            title="Alineación de texto"
            onMouseDown={(e) => {
              e.preventDefault();
              setAlignOpen((o) => !o);
            }}
            className="h-7 flex items-center gap-0.5 px-1.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <AlignIcon className="h-3.5 w-3.5" />
            <ChevronDown className="h-3 w-3" />
          </button>

          {alignOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-white border rounded-md shadow-md flex gap-0.5 p-1">
              {(
                [
                  { align: "left", Icon: AlignLeft, label: "Izquierda" },
                  { align: "center", Icon: AlignCenter, label: "Centrado" },
                  { align: "right", Icon: AlignRight, label: "Derecha" },
                  { align: "justify", Icon: AlignJustify, label: "Justificado" },
                ] as const
              ).map(({ align, Icon, label }) => (
                <button
                  key={align}
                  type="button"
                  title={label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setTextAlign(align).run();
                    setAlignOpen(false);
                  }}
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded transition-colors",
                    currentAlign === align
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
