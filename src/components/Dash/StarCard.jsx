// src/components/StatCard.jsx
import React from "react";

const StatCard = ({ icon, label, value, theme }) => (
  <div className={`${theme.cardBg} p-6 rounded-lg shadow-sm flex items-center space-x-4 hover:shadow-md transition`}>
    <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default StatCard;