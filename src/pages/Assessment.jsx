import React from 'react';
import { useLocation, Link, Routes, Route } from 'react-router-dom'; 
import AssessmentIntro from './assessments/AssessmentIntro';
import AssessmentPatient from './assessments/AssessmentPatient';
import AssessmentPatientDetails from './assessments/AssessmentPatientDetails';
import AssessmentBegin from './assessments/AssessmentBegin';
import Section1 from './assessments/Section1';
import Section2 from './assessments/Section2';
import Section3 from './assessments/Section3';
import Section4 from './assessments/Section4';
import Section5 from './assessments/Section5';
import Section6 from './assessments/Section6';
import Section7 from './assessments/Section7';
import Section8 from './assessments/Section8';
import Section9 from './assessments/Section9';
import Section10 from './assessments/Section10';
import Section11 from './assessments/Section11';
import Section12 from './assessments/Section12';
import Results from './assessments/Results';


const Assessment = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const navItems = [
    { name: 'Introduction', path: '/assessment', id: 'assessment' },
    { name: 'Patient', path: '/assessment/patient', id: 'patient' },
    { name: 'Patient Details', path: '/assessment/patientdetails', id: 'patientdetails' },
    { name: 'Begin Assessment', path: '/assessment/begin', id: 'begin' },
    { name: 'Section 1', path: '/assessment/section1', id: 'section1' },
    { name: 'Section 2', path: '/assessment/section2', id: 'section2' },
    { name: 'Section 3', path: '/assessment/section3', id: 'section3' },
    { name: 'Section 4', path: '/assessment/section4', id: 'section4' },
    { name: 'Section 5', path: '/assessment/section5', id: 'section5' },
    { name: 'Section 6', path: '/assessment/section6', id: 'section6' },
    { name: 'Section 7', path: '/assessment/section7', id: 'section7' },
    { name: 'Section 8', path: '/assessment/section8', id: 'section8' },
    { name: 'Section 9', path: '/assessment/section9', id: 'section9' },
    { name: 'Section 10', path: '/assessment/section10', id: 'section10'},
    { name: 'Section 11', path: '/assessment/section11', id: 'section11'},
    { name: 'Section 12', path: '/assessment/section12', id: 'section12'},
    { name: 'Results', path: '/assessment/results', id: 'results' }
  ];

  // Find the index of the current page
  const currentIndex = navItems.findIndex(item => item.id === currentPath || 
    (currentPath === '' && item.id === 'assessment'));

  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      {/* Left Sidebar - Made narrower */}
      <div className="w-48 p-6 relative">
        {/* Navigation Container */}
        <nav className="space-y-6 relative">
          {/* Progress Bar - Repositioned */}
          <div className="absolute left-0 top-1 bottom-1 w-1 bg-gray-100">
            <div 
              className="w-1 bg-blue-600 transition-all duration-300"
              style={{
                height: `${((currentIndex + 1) / navItems.length) * 100}%`
              }}
            />
          </div>

        
          {navItems.map((item, index) => {
            const isActive = item.id === currentPath || 
              (currentPath === '' && item.id === 'assessment');
            const isPast = index < currentIndex;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block pl-6 transition-colors relative ${
                  isActive 
                    ? 'text-blue-600 font-semibold' 
                    : isPast 
                      ? 'text-blue-600'
                      : 'text-gray-400'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <Routes>
            <Route path="/" element={<AssessmentIntro />} />
            <Route path="/patient" element={<AssessmentPatient />} />
            <Route path="/patientdetails" element={<AssessmentPatientDetails />} />
            <Route path="/begin" element={<AssessmentBegin />} />
            <Route path="/section1" element={<Section1 />} />
            <Route path="/section2" element={<Section2 />} />
            <Route path="/section3" element={<Section3 />} />
            <Route path="/section4" element={<Section4 />} />
            <Route path="/section5" element={<Section5 />} />
            <Route path="/section6" element={<Section6 />} />
            <Route path="/section7" element={<Section7 />} />
            <Route path="/section8" element={<Section8 />} />
            <Route path="/section9" element={<Section9 />} />
            <Route path="/section10" element={<Section10 />} />
            <Route path="/section11" element={<Section11 />} />
            <Route path="/section12" element={<Section12 />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Assessment;