import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users } from 'lucide-react';

const AssessmentPatient = () => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (selected) {
      localStorage.setItem('patientType', selected); // Save to localStorage
      navigate('/assessment/patientdetails');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Who is the survey for?</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Myself Option */}
        <button
          onClick={() => setSelected('myself')}
          className={`p-8 rounded-lg border-2 transition-all ${
            selected === 'myself'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <User 
              className={`w-16 h-16 mb-4 ${
                selected === 'myself' ? 'text-blue-500' : 'text-blue-400'
              }`}
            />
            <span className="text-lg font-medium text-gray-900">Myself</span>
          </div>
        </button>

        {/* Someone else Option */}
        <button
          onClick={() => setSelected('someone')}
          className={`p-8 rounded-lg border-2 transition-all ${
            selected === 'someone'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <Users 
              className={`w-16 h-16 mb-4 ${
                selected === 'someone' ? 'text-blue-500' : 'text-blue-400'
              }`}
            />
            <span className="text-lg font-medium text-gray-900">Someone else</span>
          </div>
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate('/assessment')}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`px-8 py-3 rounded-full font-medium transition-colors ${
            selected
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>

      <div className="mt-8">
        <button className="text-blue-500 text-sm hover:underline">
          Report an issue with this question
        </button>
      </div>
    </div>
  );
};

export default AssessmentPatient;