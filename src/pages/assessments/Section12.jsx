import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Section12 = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [currentPart, setCurrentPart] = useState(1);
  
  // Part 1 states
  const [targetClicks, setTargetClicks] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [part1Complete, setPart1Complete] = useState(false);
  const [part1Correct, setPart1Correct] = useState(false);

  // Part 2 states
  const [currentNumber, setCurrentNumber] = useState(null);
  const [part2Clicks, setPart2Clicks] = useState(0);
  const [part2Correct, setPart2Correct] = useState(0);
  const [part2Wrong, setPart2Wrong] = useState(0);
  const [part2Complete, setPart2Complete] = useState(false);

  // Part 3 states
  const [squareColor, setSquareColor] = useState('gray');
  const [part3Correct, setPart3Correct] = useState(0);
  const [part3Wrong, setPart3Wrong] = useState(0);
  const [part3Complete, setPart3Complete] = useState(false);
  const [isSquareActive, setIsSquareActive] = useState(false);

  // Get assessment ID from localStorage
  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    if (id) {
      setAssessmentId(parseInt(id));
    } else {
      console.error('Assessment ID is missing in localStorage.');
    }

    // Generate random number of clicks needed for part 1
    setTargetClicks(Math.floor(Math.random() * 15) + 1);
  }, []);

  // Main timer
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

  // Part timing management
  useEffect(() => {
    if (timeLeft <= 40 && currentPart === 1 && !part1Complete) {
      // Force complete part 1 if time runs out
      setPart1Complete(true);
      setPart1Correct(clickCount === targetClicks);
      setCurrentPart(2);
    }
    if (timeLeft <= 20 && currentPart === 2 && !part2Complete) {
      // Force complete part 2 if time runs out
      setPart2Complete(true);
      setCurrentPart(3);
    }
  }, [timeLeft, currentPart, part1Complete, part2Complete, clickCount, targetClicks]);

  useEffect(() => {
    if (currentPart === 2 && !part2Complete && timeLeft > 20) {
      // Initial number display
      setCurrentNumber(Math.floor(Math.random() * 9) + 1);
      
      // Set up interval for cycling numbers
      const numberInterval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 9) + 1);
      }, 4500); // Slowed down to 2.5 seconds

      return () => {
        clearInterval(numberInterval);
        setCurrentNumber(null);
      };
    }
  }, [currentPart, part2Complete, timeLeft]);

  // Part 3 square color changer
  useEffect(() => {
    let colorInterval;
    if (currentPart === 3 && !part3Complete) {
      colorInterval = setInterval(() => {
        const shouldTurnGreen = Math.random() < 0.5; // 50% chance to turn green
        setSquareColor(shouldTurnGreen ? 'green' : 'red');
        setIsSquareActive(true);
        
        // Reset square after 3 seconds
        setTimeout(() => {
          setSquareColor('gray');
          setIsSquareActive(false);
        }, 3000);
      }, 4000);
    }
    return () => clearInterval(colorInterval);
  }, [currentPart, part3Complete]);

  const handlePart1Click = () => {
    if (part1Complete) return;
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === targetClicks) {
      setPart1Complete(true);
      setPart1Correct(true);
      setCurrentPart(2);
    } else if (newCount > targetClicks) {
      setPart1Complete(true);
      setPart1Correct(false);
      setCurrentPart(2);
    }
  };

  const handlePart2Click = () => {
    if (part2Complete) return;
    
    if (currentNumber === 5) {
      setPart2Correct(prev => prev + 1);
    } else {
      setPart2Wrong(prev => prev + 1);
    }
    
    setPart2Clicks(prev => {
      const newClicks = prev + 1;
      if (newClicks >= 10) {  // Complete after 10 attempts
        setPart2Complete(true);
        setCurrentPart(3);
      }
      return newClicks;
    });
  };

  const handlePart3Click = () => {
    if (!isSquareActive || part3Complete) return;
    
    if (squareColor === 'green') {
      setPart3Correct(prev => prev + 1);
    } else {
      setPart3Wrong(prev => prev + 1);
    }

    setIsSquareActive(false);
    
    // Complete part 3 after 5 attempts
    if (part3Correct + part3Wrong >= 4) {
      setPart3Complete(true);
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted || !assessmentId) return;
    setIsSubmitted(true);

    try {
      // Submit data for Part 1 - Exact Click Count
      const part1Response = {
        assessment_id: assessmentId,
        section_number: 12,
        question_number: 1,
        user_response: JSON.stringify({
          targetClicks,
          actualClicks: clickCount
        }),
        is_correct: part1Correct,
        response_time: (60 - timeLeft) * 1000
      };

      // Submit data for Part 2 - Number 5 Detection
      const part2Response = {
        assessment_id: assessmentId,
        section_number: 12,
        question_number: 2,
        user_response: JSON.stringify({
          correct: part2Correct,
          wrong: part2Wrong,
          total: part2Clicks
        }),
        is_correct: part2Correct / (part2Correct + part2Wrong) >= 0.7, // 70% accuracy threshold
        response_time: (60 - timeLeft) * 1000
      };

      // Submit data for Part 3 - Color Detection
      const part3Response = {
        assessment_id: assessmentId,
        section_number: 12,
        question_number: 3,
        user_response: JSON.stringify({
          correct: part3Correct,
          wrong: part3Wrong,
          total: part3Correct + part3Wrong
        }),
        is_correct: part3Correct / (part3Correct + part3Wrong) >= 0.7, // 70% accuracy threshold
        response_time: (60 - timeLeft) * 1000
      };

      // Send all responses to backend
      await Promise.all([
        axios.post('http://localhost:4000/store_section_response', part1Response),
        axios.post('http://localhost:4000/store_section_response', part2Response),
        axios.post('http://localhost:4000/store_section_response', part3Response)
      ]);

      console.log('All responses stored successfully');

      setTimeout(() => {
        navigate('/assessment/results');
      }, 1500);

    } catch (error) {
      console.error('Error storing responses:', error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Attention Test</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              {currentPart === 1 && "Part 1: Click Count"}
              {currentPart === 2 && "Part 2: Find Number 5"}
              {currentPart === 3 && "Part 3: Color Change"}
            </div>
            <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      </div>

      {/* Part 1: Random Clicks */}
      {currentPart === 1 && (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-6">
            Click the button {targetClicks} times
          </h3>
          <div className="text-lg mb-4">Current clicks: {clickCount}</div>
          <button
            onClick={handlePart1Click}
            disabled={part1Complete}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            Click Me!
          </button>
        </div>
      )}

      {/* Part 2: Number 5 Detection */}
      {currentPart === 2 && (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-6">
            Click only when you see the number 5
          </h3>
          <div className="text-8xl font-bold mb-6 h-32 flex items-center justify-center">
            {currentNumber}
          </div>
          <div className="text-sm mb-4">
            Correct: {part2Correct} | Wrong: {part2Wrong}
          </div>
          <button
            onClick={handlePart2Click}
            disabled={part2Complete}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            Click if 5
          </button>
        </div>
      )}

      {/* Part 3: Color Change Detection */}
      {currentPart === 3 && (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-6">
            Click only when the square turns green
          </h3>
          <div 
            className={`w-32 h-32 mx-auto mb-6 transition-colors duration-300`}
            style={{ backgroundColor: squareColor }}
          />
          <button
            onClick={handlePart3Click}
            disabled={!isSquareActive || part3Complete}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            Click if Green
          </button>
        </div>
      )}
    </div>
  );
};

export default Section12;