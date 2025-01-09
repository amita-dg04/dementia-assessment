import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Section5 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [assessmentId, setAssessmentId] = useState(null);
  const [answers, setAnswers] = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const correctWords = location.state?.selectedWords || [];

  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    if (id) {
      setAssessmentId(parseInt(id));
    } else {
      console.error('Assessment ID is missing in localStorage.');
    }
  }, []);

  const wordOptions = {
    0: ["Ball", "Bell", "Bill", "Bull"],
    1: ["Car", "Jar", "Tar", "Bar"],
    2: ["Man", "Fan", "Can", "Pan"],
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSubmit(); // Automatically submit when time runs out
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Try to submit all answers
      for (let i = 0; i < answers.length; i++) {
        const responseTime = (10 - timeLeft) * 1000;
        const isCorrect = answers[i] === correctWords[i];

        const responseData = {
          assessment_id: assessmentId,
          section_number: 5,
          question_number: i + 1,
          user_response: answers[i] || 'NO_ANSWER', // Handle empty answers
          is_correct: isCorrect,
          response_time: responseTime,
        };

        try {
          const response = await axios.post('http://localhost:4000/store_section_response', responseData);
          console.log('Response stored successfully:', response.data);
        } catch (error) {
          console.error('Error storing response for question', i + 1, ':', error.message);
          // Continue with other submissions even if one fails
        }
      }
    } catch (error) {
      console.error('Error in submission process:', error);
    } finally {
      setIsSubmitting(false);
      // Always navigate to next section, even if there were errors
      navigate('/assessment/section6');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recall Test</h2>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>

        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6">What were the three objects I asked you to remember?</h3>

        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-lg font-medium w-8">{index + 1}.</span>
              <div className="relative flex-1">
                <select
                  value={answers[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full p-4 border-2 rounded-lg text-lg bg-white focus:border-blue-500 focus:ring-blue-500 appearance-none"
                  disabled={isSubmitting}
                >
                  <option value="">Select word...</option>
                  {wordOptions[index].map((word) => (
                    <option key={word} value={word}>
                      {word}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || answers.includes('')}
        className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
          isSubmitting || answers.includes('')
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Submit Answers
      </button>
    </div>
  );
};

export default Section5;