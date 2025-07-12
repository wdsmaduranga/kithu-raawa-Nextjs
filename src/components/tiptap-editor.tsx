"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import { Youtube } from "@tiptap/extension-youtube"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  LinkIcon,
  ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Quote,
  Video,
} from "lucide-react"
import { ResizableImage } from "@/components/tiptap-resizable-image"

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: string
}

export default function TipTapEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = "",
  height = "400px",
}: TipTapEditorProps) {
  // Track mounted state to avoid hydration issues
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      ResizableImage, // Replace Image with ResizableImage
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline?.().run()
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run()
  const setTextAlignLeft = () => editor?.chain().focus().setTextAlign("left").run()
  const setTextAlignCenter = () => editor?.chain().focus().setTextAlign("center").run()
  const setTextAlignRight = () => editor?.chain().focus().setTextAlign("right").run()
  const setTextAlignJustify = () => editor?.chain().focus().setTextAlign("justify").run()
  const setHeading1 = () => editor?.chain().focus().toggleHeading({ level: 1 }).run()
  const setHeading2 = () => editor?.chain().focus().toggleHeading({ level: 2 }).run()
  const setHeading3 = () => editor?.chain().focus().toggleHeading({ level: 3 }).run()
  const undo = () => editor?.chain().focus().undo().run()
  const redo = () => editor?.chain().focus().redo().run()

  const addImage = () => {
    const url = window.prompt("Enter the URL of the image:")
    if (url) {
      editor?.chain().focus().setResizableImage({ src: url }).run()
    }
  }

  const addVideo = () => {
    const url = window.prompt("Enter YouTube video URL:")
    if (url) {
      editor?.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      })
    }
  }

  const addLink = () => {
    const url = window.prompt("Enter the URL:")
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  if (!mounted) {
    return (
      <div
        className={`h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md ${className}`}
        style={{ height }}
      ></div>
    )
  }

  return (
    <div className={`tiptap-editor ${className}`}>
      <div className="tiptap-toolbar flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-t-md">
        <button
          onClick={toggleBold}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Bold"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={toggleItalic}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Italic"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={toggleUnderline}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("underline") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Underline"
          type="button"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          onClick={toggleStrike}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("strike") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Strikethrough"
          type="button"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button
          onClick={setHeading1}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("heading", { level: 1 }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Heading 1"
          type="button"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={setHeading2}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Heading 2"
          type="button"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={setHeading3}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("heading", { level: 3 }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Heading 3"
          type="button"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button
          onClick={toggleBulletList}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Bullet List"
          type="button"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={toggleOrderedList}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Ordered List"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={toggleBlockquote}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Blockquote"
          type="button"
        >
          <Quote className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button
          onClick={setTextAlignLeft}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive({ textAlign: "left" }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Align Left"
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onClick={setTextAlignCenter}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive({ textAlign: "center" }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Align Center"
          type="button"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onClick={setTextAlignRight}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive({ textAlign: "right" }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Align Right"
          type="button"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          onClick={setTextAlignJustify}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive({ textAlign: "justify" }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Align Justify"
          type="button"
        >
          <AlignJustify className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button
          onClick={addLink}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Add Link"
          type="button"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          onClick={addImage}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Add Image"
          type="button"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          onClick={addVideo}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Add Video"
          type="button"
        >
          <Video className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button
          onClick={undo}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Undo"
          type="button"
          disabled={!editor?.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Redo"
          type="button"
          disabled={!editor?.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className={`border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-md overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
        style={{ height: `calc(${height} - 42px)` }}
      />
      <style jsx global>{`
        .ProseMirror {
          padding: 1rem;
          min-height: 100%;
          outline: none;
        }
        
        .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.875rem;
        }
        
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
        }
        
        .ProseMirror ol {
          list-style-type: decimal;
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .dark .ProseMirror blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
        }
        
        .ProseMirror iframe {
          max-width: 100%;
          height: auto;
        }

        .ProseMirror .youtube-video {
          text-align: center;
          margin: 1rem 0;
        }
        
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .dark .ProseMirror a {
          color: #3b82f6;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .dark .ProseMirror p.is-editor-empty:first-child::before {
          color: #6b7280;
        }

        .resizable-image-wrapper {
          display: inline-block;
          position: relative;
        }

        .resizable-image-wrapper img {
          user-select: none;
          -webkit-user-drag: none;
        }
      `}</style>
    </div>
  )
}
