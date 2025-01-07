import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Section9 = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [showShapes, setShowShapes] = useState(false);
  const [instructionTimeLeft, setInstructionTimeLeft] = useState(10);
  const [selectedShape, setSelectedShape] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  
  const shapes = [
    { name: "blue square", element: <rect width="60" height="60" fill="#3B82F6" />, id: 1 },
    { name: "green circle", element: <circle r="30" cx="30" cy="30" fill="#22C55E" />, id: 2 },
    { name: "red triangle", element: <path d="M30 0 L60 60 L0 60 Z" fill="#EF4444" />, id: 3 },
    { name: "blue triangle", element: <path d="M30 0 L60 60 L0 60 Z" fill="#3B82F6" />, id: 4 },
    { name: "red pentagon", element: <path d="M30 0 L60 22 L48 57 L12 57 L0 22 Z" fill="#EF4444" />, id: 5 }
  ];

  const [targetShape, setTargetShape] = useState(null);
  const [shuffledShapes, setShuffledShapes] = useState([]);

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
    // Randomly select target shape and shuffle options
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    setTargetShape(randomShape);
    
    const shuffled = [...shapes].sort(() => Math.random() - 0.5);
    setShuffledShapes(shuffled);

    // Main 30-second timer
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

  useEffect(() => {
    // 10-second instruction timer
    const instructionTimer = setInterval(() => {
      setInstructionTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(instructionTimer);
          setShowShapes(true);
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(instructionTimer);
  }, []);

  const handleSubmit = async () => {
    if (isSubmitted || !assessmentId) return;
    setIsSubmitted(true);

    try {
      const userAnswer = selectedShape?.name || 'NO_ANSWER';
      const isCorrect = selectedShape?.id === targetShape?.id;
      const responseTime = (30 - timeLeft) * 1000;

      const responseData = {
        assessment_id: assessmentId,
        section_number: 9,
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
        navigate('/assessment/section10');
      }, 1500);

    } catch (error) {
      console.error('Error storing response:', error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Shape Selection</h2>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Initial Instructions */}
      {!showShapes && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-center mb-6">
            Read the words on the page, and then do what it says
          </h3>
          <div className="text-lg font-semibold text-center text-blue-600">
            {instructionTimeLeft}s
          </div>
        </div>
      )}

      {/* Shape Selection Screen */}
      {showShapes && targetShape && (
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">
            Select the {targetShape.name}
          </h3>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            {shuffledShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => !isSubmitted && setSelectedShape(shape)}
                className={`p-8 rounded-lg border-2 transition-colors flex items-center justify-center bg-white
                  ${isSubmitted ? 'cursor-not-allowed' : 'hover:border-blue-500'}
                  ${selectedShape?.id === shape.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                disabled={isSubmitted}
              >
                <svg width="60" height="60" viewBox="0 0 60 60">
                  {shape.element}
                </svg>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitted || !selectedShape}
            className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
              isSubmitted || !selectedShape
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Section9;