/**
 * components/resources/ResourceViewer.jsx
 *
 * Renders the right player for the resource's type:
 *   - PDF: native <embed>/<iframe> via the browser's built-in viewer for
 *     the MVP (swap for PDF.js — see spec section 6 — if more control
 *     over zoom/search/page nav controls is needed later).
 *   - Video/Audio: native HTML5 <video>/<audio> elements (per spec).
 *   - Image: simple zoomable <img> with rotate control.
 *   - Other types (DOCX/PPTX/XLSX): offered as a direct download, since
 *     browsers can't render these natively without a conversion service.
 */
import { useState } from "react";
import { RotateCw, ZoomIn, ZoomOut, FileQuestion } from "lucide-react";
import Button from "../ui/Button";

export default function ResourceViewer({ resource }) {
  const fileUrl = resource.file;

  switch (resource.resource_type) {
    case "PDF":
      return (
        <div className="w-full h-[70vh] bg-ink-50 rounded-card overflow-hidden border border-ink-100">
          <embed src={fileUrl} type="application/pdf" className="w-full h-full" />
        </div>
      );
    case "VIDEO":
      return (
        <video
          src={fileUrl}
          controls
          className="w-full rounded-card bg-ink-900 max-h-[70vh]"
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      );
    case "AUDIO":
      return (
        <div className="bg-ink-50 rounded-card p-6 border border-ink-100">
          <audio src={fileUrl} controls className="w-full">
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    case "IMAGE":
      return <ImageViewer src={fileUrl} alt={resource.title} />;
    default:
      return (
        <div className="bg-ink-50 rounded-card border border-ink-100 p-10 flex flex-col items-center text-center">
          <FileQuestion size={32} className="text-ink-400 mb-3" />
          <p className="text-ink-700 font-medium mb-1">Preview not available in-browser</p>
          <p className="text-ink-500 text-sm mb-4">
            This file type opens best in its native app. Download it to view.
          </p>
          <Button as="a" href={fileUrl} download>
            Download to view
          </Button>
        </div>
      );
  }
}

function ImageViewer({ src, alt }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="bg-ink-50 rounded-card border border-ink-100 overflow-hidden">
      <div className="flex items-center justify-end gap-2 p-2 border-b border-ink-100 bg-white">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          className="p-1.5 text-ink-600 hover:bg-ink-50 rounded-card"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          className="p-1.5 text-ink-600 hover:bg-ink-50 rounded-card"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="p-1.5 text-ink-600 hover:bg-ink-50 rounded-card"
          aria-label="Rotate"
        >
          <RotateCw size={16} />
        </button>
      </div>
      <div className="overflow-auto max-h-[60vh] flex items-center justify-center p-6">
        <img
          src={src}
          alt={alt}
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          className="transition-transform duration-150 max-w-full"
        />
      </div>
    </div>
  );
}
