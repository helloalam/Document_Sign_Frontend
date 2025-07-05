// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Search, FileText, CheckCircle, Clock } from "lucide-react";
import StatCard from "../components/Dash/StarCard"; // make sure file name is correct
import DocumentList from "../components/Dash/DocumentList";
import API from "../utils/api";

const Dashboard = () => {
  const theme = "default";

  const themes = {
    default: {
      bg: "bg-gray-50",
      text: "text-gray-800",
      cardBg: "bg-white",
      accent: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const currentTheme = themes[theme];

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/pdf/list");
        setDocuments(res.data.files);
      } catch (err) {
        console.error("Failed to load documents", err);
      }
    })();
  }, []);

  const filteredDocs = documents.filter((doc) =>
    doc.documentId?.toLowerCase().includes(search.toLowerCase())
  );

  const mappedDocs = filteredDocs.map((doc) => ({
    name: doc.documentId || "Untitled.pdf",
    status: doc.status.toUpperCase(),
    documentId: doc.documentId,
    signedUrl: doc.signedUrl,
    statusColor:
      doc.status === "signed"
        ? "text-green-500"
        : doc.status === "rejected"
        ? "text-orange-500"
        : "text-red-500",
  }));

  const stats = {
    total: documents.length,
    signed: documents.filter((d) => d.status === "signed").length,
    pending: documents.filter((d) => d.status !== "signed").length,
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your documents and signatures.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<FileText size={24} className={currentTheme.accent} />} label="Total Documents" value={stats.total} theme={currentTheme} />
          <StatCard icon={<CheckCircle size={24} className="text-green-500" />} label="Signed Documents" value={stats.signed} theme={currentTheme} />
          <StatCard icon={<Clock size={24} className="text-orange-500" />} label="Pending" value={stats.pending} theme={currentTheme} />
        </div>

        {/* Search & Documents */}
        <div className={`p-6 rounded-lg shadow-sm ${currentTheme.cardBg}`}>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 border-gray-300"
            />
          </div>

          <DocumentList documents={mappedDocs} theme={currentTheme} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;