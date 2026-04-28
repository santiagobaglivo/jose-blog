"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import type { JSONContent } from "@tiptap/core";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/shared/ImageUploader";

type RichTextEditorProps = {
  value?: JSONContent | null;
  onChange?: (json: JSONContent, html: string) => void;
  placeholder?: string;
  imageBucket?: string;
  imagePathPrefix?: string;
  className?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:text-foreground hover:bg-secondary/80",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-secondary text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-border/60" aria-hidden />;
}

type LinkDialogProps = {
  open: boolean;
  initialUrl: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
  onRemove: () => void;
};

function LinkDialog({ open, initialUrl, onOpenChange, onSubmit, onRemove }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setUrl(initialUrl);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insertar enlace</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rte-link-url">URL</Label>
          <Input
            id="rte-link-url"
            type="url"
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (url.trim()) onSubmit(url.trim());
              }
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          {initialUrl ? (
            <Button type="button" variant="ghost" onClick={onRemove}>
              Quitar enlace
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (url.trim()) onSubmit(url.trim());
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ImageDialogProps = {
  open: boolean;
  bucket: string;
  pathPrefix: string;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string) => void;
};

function ImageDialog({ open, bucket, pathPrefix, onOpenChange, onInsert }: ImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insertar imagen</DialogTitle>
        </DialogHeader>
        <ImageUploader
          bucket={bucket}
          path={(file) => {
            const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
            return `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          }}
          onUpload={(url) => {
            onInsert(url);
          }}
          label=""
          helperText="JPG, PNG o WEBP · máx 1 MB"
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Toolbar({
  editor,
  onOpenLink,
  onOpenImage,
}: {
  editor: Editor;
  onOpenLink: () => void;
  onOpenImage: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border/50 bg-secondary/20">
      <ToolbarButton
        label="Título 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Título 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Negrita"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Cursiva"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Lista con viñetas"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Cita"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Enlace"
        active={editor.isActive("link")}
        onClick={onOpenLink}
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Imagen" onClick={onOpenImage}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        label="Deshacer"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Rehacer"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Comience a escribir el contenido del artículo...",
  imageBucket = "post-images",
  imagePathPrefix = "content",
  className,
}: RichTextEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? undefined,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-premium min-h-[420px] px-5 py-4 focus:outline-none text-[0.9375rem] leading-relaxed",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange?.(instance.getJSON(), instance.getHTML());
    },
  });

  if (!editor) {
    return (
      <div
        className={cn(
          "bg-card border border-border/50 rounded-xl overflow-hidden min-h-[480px]",
          className
        )}
      />
    );
  }

  const handleSubmitLink = (url: string) => {
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  const handleInsertImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setImageOpen(false);
  };

  const currentLinkUrl =
    (editor.getAttributes("link").href as string | undefined) ?? "";

  return (
    <div
      className={cn(
        "bg-card border border-border/50 rounded-xl overflow-hidden",
        className
      )}
    >
      <Toolbar
        editor={editor}
        onOpenLink={() => setLinkOpen(true)}
        onOpenImage={() => setImageOpen(true)}
      />
      <EditorContent editor={editor} />
      <LinkDialog
        open={linkOpen}
        initialUrl={currentLinkUrl}
        onOpenChange={setLinkOpen}
        onSubmit={handleSubmitLink}
        onRemove={handleRemoveLink}
      />
      <ImageDialog
        open={imageOpen}
        bucket={imageBucket}
        pathPrefix={imagePathPrefix}
        onOpenChange={setImageOpen}
        onInsert={handleInsertImage}
      />
    </div>
  );
}
