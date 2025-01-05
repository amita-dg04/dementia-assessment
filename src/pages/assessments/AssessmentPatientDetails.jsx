import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import axios from 'axios';

const AssessmentPatientDetails = () => {
  const navigate = useNavigate();
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [patientType, setPatientType] = useState(''); // State for patient type

  // Fetch patientType from localStorage on component mount
  useEffect(() => {
    const type = localStorage.getItem('patientType');
    setPatientType(type || 'myself'); // Default to "myself" if no value is found
  }, []);

  // Calculate age whenever birthDate changes
  useEffect(() => {
    if (birthDate.day && birthDate.month && birthDate.year) {
      const birthDateObj = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
      const today = new Date();
      const yearDiff = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      const dayDiff = today.getDate() - birthDateObj.getDate();

      let years = yearDiff;
      let months = monthDiff;
      let days = dayDiff;

      if (dayDiff < 0) {
        months--;
        days += 30;
      }
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        years--;
        months += 12;
      }

      setAge(`Age: ${years} years, ${months} months, ${days} days`);
    }
  }, [birthDate]);

  const handleNext = async () => {
    if (birthDate.day && birthDate.month && birthDate.year && sex) {
      // Combine all data to send to the backend
      const patientData = {
        patient_type: patientType,
        birth_date: `${birthDate.year}-${birthDate.month}-${birthDate.day}`,
        sex,
      };

      try {
        // Send data to the backend
        const response = await axios.post('http://localhost:4000/store_patient', patientData);
        console.log('Sending to backend:', patientData);
        const id = response.data.id;

        // Save the assessment ID for later use
        localStorage.setItem('assessmentId', id);

        // Navigate to the next step
        navigate('/assessment/begin');
      } catch (error) {
        console.error('Error saving patient data:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Sex Selection */}
      <div>
        <h1 className="text-3xl font-bold text-navy-900 mb-8">
          What sex was originally listed on {patientType === 'myself' ? 'your' : 'their'} birth certificate?
        </h1>

        <div className="grid grid-cols-2 gap-6">
          {['Female', 'Male'].map((option) => (
            <button
              key={option}
              onClick={() => setSex(option)}
              className={`p-8 rounded-lg border-2 transition-all ${
                sex === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-blue-500 text-4xl">
                  {option === 'Female' ? '♀' : '♂'}
                </div>
                <span className="text-lg text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-navy-900 mb-8">
          What is {patientType === 'myself' ? 'your' : 'their'} date of birth?
        </h2>
        
        <div className="flex space-x-4 items-start">
          <div className="space-y-2">
            <label className="block text-gray-600">Day</label>
            <input
              type="text"
              maxLength="2"
              value={birthDate.day}
              onChange={(e) => setBirthDate({ ...birthDate, day: e.target.value })}
              className="w-24 p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="07"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-600">Month</label>
            <input
              type="text"
              maxLength="2"
              value={birthDate.month}
              onChange={(e) => setBirthDate({ ...birthDate, month: e.target.value })}
              className="w-24 p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="03"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-600">Year</label>
            <input
              type="text"
              maxLength="4"
              value={birthDate.year}
              onChange={(e) => setBirthDate({ ...birthDate, year: e.target.value })}
              className="w-32 p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="2021"
            />
          </div>

          <button className="mt-8 p-4 rounded-full bg-white border-2 border-gray-200 hover:border-blue-200">
            <Calendar className="w-6 h-6 text-blue-500" />
          </button>
        </div>

        {age && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg flex items-center">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">
              ✓
            </div>
            {age}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-12">
        <button
          onClick={() => navigate('/assessment/patient')}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!birthDate.day || !birthDate.month || !birthDate.year || !sex}
          className={`px-8 py-3 rounded-full font-medium transition-colors ${
            birthDate.day && birthDate.month && birthDate.year && sex
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>

      {/* Report Issue Button */}
      <div className="mt-8">
        <button className="text-blue-500 text-sm hover:underline">
          Report an issue with this question
        </button>
      </div>
    </div>
  );
};

export default AssessmentPatientDetails;
