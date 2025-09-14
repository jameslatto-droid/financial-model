import React from "react";
import logo from "../assets/cisec-logo.png";

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-900 shadow-md p-4">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        <img src={logo} alt="CISEC Logo" className="h-12 w-auto" />
        <h1 className="text-2xl font-bold text-white">Cancún CISEC</h1>
      </div>
    </header>
  );
};

export default Header;
