import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Section6 = () => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/assessment/section7');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer */}
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

      {/* Image and Question */}
      <div className="mb-8">
        <div className="flex justify-center mb-6">
          <img
            src="/api/placeholder/300/300"
            alt="Wristwatch"
            className="rounded-lg shadow-lg mb-6"
          />
        </div>
        
        <h3 className="text-2xl font-bold mb-6">
          What is this called?
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

      {/* Submit Button */}
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