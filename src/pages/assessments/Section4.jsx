import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Volume2 } from 'lucide-react';

const Section4 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [assessmentId, setAssessmentId] = useState(null);
  const [stage, setStage] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const selectedWords = location.state?.selectedWords || [];

  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    if (id) {
      setAssessmentId(parseInt(id));
    } else {
      console.error('Assessment ID is missing in localStorage.');
    }
  }, []);

  if (!selectedWords.length) {
    return (
      <div className="text-center text-xl text-red-600">
        Error: Missing words from the previous section. Please restart the assessment.
      </div>
    );
  }

  useEffect(() => {
    if (timeLeft <= 0) {
      if (stage === 1) {
        // For stage 1, move to stage 2
        setStage(2);
        setTimeLeft(30);
        setUserAnswer('');
        setIsAnswered(false);
      } else {
        // For stage 2, navigate to section 5
        navigate("/assessment/section5", { state: { selectedWords } });
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, stage, navigate, selectedWords]);

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance("WORLD");
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async () => {
    if (isAnswered) return;
  
    const correctAnswer = stage === 1 ? "WORLD" : "DLROW";
    const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();
    const responseTime = (30 - timeLeft) * 1000;
  
    try {
      const responseData = {
        assessment_id: assessmentId,
        section_number: 4,
        question_number: stage,
        user_response: userAnswer,
        is_correct: isCorrect,
        response_time: responseTime,
      };
  
      console.log('Submitting response:', responseData);
      
      const response = await axios.post('http://localhost:4000/store_section_response', responseData);
      console.log('Response stored successfully:', response.data);
  
      if (stage === 1) {
        setTimeout(() => {
          setStage(2);
          setUserAnswer('');
          setTimeLeft(30);
          setIsAnswered(false);
        }, 100);
      } else {
        navigate("/assessment/section5", { state: { selectedWords } });
      }
    } catch (error) {
      console.error('Error storing response:', error.response?.data || error.message);
    }
    
    if (stage === 2) {
      setIsAnswered(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {stage === 1 ? "Part 1 of 2" : "Part 2 of 2"}
          </h2>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>
        
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold">
            {stage === 1 ? "Spell this word" : "Now spell it backwards please"}
          </h3>
          <button 
            onClick={playAudio}
            className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <Volume2 className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-4 border-2 rounded-lg text-lg bg-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="Type your answer here..."
            disabled={isAnswered}
          />
        </div>
      </div>

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