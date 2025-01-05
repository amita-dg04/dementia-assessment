import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Section5 = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(['', '', '']);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentInput, setCurrentInput] = useState(0);
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

  const handleInputChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleKeyDown = (e, index) => {
    // Move to next input only on Enter key press
    if (e.key === 'Enter' && index < 2) {
      e.preventDefault(); // Prevent form submission
      setCurrentInput(index + 1);
    }
    // Move to previous input on Backspace if current input is empty
    else if (e.key === 'Backspace' && !answers[index] && index > 0) {
      setCurrentInput(index - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/assessment/section6');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer */}
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

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6">
          What were the three objects I asked you to remember?
        </h3>

        <div className="space-y-4">
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-lg font-medium w-8">{index + 1}.</span>
              <input
                type="text"
                value={answer}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setCurrentInput(index)}
                ref={index === currentInput ? (input) => input?.focus() : null}
                className="flex-1 p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
                placeholder="Type word here..."
                disabled={isSubmitted}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitted}
        className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
          isSubmitted
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Submit
      </button>

      <div className="mt-4 text-center text-gray-500">
        Press Enter to move to the next word
      </div>
    </div>
  );
};

export default Section5;