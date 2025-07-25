import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Document, Page, pdfjs } from "react-pdf";
import API from "../../utils/api";
import { AuthContext } from "../../components/context/AuthContext";
import DraggableResizableSignature from "./DraggableResizableSignature";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-toastify/dist/ReactToastify.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useContext(AuthContext);

  const [pdfUrl, setPdfUrl] = useState("");
  const [numPages, setNumPages] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [newSignature, setNewSignature] = useState("Signed by Me");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [page, setPage] = useState(1);
  const [pdfPageSize, setPdfPageSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [dimensionsReady, setDimensionsReady] = useState(false);
  const [originalPageSizes, setOriginalPageSizes] = useState([]);
  const [containerWidth, setContainerWidth] = useState(800);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (id) {
      setPdfUrl(`${process.env.REACT_APP_CLOUDINARY_BASE_URL}/${id}`);
    }
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setOriginalPageSizes(Array(numPages).fill({ width: 595, height: 842 }));
  };

  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    const newSizes = [...originalPageSizes];
    newSizes[page.pageNumber - 1] = {
      width: viewport.width,
      height: viewport.height,
    };
    setOriginalPageSizes(newSizes);
  };

  const onRenderSuccess = ({ width, height }) => {
    setPdfPageSize({ width, height });
    setDimensionsReady(true);
  };

  // Add Text Signature
  const addTextSignature = () => {
    if (!newSignature.trim()) return toast.error("Signature cannot be empty.");
    setSignatures((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "text",
        text: newSignature,
        fontSize,
        fontFamily,
        page,
        position: { x: 50, y: 50 },
        size: { width: 120, height: 40 },
      },
    ]);
    setNewSignature("");
  };

  // Add Image Signature
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result); // Data URL
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    e.target.value = null;
  };

  const addImageSignature = () => {
    if (!imagePreview) return toast.error("No image selected.");
    setSignatures((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "image",
        imageData: imagePreview, // Data URL
        page,
        position: { x: 50, y: 50 },
        size: { width: 120, height: 40 },
      },
    ]);
    setImagePreview(null);
    // Reset file input for next upload
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const updateSignaturePosition = (id, position) => {
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === id ? { ...sig, position } : sig))
    );
  };

  const updateSignatureSize = (id, size) => {
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === id ? { ...sig, size } : sig))
    );
  };

  const deleteSignature = (id) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== id));
    // Reset file input for next upload
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSign = async (status) => {
    if (!user || !user._id) return toast.error("User not authenticated.");
    if (!dimensionsReady) return toast.error("PDF not ready.");
    if (signatures.length === 0) return toast.error("Add at least one signature.");

    setLoading(true);
    try {
      for (const sig of signatures) {
        const originalSize = originalPageSizes[sig.page - 1];
        const scaleX = originalSize.width / pdfPageSize.width;
        const scaleY = originalSize.height / pdfPageSize.height;

        const payload = {
          pdfUrl,
          type: sig.type,
          page: sig.page,
          x: Math.round(sig.position.x * scaleX),
          y: Math.round(sig.position.y * scaleY),
          width: Math.round(sig.size.width * scaleX),
          height: Math.round(sig.size.height * scaleY),
          status,
          documentId: decodeURIComponent(id),
          userId: user._id,
        };

        if (sig.type === "text") {
          payload.text = sig.text;
          payload.fontSize = Math.round(sig.fontSize * scaleY);
          payload.fontFamily = sig.fontFamily;
        } else if (sig.type === "image") {
          payload.imageData = sig.imageData;
        }

        await API.post(`/pdf/sign/${encodeURIComponent(id)}`, payload);
      }

      toast.success(`Document ${status === "signed" ? "signed" : "rejected"} successfully!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 p-3 min-h-screen">
      {/* PDF Preview */}
      <div
        ref={containerRef}
        className="relative border bg-white shadow-md overflow-auto w-full lg:w-2/3"
        style={{ minHeight: "60vh" }}
      >
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page
            pageNumber={page}
            width={containerWidth - 16}
            onLoadSuccess={onPageLoadSuccess}
            onRenderSuccess={onRenderSuccess}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>

        {dimensionsReady &&
          signatures
            .filter((s) => s.page === page)
            .map((sig) => (
              <DraggableResizableSignature
                key={sig.id}
                sig={sig}
                isImage={sig.type === "image"}
                updatePosition={updateSignaturePosition}
                updateSize={updateSignatureSize}
                deleteSignature={deleteSignature}
                pdfPageSize={pdfPageSize}
              />
            ))}
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-1/3 mt-4 lg:mt-0 lg:pl-6 space-y-4">
        {/* Text Signature */}
        <div>
          <label className="block font-medium">New Text Signature</label>
          <input
            type="text"
            value={newSignature}
            onChange={(e) => setNewSignature(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="mt-2">
            <label className="text-sm text-gray-600">Preview:</label>
            <div
              className="border px-4 py-2 mt-1 rounded bg-white shadow-sm"
              style={{ fontFamily, fontSize, minHeight: "40px" }}
            >
              {newSignature || <span className="text-gray-400">Signature will appear here</span>}
            </div>
          </div>
          <button
            onClick={addTextSignature}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
          >
            Add Text Signature
          </button>
        </div>

        {/* Image Signature */}
        <div>
          <label className="block font-medium">Upload Image Signature</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="w-full border px-3 py-2 rounded"
          />
          {imagePreview && (
            <div className="mt-2">
              <label className="text-sm text-gray-600">Image Preview:</label>
              <div className="border px-4 py-2 mt-1 rounded bg-white shadow-sm flex items-center justify-center" style={{ minHeight: "40px" }}>
                <img src={imagePreview} alt="Signature Preview" style={{ maxHeight: 60, maxWidth: 200 }} />
              </div>
              <button
                onClick={addImageSignature}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
              >
                Add Image Signature
              </button>
            </div>
          )}
        </div>

        {/* Font and Page Controls */}
        <div>
          <label className="block font-medium">Font Family</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            {[
              "Arial", "Georgia", "Courier New", "Verdana", "Tahoma",
              "Times New Roman", "Lucida Console", "Garamond", "Trebuchet MS", "Impact"
            ].map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Font Size</label>
          <input
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Page</label>
          <select
            value={page}
            onChange={(e) => {
              setPage(Number(e.target.value));
              setDimensionsReady(false);
            }}
            className="w-full border px-3 py-2 rounded"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Page {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Sign/Reject Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => handleSign("signed")}
            disabled={loading || !dimensionsReady}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Signing..." : "Sign"}
          </button>
          <button
            onClick={() => handleSign("rejected")}
            disabled={loading || !dimensionsReady}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
