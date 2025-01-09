import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const AssessmentBegin = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Now, we'll begin the assessment.</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Please make sure you are in a quiet environment, where you can stay undistracted for 30 minutes.</h2>
        <ul className="space-y-3">
          <li className="flex items-center text-gray-700">
            <Check className="w-5 h-5 text-blue-500 mr-2" />
            Check 1
          </li>
          <li className="flex items-center text-gray-700">
            <Check className="w-5 h-5 text-blue-500 mr-2" />
            Check 2
          </li>
          <li className="flex items-center text-gray-700">
            <Check className="w-5 h-5 text-blue-500 mr-2" />
            Check 3
          </li>
        </ul>
      </div>

      <button 
        onClick={() => navigate('/assessment/section1')}
        className="bg-blue-500 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
      >
        Begin
      </button>

    </div>
  );
};

export default AssessmentBegin;