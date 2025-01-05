import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Section1 = () => {

  // SUBMISSION TRACKING VARIABLES
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [dateInput, setDateInput] = useState({ day: '', month: '' });
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CONSTANTS FOR DROPDOWNS
  const seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // QUESTIONS LIST FOR THE PAGE
  const questions = [
    {
      text: "What year is this?",
      type: "text",
      validate: (answer) => answer === new Date().getFullYear().toString(),
    },
    {
      text: "What season is this?",
      type: "season-dropdown",
      validate: (answer) => {
        return seasons.map(s => s.toLowerCase()).includes(answer.toLowerCase());
      },
    },
    {
      text: "What month is this?",
      type: "month-dropdown",
      validate: (answer) => {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
          .toLocaleString('default', { month: 'long' });
        return [currentMonth.toLowerCase(), prevMonth.toLowerCase()].includes(answer.toLowerCase());
      },
    },
    {
      text: "What is today's date?",
      type: "date-input",
      validate: (answer) => {
        const today = new Date();
        const inputDate = new Date(today.getFullYear(), answer.month - 1, answer.day);
        const yesterdayDate = new Date(today);
        yesterdayDate.setDate(today.getDate() - 1);
        const tomorrowDate = new Date(today);
        tomorrowDate.setDate(today.getDate() + 1);
        
        return [yesterdayDate, today, tomorrowDate].some(date => 
          date.getDate() === inputDate.getDate() && 
          date.getMonth() === inputDate.getMonth()
        );
      },
    },
    {
      text: "What day of the week is this?",
      type: "weekday-dropdown",
      validate: (answer) => {
        return answer.toLowerCase() === new Date().toLocaleString('default', { weekday: 'long' }).toLowerCase();
      },
    },
  ];

  // TIMER LOGIC AND MOVING TO NEXT PART
  useEffect(() => {
    if (currentQuestion >= questions.length) {
      navigate('/assessment/section2');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSubmit('');
          clearInterval(timer);
          return 10;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleDateChange = (field, value) => {
    setDateInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (forcedAnswer = null) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let answer;
    if (forcedAnswer !== null) {
      answer = forcedAnswer;
    } else if (questions[currentQuestion].type === 'date-input') {
      answer = dateInput;
    } else {
      answer = userAnswer;
    }

    const isCorrect = questions[currentQuestion].validate(answer);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Stored response:', {
        section_number: 1,
        question_number: currentQuestion + 1,
        user_response: answer,
        is_correct: isCorrect,
        response_time: (10 - timeLeft) * 1000,
      });

      setUserAnswer('');
      setDateInput({ day: '', month: '' });
      setTimeLeft(10);
      setCurrentQuestion((prev) => prev + 1);
    } catch (error) {
      console.error('Error saving response (simulated):', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // FRONT END STUFF
  const renderInput = () => {
    const question = questions[currentQuestion];
    
    switch (question.type) {
      case 'season-dropdown':
      case 'weekday-dropdown':
      case 'month-dropdown':
        const options = {
          'season-dropdown': { list: seasons, placeholder: 'Select a season' },
          'weekday-dropdown': { list: daysOfWeek, placeholder: 'Select a day' },
          'month-dropdown': { list: months, placeholder: 'Select a month' }
        }[question.type];

        return (
          <div className="relative">
            <select
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full p-4 border-2 rounded-lg text-lg bg-white focus:border-blue-500 focus:ring-blue-500 appearance-none"
              disabled={isSubmitting}
            >
              <option value="">{options.placeholder}</option>
              {options.list.map((item) => (
                <option key={item} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        );
      
      case 'date-input':
        return (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">Day (DD)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dateInput.day}
                onChange={(e) => handleDateChange('day', e.target.value)}
                className="w-full p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
                placeholder="DD"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">Month (MM)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={dateInput.month}
                onChange={(e) => handleDateChange('month', e.target.value)}
                className="w-full p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
                placeholder="MM"
                disabled={isSubmitting}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500"
            placeholder="Type your answer here..."
            disabled={isSubmitting}
          />
        );
    }
  };

  if (currentQuestion >= questions.length) {
    return null;
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
        {renderInput()}
      </div>

      <button
        onClick={() => handleSubmit()}
        disabled={isSubmitting || 
          (questions[currentQuestion].type === 'date-input' 
            ? (!dateInput.day || !dateInput.month) 
            : !userAnswer) && timeLeft > 0}
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