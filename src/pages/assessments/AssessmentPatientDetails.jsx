import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import axios from 'axios';

// This is assigning data to variables that we can use ehre
const AssessmentPatientDetails = () => {
  const navigate = useNavigate();
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [patientType, setPatientType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  // This gets patient type from local storage; defaults to myself
  useEffect(() => {
    const type = localStorage.getItem('patientType');
    setPatientType(type || 'myself');
  }, []);

  // This helps calculate the running age based on user input
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

  // Once next is clicked, it sends the data to the backend
  const handleNext = async () => {
    setError(''); // Clear any previous errors
    
    // Trim the values first
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
  
    // Formats birthdate to have 2 digits for day/month and keeps the 4 digits for year
    const formattedDay = birthDate.day.padStart(2, '0');
    const formattedMonth = birthDate.month.padStart(2, '0');
    const formattedDate = `${birthDate.year}-${formattedMonth}-${formattedDay}`;
  
    // THE PACKET
    const patientData = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      patient_type: patientType || 'myself', // Provide default
      birth_date: formattedDate,
      sex: sex
    };

    // Then modify your axios call to include better error handling
    try {
      const response = await axios.post('http://localhost:4000/store_patient', patientData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.id) {
        localStorage.setItem('assessmentId', response.data.id);
        navigate('/assessment/begin'); // WHERE TO GO NEXT
      } else {
        console.error('Invalid server response:', response);
        setError('Invalid server response');
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Original patient data sent:', patientData);
      setError(error.response?.data?.error || 'Error saving patient data. Please try again.');
    }
};

// FRONT END COMPONENTS
  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* First and Last Name */}
      <div>
        <h1 className="text-3xl font-bold text-navy-900 mb-8">
          What is {patientType === 'myself' ? 'your' : 'their'} name?
        </h1>
        <div className="flex space-x-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="flex-1 p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
            placeholder="First Name"
            required
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="flex-1 p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
            placeholder="Last Name"
            required
          />
        </div>
      </div>

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
              required
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
              required
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
              required
            />
          </div>
        </div>
        {age && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
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
          disabled={!firstName || !lastName || !birthDate.day || !birthDate.month || !birthDate.year || !sex}
          className={`px-8 py-3 rounded-full font-medium transition-colors ${
            firstName && lastName && birthDate.day && birthDate.month && birthDate.year && sex
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AssessmentPatientDetails;