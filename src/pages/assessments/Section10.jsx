import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Section10 = () => {
  const navigate = useNavigate();
  const [sentence, setSentence] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

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

  const validateSentence = async (text) => {
    try {
      const response = await axios.post('http://localhost:4000/validate_sentence', {
        sentence: text
      });
      
      // Log validation details
      console.log('Sentence validation:', {
        sentence: text,
        result: response.data,
        source: response.data.source
      });
      
      // Handle fallback validation response
      if (response.data.fallback && response.data.details) {
        const details = response.data.details;
        const issues = [];
        
        if (!details.hasValidLength) issues.push('too short');
        if (!details.startsWithCapital) issues.push('should start with capital letter');
        if (!details.endsWithPunctuation) issues.push('missing ending punctuation');
        if (!details.hasVerb) issues.push('missing proper verb');
        
        if (issues.length > 0) {
          setError(`Grammar check failed: ${issues.join(', ')}`);
        }
      } 
      // Handle API validation response
      else if (response.data.errors && response.data.errors.length > 0) {
        setError(`Grammar issues: ${response.data.errors.join(', ')}`);
      }
      
      return response.data.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setError('Error validating sentence. Please try again.');
      return false;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted || !assessmentId || isValidating) return;
    
    setIsValidating(true);
    setError(null);

    try {
      const userSentence = sentence.trim() || 'NO_ANSWER';
      const isCorrect = await validateSentence(userSentence);
      const responseTime = (60 - timeLeft) * 1000;

      const responseData = {
        assessment_id: assessmentId,
        section_number: 10,
        question_number: 1,
        user_response: userSentence,
        is_correct: isCorrect,
        response_time: responseTime,
      };

      console.log('Submitting response:', responseData);
      
      const response = await axios.post('http://localhost:4000/store_section_response', responseData);
      console.log('Response stored successfully:', response.data);

      setIsSubmitted(true);

      // Navigate to next section after a short delay
      setTimeout(() => {
        navigate('/assessment/section11');
      }, 1500);

    } catch (error) {
      console.error('Error storing response:', error.response?.data || error.message);
      setError('Error submitting response. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sentence Writing</h2>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-6">
          Write any complete sentence here:
        </h3>

        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          className="w-full p-4 border-2 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500 min-h-[120px] resize-y"
          placeholder="Type your sentence here..."
          disabled={isSubmitted}
          autoFocus
        />

        {error && (
          <div className="mt-2 text-red-600">
            {error}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitted || !sentence.trim() || isValidating}
        className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
          isSubmitted || !sentence.trim() || isValidating
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isValidating ? 'Validating...' : 'Submit'}
      </button>
    </div>
  );
};

export default Section10;