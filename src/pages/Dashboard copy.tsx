import React from "react";
import logo from "../assets/cisec-logo.png";

const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      {/* Header with logo and new title */}
      <div className="flex items-center gap-4 mb-6">
        <img src={logo} alt="CISEC Logo" className="h-12 w-auto" />
        <h1 className="text-2xl font-bold text-white">Cancún CISEC</h1>
      </div>

      {/* TODO: insert the rest of your dashboard content here */}
    </div>
  );
};

export default Dashboard;
