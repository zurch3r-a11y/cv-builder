import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
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
  Baseline,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Custom FontSize extension ────────────────────────────────────────────────
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) =>
              (el as HTMLElement).style.fontSize || null,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .run(),
    };
  },
});

// ── Constants ────────────────────────────────────────────────────────────────
const FONT_SIZES = [
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "13", value: "13px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
];

const COLOR_PALETTE = [
  // Row 1 – neutrals
  "#000000", "#374151", "#6b7280", "#d1d5db",
  // Row 2 – warm
  "#dc2626", "#ea580c", "#d97706", "#ca8a04",
  // Row 3 – cool
  "#16a34a", "#0891b2", "#2563eb", "#7c3aed",
  // Row 4 – vivid
  "#db2777", "#e11d48", "#059669", "#0284c7",
];

// ── Small sub-components ─────────────────────────────────────────────────────
const Divider = () => <div className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />;

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
      "h-7 w-7 flex items-center justify-center rounded transition-colors text-sm shrink-0",
      active
        ? "bg-primary text-primary-foreground"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    {children}
  </button>
);

// ── Props ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// ── Main component ────────────────────────────────────────────────────────────
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí...",
  className,
  minHeight = "80px",
}: RichTextEditorProps) {
  const [alignOpen, setAlignOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const alignRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
        strike: false,
        underline: false,
        link: false,
      }),
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      TextStyle,
      Color,
      FontSize,
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

  // Sync external value changes
  const lastExternalValue = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value === lastExternalValue.current) return;
    lastExternalValue.current = value;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alignRef.current && !alignRef.current.contains(e.target as Node))
        setAlignOpen(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node))
        setColorOpen(false);
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

  // Detect current font size from selection
  const currentFontSize =
    (editor?.getAttributes("textStyle")?.fontSize as string | undefined) ?? "";

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

  // Current text color
  const currentColor =
    (editor?.getAttributes("textStyle")?.color as string | undefined) ?? "";

  if (!editor) return null;

  return (
    <div className={cn("border rounded-md overflow-hidden bg-white", className)}>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-gray-50">

        {/* Font size */}
        <select
          title="Tamaño de fuente"
          value={currentFontSize}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const size = e.target.value;
            if (size) {
              editor.chain().focus().setFontSize(size).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          className="h-7 w-16 text-xs border border-gray-200 rounded bg-white text-gray-700 px-1 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
        >
          <option value="">Tam.</option>
          {FONT_SIZES.map(({ label, value: v }) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>

        <Divider />

        {/* Bold / Italic / Underline */}
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

        <Divider />

        {/* Text color */}
        <div className="relative shrink-0" ref={colorRef}>
          <button
            type="button"
            title="Color de texto"
            onMouseDown={(e) => {
              e.preventDefault();
              setColorOpen((o) => !o);
            }}
            className="h-7 w-7 flex flex-col items-center justify-center gap-0.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Baseline className="h-3.5 w-3.5" />
            {/* Color indicator bar */}
            <div
              className="w-4 h-1 rounded-sm"
              style={{ backgroundColor: currentColor || "#000000" }}
            />
          </button>

          {colorOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-white border rounded-md shadow-lg p-2">
              <div className="grid grid-cols-4 gap-1 mb-1.5">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().setColor(color).run();
                      setColorOpen(false);
                    }}
                    className={cn(
                      "w-6 h-6 rounded border border-gray-200 transition-transform hover:scale-110",
                      currentColor === color && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {/* Remove color */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetColor().run();
                  setColorOpen(false);
                }}
                className="w-full text-[10px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded py-0.5 transition-colors"
              >
                Sin color
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Link */}
        <ToolbarBtn
          active={editor.isActive("link")}
          onClick={setLink}
          title="Insertar enlace"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
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

        <Divider />

        {/* Alignment */}
        <div className="relative shrink-0" ref={alignRef}>
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
