import React, { useState,useEffect } from "react";
import { FileIcon, Eye, Download, Send, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../utils/api"; // if not already imported

const DocumentList = ({ documents, theme }) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [localDocs, setLocalDocs] = useState(documents);
   // ✅ Sync localDocs with latest props
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

const handleDelete = async (docId) => {
  if (!window.confirm("Are you sure you want to delete this document?")) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found. Please login again.");
      return;
    }

    await API.delete(`/pdf/delete/${docId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLocalDocs(prev => prev.filter(d => d.documentId !== docId));
    toast.success("Document deleted");
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Failed to delete document"
    );
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
                    onClick={() => handleDelete(doc.documentId)}
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
                    onClick={() => handleDelete(doc.documentId)}
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
    </div>
  );
};

export default DocumentList;
