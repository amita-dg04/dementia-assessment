import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Section6 = () => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);

  // Get assessment ID from localStorage
  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    if (id) {
      setAssessmentId(parseInt(id));
    } else {
      console.error('Assessment ID is missing in localStorage.');
    }
  }, []);

  useEffect(() => {
    let timer;
    if (!isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const validateAnswer = (userAnswer) => {
    const acceptedAnswers = ['watch', 'wristwatch'];
    return acceptedAnswers.includes(userAnswer.toLowerCase().trim());
  };

  const handleSubmit = async () => {
    if (isSubmitted || !assessmentId) return;
    setIsSubmitted(true);

    try {
      const userAnswer = answer.trim() || 'NO_ANSWER';
      const isCorrect = validateAnswer(userAnswer);
      const responseTime = (10 - timeLeft) * 1000;

      const responseData = {
        assessment_id: assessmentId,
        section_number: 6,
        question_number: 1,
        user_response: userAnswer,
        is_correct: isCorrect,
        response_time: responseTime,
      };

      console.log('Submitting response:', responseData);
      
      // Send data to backend
      const response = await axios.post('http://localhost:4000/store_section_response', responseData);
      console.log('Response stored successfully:', response.data);

      // Navigate to next section after a short delay
      setTimeout(() => {
        navigate('/assessment/section7');
      }, 1500);

    } catch (error) {
      console.error('Error storing response:', error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Object Recognition</h2>
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
        <div className="flex justify-center mb-6">
          <img
            src="/wristwatch.jpg"
            alt="Wristwatch"
            className="rounded-lg shadow-lg mb-6"
          />
        </div>
        
        <h3 className="text-2xl font-bold mb-6">
          What is this called? (watch your spelling!)
        </h3>

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
          placeholder="Type your answer here..."
          disabled={isSubmitted}
          autoFocus
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitted || !answer.trim()}
        className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
          isSubmitted || !answer.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Submit
      </button>
    </div>
  );
};

export default Section6;