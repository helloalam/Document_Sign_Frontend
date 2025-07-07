import React, { useRef, useLayoutEffect } from "react";

export default function DraggableResizableSignature({
  sig,
  updatePosition,
  updateSize,
  deleteSignature,
  pdfPageSize,
}) {
  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

  // Drag logic
  const onMouseDownDrag = (e) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - sig.position.x,
      y: e.clientY - sig.position.y,
    };
    document.addEventListener("mousemove", onMouseMoveDrag);
    document.addEventListener("mouseup", onMouseUpDrag);
  };
  const onMouseMoveDrag = (e) => {
    if (!isDragging.current) return;
    let x = e.clientX - dragOffset.current.x;
    let y = e.clientY - dragOffset.current.y;
    x = Math.max(0, Math.min(x, pdfPageSize.width - sig.size.width));
    y = Math.max(0, Math.min(y, pdfPageSize.height - sig.size.height));
    updatePosition(sig.id, { x, y });
  };
  const onMouseUpDrag = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", onMouseMoveDrag);
    document.removeEventListener("mouseup", onMouseUpDrag);
  };

  // Resize logic
  const onMouseDownResize = (e) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = {
      w: sig.size.width,
      h: sig.size.height,
      x: e.clientX,
      y: e.clientY,
    };
    document.addEventListener("mousemove", onMouseMoveResize);
    document.addEventListener("mouseup", onMouseUpResize);
  };
  const onMouseMoveResize = (e) => {
    if (!isResizing.current) return;
    let newWidth = resizeStart.current.w + (e.clientX - resizeStart.current.x);
    let newHeight = resizeStart.current.h + (e.clientY - resizeStart.current.y);
    newWidth = Math.max(40, Math.min(newWidth, pdfPageSize.width - sig.position.x));
    newHeight = Math.max(24, Math.min(newHeight, pdfPageSize.height - sig.position.y));
    updateSize(sig.id, { width: newWidth, height: newHeight });
  };
  const onMouseUpResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", onMouseMoveResize);
    document.removeEventListener("mouseup", onMouseUpResize);
  };

  // Auto-fit to text on mount
  const textRef = useRef(null);
  useLayoutEffect(() => {
    if (textRef.current && (!sig.size.width || !sig.size.height)) {
      const rect = textRef.current.getBoundingClientRect();
      updateSize(sig.id, {
        width: rect.width + 24,
        height: rect.height + 8,
      });
    }
    // eslint-disable-next-line
  }, [sig.text, sig.fontSize, sig.fontFamily]);

  return (
    <div
      ref={dragRef}
      onMouseDown={onMouseDownDrag}
      style={{
        position: "absolute",
        left: sig.position.x,
        top: sig.position.y,
        width: sig.size.width,
        height: sig.size.height,
        cursor: isResizing.current ? "nwse-resize" : "move",
        zIndex: 10,
        background: "#fff",
        border: "1px dashed #888",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        userSelect: "none",
        padding: 0,
      }}
    >
      {/* Signature text */}
      <span
        ref={textRef}
        style={{
          fontSize: sig.fontSize,
          fontFamily: sig.fontFamily,
          padding: "4px 10px",
          flex: 1,
          whiteSpace: "pre",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {sig.text}
      </span>

      {/* Delete icon (top right, away from resize handle) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteSignature(sig.id);
        }}
        style={{
          position: "absolute",
          top: 2,
          right: 22,
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: 20,
          height: 20,
          lineHeight: "20px",
          fontSize: 12,
          cursor: "pointer",
          zIndex: 20,
        }}
        title="Delete signature"
      >
        ✕
      </button>

      {/* Resize handle (bottom right) */}
      <div
        onMouseDown={onMouseDownResize}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 18,
          height: 18,
          background: "#eee",
          borderTop: "1px solid #bbb",
          borderLeft: "1px solid #bbb",
          cursor: "nwse-resize",
          zIndex: 20,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          padding: 2,
        }}
        title="Resize signature"
      >
        <svg width="12" height="12">
          <polyline
            points="0,12 12,12 12,0"
            style={{ fill: "none", stroke: "#888", strokeWidth: 2 }}
          />
        </svg>
      </div>
    </div>
  );
}
