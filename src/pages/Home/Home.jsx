import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../components/layout/loader";
import { AuthContext } from "../../components/context/AuthContext";
import { motion } from "framer-motion";

export default function Uploader() {
  const { user } = useContext(AuthContext);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      toast.error("Only PDF files are allowed.");
      setPdfFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return toast.error("Please select a PDF file.");

    const formData = new FormData();
    formData.append("file", pdfFile);

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/pdf/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.public_id) {
        toast.success("PDF uploaded successfully!");
        navigate(`/sign/${encodeURIComponent(data.public_id)}`);
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow-md rounded-xl w-full max-w-md p-6 relative overflow-hidden">
          {/* Animated Welcome */}
          {user?.name && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center text-lg font-semibold text-red-500 mb-2"
            >
              👋 Welcome, {user.name.split(" ")[0]}!
            </motion.div>
          )}

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Upload PDF File
          </h2>

          <form onSubmit={handleUpload} className="space-y-5">
            <label
              htmlFor="pdfInput"
              className="flex flex-col items-center justify-center border-2 border-dashed border-red-400 p-6 rounded-lg cursor-pointer hover:bg-red-50 transition"
            >
              <FaCloudUploadAlt className="text-red-500 text-4xl mb-2" />
              <p className="text-gray-700 text-sm">
                Click or drag to select a PDF
              </p>
              <input
                type="file"
                id="pdfInput"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {pdfFile && (
              <p className="text-sm text-center text-gray-600">
                📄 <strong>{pdfFile.name}</strong>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload PDF"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}