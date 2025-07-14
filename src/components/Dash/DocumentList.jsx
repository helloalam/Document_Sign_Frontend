import React, { useState, useEffect } from "react";
import { FileIcon, Eye, Download, Send, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../utils/api";

const DocumentList = ({ documents, theme, onDocumentDelete }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [localDocs, setLocalDocs] = useState(documents);

  useEffect(() => {
    setLocalDocs(documents);
  }, [documents]);

  const openEmailModal = (fileUrl) => {
    setSelectedFileUrl(fileUrl);
    setShowModal(true);
  };

  const sendEmail = async () => {
    if (!email) return toast.error("Email is required!");
    try {
      const res = await API.post("/pdf/email", {
        fileUrl: selectedFileUrl,
        toEmail: email,
      });

      if (res.data.success) {
        toast.success("Email sent!");
        setShowModal(false);
        setEmail("");
      } else toast.error(res.data.message || "Failed to send email");
    } catch (err) {
      toast.error("Error sending email");
    }
  };

  const handleRedirect = (doc) => {
    if (doc.documentId) navigate(`/sign/${encodeURIComponent(doc.documentId)}`);
  };

  const confirmDelete = (docId) => {
    setConfirmDeleteId(docId);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem("token");
      const encodedId = encodeURIComponent(confirmDeleteId);

      await API.delete(`/pdf/delete/${encodedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updated = localDocs.filter(d => d.documentId !== confirmDeleteId);
      setLocalDocs(updated);
      if (onDocumentDelete) onDocumentDelete(confirmDeleteId); // notify parent

      toast.success("Document deleted");
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete document");
      console.error("Delete error:", err?.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
      <div className="space-y-4">
        {localDocs.map((doc, index) => (
          <div
            key={index}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition hover:shadow-lg ${
              theme.bg === "bg-gray-900"
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
              <FileIcon className={`${theme.accent}`} size={28} />
              <div>
                <p className="font-medium">{doc.name || "Untitled Document"}</p>
                <p className={`text-xs font-semibold ${doc.statusColor}`}>
                  {doc.status}
                </p>
                {doc.timestamp && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(doc.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {doc.status === "NEEDS TO SIGN" && (
                <button
                  onClick={() => handleRedirect(doc)}
                  className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg transition"
                >
                  Sign Now
                </button>
              )}

              {doc.status === "REJECTED" && (
                <>
                  <button
                    onClick={() => handleRedirect(doc)}
                    className="px-4 py-2 bg-red-400 hover:bg-orange-500 text-white font-semibold rounded-lg transition"
                  >
                    View & Retry
                  </button>
                  <button
                    onClick={() => confirmDelete(doc.documentId)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Document"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}

              {doc.status === "SIGNED" && (
                <>
                  <a
                    href={doc.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                    title="Preview"
                  >
                    <Eye size={20} />
                  </a>
                  <a
                    href={doc.signedUrl}
                    download
                    className="text-green-500 hover:text-green-700"
                    title="Download"
                  >
                    <Download size={20} />
                  </a>
                  <button
                    onClick={() => openEmailModal(doc.signedUrl)}
                    className="text-orange-500 hover:text-orange-700"
                    title="Send via Email"
                  >
                    <Send size={20} />
                  </button>
                  <button
                    onClick={() => confirmDelete(doc.documentId)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Document"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Email Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
            <h3 className="text-lg font-semibold mb-4">Send Signed PDF</h3>
            <input
              type="email"
              placeholder="Recipient email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-sm mb-6">Are you sure you want to delete this document?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
