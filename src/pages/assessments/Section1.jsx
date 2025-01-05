import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Section1 = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      text: "What year is this?",
      validate: (answer) => answer === new Date().getFullYear().toString(),
    },
    {
      text: "What season is this?",
      validate: (answer) => {
        const seasons = ['winter', 'spring', 'summer', 'fall', 'autumn'];
        return seasons.includes(answer.toLowerCase());
      },
    },
    {
      text: "What month is this?",
      validate: (answer) => {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
          .toLocaleString('default', { month: 'long' });
        return [currentMonth.toLowerCase(), prevMonth.toLowerCase()].includes(answer.toLowerCase());
      },
    },
    {
      text: "What is today's date?",
      validate: (answer) => {
        const today = new Date().getDate();
        return [today - 1, today, today + 1].includes(Number(answer));
      },
    },
    {
      text: "What day of the week is this?",
      validate: (answer) => {
        return answer.toLowerCase() === new Date().toLocaleString('default', { weekday: 'long' }).toLowerCase();
      },
    },
  ];

  useEffect(() => {
    if (currentQuestion >= questions.length) {
      navigate('/assessment/section2');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSubmit(''); // Auto-submit empty answer when time runs out
          clearInterval(timer); // Stop the timer
          return 10; // Reset timer for the next question
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleSubmit = async (forcedAnswer = null) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);

    const answer = forcedAnswer !== null ? forcedAnswer : userAnswer;
    const isCorrect = questions[currentQuestion].validate(answer);

    try {
      // Simulate a delay for the server response
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulates server delay

      console.log('Stored response:', {
        section_number: 1,
        question_number: currentQuestion + 1,
        user_response: answer,
        is_correct: isCorrect,
        response_time: (10 - timeLeft) * 1000, // Convert to milliseconds
      });

      setUserAnswer('');
      setTimeLeft(10);
      setCurrentQuestion((prev) => prev + 1); // Immediately move to the next question
    } catch (error) {
      console.error('Error saving response (simulated):', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentQuestion >= questions.length) {
    return null; // Prevent rendering if all questions are answered
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
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
        <h3 className="text-2xl font-bold mb-6">{questions[currentQuestion].text}</h3>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
          placeholder="Type your answer here..."
          disabled={isSubmitting}
        />
      </div>

      <button
        onClick={() => handleSubmit()}
        disabled={isSubmitting || (!userAnswer && timeLeft > 0)}
        className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
          isSubmitting || (!userAnswer && timeLeft > 0)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Submit Answer
      </button>
    </div>
  );
};

export default Section1;
