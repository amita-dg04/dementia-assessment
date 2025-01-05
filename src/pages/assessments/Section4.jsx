import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';

const Section4 = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1); // 1 for forward, 2 for backward
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const playAudio = () => {
    // In a real implementation, you would have an actual audio file
    // This is just a placeholder using the Web Speech API
    const utterance = new SpeechSynthesisUtterance("WORLD");
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = () => {
    if (stage === 1) {
      setStage(2);
      setUserAnswer('');
      setTimeLeft(30);
      setIsAnswered(false);
    } else {
      // Navigate to next section
      navigate('/assessment/section5');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {stage === 1 ? "Part 1 of 2" : "Part 2 of 2"}
          </h2>
          <div className="text-lg font-bold text-blue-600">
            {timeLeft}s
          </div>
        </div>
        
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold">Spell this word</h3>
          <button 
            onClick={playAudio}
            className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <Volume2 className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        {stage === 2 && (
          <p className="text-lg text-gray-600 mb-4">
            Now spell it backwards please.
          </p>
        )}

        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
          placeholder="Type your answer here..."
          disabled={isAnswered}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isAnswered || !userAnswer}
        className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
          isAnswered || !userAnswer
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {stage === 1 ? "Submit & Continue" : "Submit & Proceed to Next Section"}
      </button>

      {/* Helpful Hint */}
      <div className="mt-4 text-center text-gray-500">
        {stage === 1 ? (
          <p>Click the speaker icon to hear the word again</p>
        ) : (
          <p>Remember to spell the word backwards. Click the speaker to hear the original word again.</p>
        )}
      </div>
    </div>
  );
};

export default Section4;