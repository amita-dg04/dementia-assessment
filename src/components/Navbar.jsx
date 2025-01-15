import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';
  // const isAssessment = location.pathname === '/assessment';
  // const isAssPatient = location.pathname === '/assessment/patient';
  // const isAssPatientDetails = location.pathname === '/assessment/patientdetails';

  return (
    <nav className="fixed top-0 w-full p-3 bg-[#deecfe] shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <path d="M20 12H4M4 12L10 6M4 12L10 18" />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">EarlyOnset</span>
            </NavLink>
          </div>

          {/* Only show navigation items if not on assessment page */}
          {/* {!isAssessment && !isAssPatient && !isAssPatientDetails && ( */}
          {isHome && (
            <>
              {/* Center navigation */}
              <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-2 p-1 rounded-full border-2 border-[#2c77e6] bg-[#2c77e6]">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white relative px-4 py-2 text-md transition-all rounded-full bg-gradient-to-r from-[#ffffff1a] to-[#ffffff1a] shadow-lg"
                      : "text-white px-4 py-2 text-md rounded-full hover:text-gray-300"
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white relative px-4 py-2 text-md transition-all rounded-full bg-gradient-to-r from-[#ffffff1a] to-[#ffffff1a] shadow-lg"
                      : "text-white px-4 py-2 text-md rounded-full hover:text-gray-300"
                  }
                >
                  About Us
                </NavLink>
              </nav>

              {/* Start Interview Button */}
              <nav className="ml-auto flex gap-2 p-1 rounded-full border-2 border-[#2c77e6] bg-[#2c77e6]">
                <NavLink
                  to="/assessment"
                  className="text-white px-4 py-2 text-md rounded-full hover:text-gray-300"
                >
                  Start Interview
                </NavLink>
              </nav>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;