import React, { useState } from "react";
import { FileIcon, Eye, Download, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DocumentList = ({ documents, theme }) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedFileUrl, setSelectedFileUrl] = useState("");

  const openEmailModal = (fileUrl) => {
    setSelectedFileUrl(fileUrl);
    setShowModal(true);
  };

  const sendEmail = async () => {
    if (!email) return toast.error("Email is required!");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/pdf/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: selectedFileUrl, toEmail: email }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Response not OK. HTML content:", text);
        return toast.error("Email sending failed. Check console.");
      }

      const data = await res.json();

      if (data.success) {
        toast.success("Email sent successfully!");
        setShowModal(false);
        setEmail("");
      } else {
        toast.error(data.message || "Failed to send email.");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      toast.error("Error sending email.");
    }
  };

  const handleRedirect = (doc) => {
    if (doc.documentId) {
      navigate(`/sign/${encodeURIComponent(doc.documentId)}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition hover:shadow-lg ${
              theme.bg === "bg-gray-900"
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center mb-4 sm:mb-0">
              <FileIcon className={`${theme.accent}`} size={28} />
              <div className="ml-4">
                <p className="font-medium">{doc.name || "Untitled Document"}</p>
                <span className={`text-xs font-semibold ${doc.statusColor}`}>
                  {doc.status}
                </span>
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
                <button
                  onClick={() => handleRedirect(doc)}
                  className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg transition"
                >
                  View & Retry
                </button>
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
                    disabled
                    className="px-4 py-2 bg-gray-300 text-white font-semibold rounded-lg cursor-not-allowed"
                  >
                    Completed
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
