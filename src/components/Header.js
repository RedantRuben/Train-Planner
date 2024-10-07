import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRoute, FaTrain } from 'react-icons/fa';

function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-blue-600 shadow-md">
      <Link to="/" className="text-2xl font-bold flex items-center text-white">
        <FaRoute className="mr-2" />
        Train Stations
      </Link>
      <div className="flex space-x-6">
        <Link
          to="/journey-planner"
          className="flex items-center hover:text-gray-200 transition-colors duration-200 text-white"
        >
          <FaTrain className="mr-1" />
          Journey Planner
        </Link>
        <Link
          to="/favorites"
          className="flex items-center hover:text-gray-200 transition-colors duration-200 text-white"
        >
          <FaStar className="mr-1" /> Favorites
        </Link>
      </div>
    </header>
  );
}

export default Header;
