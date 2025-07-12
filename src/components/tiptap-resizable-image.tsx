"use client"

import type React from "react"

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react"
import { useState, useRef, useEffect } from "react"

interface ResizableImageProps {
  node: {
    attrs: {
      src: string
      alt?: string
      title?: string
      width?: number
      height?: number
    }
  }
  updateAttributes: (attrs: any) => void
  selected: boolean
}

const ResizableImageComponent = ({ node, updateAttributes, selected }: ResizableImageProps) => {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeHandle(handle)

    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeHandle) return

      const deltaX = e.clientX - startPos.current.x
      const deltaY = e.clientY - startPos.current.y

      let newWidth = startPos.current.width
      let newHeight = startPos.current.height

      switch (resizeHandle) {
        case "se": // bottom-right
          newWidth = startPos.current.width + deltaX
          newHeight = startPos.current.height + deltaY
          break
        case "sw": // bottom-left
          newWidth = startPos.current.width - deltaX
          newHeight = startPos.current.height + deltaY
          break
        case "ne": // top-right
          newWidth = startPos.current.width + deltaX
          newHeight = startPos.current.height - deltaY
          break
        case "nw": // top-left
          newWidth = startPos.current.width - deltaX
          newHeight = startPos.current.height - deltaY
          break
        case "e": // right
          newWidth = startPos.current.width + deltaX
          break
        case "w": // left
          newWidth = startPos.current.width - deltaX
          break
        case "s": // bottom
          newHeight = startPos.current.height + deltaY
          break
        case "n": // top
          newHeight = startPos.current.height - deltaY
          break
      }

      // Maintain aspect ratio when dragging corners
      if (["se", "sw", "ne", "nw"].includes(resizeHandle)) {
        const aspectRatio = startPos.current.width / startPos.current.height
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio
        } else {
          newWidth = newHeight * aspectRatio
        }
      }

      // Minimum size constraints
      newWidth = Math.max(50, newWidth)
      newHeight = Math.max(50, newHeight)

      updateAttributes({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeHandle(null)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, resizeHandle, updateAttributes])

  return (
    <NodeViewWrapper className="resizable-image-wrapper">
      <div
        ref={containerRef}
        className={`relative inline-block ${selected ? "ring-2 ring-blue-500" : ""}`}
        style={{
          width: node.attrs.width || "auto",
          height: node.attrs.height || "auto",
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src || "/placeholder.svg"}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className="block max-w-full h-auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          draggable={false}
        />

        {selected && (
          <>
            {/* Corner handles */}
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize -top-1 -left-1 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "nw")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize -top-1 -right-1 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "ne")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize -bottom-1 -left-1 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "sw")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize -bottom-1 -right-1 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "se")}
            />

            {/* Edge handles */}
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-n-resize -top-1 left-1/2 transform -translate-x-1/2 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "n")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-s-resize -bottom-1 left-1/2 transform -translate-x-1/2 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "s")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-w-resize -left-1 top-1/2 transform -translate-y-1/2 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "w")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-e-resize -right-1 top-1/2 transform -translate-y-1/2 rounded-full shadow-sm"
              onMouseDown={(e) => handleMouseDown(e, "e")}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Node.create({
  name: "resizableImage",

  group: "inline",

  inline: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },

  addCommands() {
    return {
      setResizableImage:
        (options: any) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
