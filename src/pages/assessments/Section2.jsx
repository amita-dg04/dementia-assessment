import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { loadCountries, getLocationDetails, loadProvinces, loadCities } from '../../backend/locationServices';

const Section2 = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);


  useEffect(() => {
    if (userLocation) {
      console.log('User location set:', userLocation);
      console.log('Country from location:', userLocation.country);
    }
  }, [userLocation]);


  const questions = [
    {
      text: "What country are you in?",
      type: "country-select",
      validate: (answer) => {
        if (!answer || !userLocation) return false;
        // Check against both the country code and full name
        return (
          answer.value.toLowerCase() === userLocation.country.toLowerCase() || 
          answer.label.toLowerCase() === userLocation.country.toLowerCase()
        );
      },
    },
    {
      text: "What province/state are we in?",
      type: "province-select",
      validate: (answer) => {
        if (!answer || !userLocation) return false;
        return answer.label.toLowerCase() === userLocation.province.toLowerCase();
      },
    },
    {
      text: "What city/town are we in?",
      type: "city-select",
      validate: (answer) => {
        if (!answer || !userLocation) return false;
        return answer.label.toLowerCase() === userLocation.city.toLowerCase();
      },
    },
  ];

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('Geolocation position:', position);
          try {
            const locationData = await getLocationDetails(
              position.coords.latitude,
              position.coords.longitude
            );
            console.log('Location details from geolocation:', locationData);
            if (locationData) {
              setUserLocation(locationData);
            } else {
              console.log('No location data from geolocation. Falling back to IP location.');
              getLocationFromIP();
            }
          } catch (error) {
            console.error('Error getting location details from geolocation:', error);
            getLocationFromIP();
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          getLocationFromIP();
        }
      );
    } else {
      console.warn('Geolocation not available. Falling back to IP location.');
      getLocationFromIP();
    }
  }, []);

  // Get location from IP as fallback
  const getLocationFromIP = async () => {
    try {
      const response = await axios.get('https://ipapi.co/json/');
      setUserLocation({
        country: response.data.country_name,
        province: response.data.region,
        city: response.data.city
      });
    } catch (error) {
      console.error('Error getting IP location:', error);
    }
  };

  // Get assessment ID from localStorage
  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    if (id) {
      setAssessmentId(parseInt(id));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (currentQuestion >= questions.length) {
      navigate('/assessment/section3');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSubmit('');
          return 10;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, navigate]);

  const handleSubmit = async (forcedAnswer = null) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    const answer = forcedAnswer !== null ? forcedAnswer : userAnswer;
    const isCorrect = answer ? questions[currentQuestion].validate(answer) : false;
    const responseTime = (10 - timeLeft) * 1000;
  
    const responseData = {
      assessment_id: assessmentId || 0,
      section_number: 2,
      question_number: currentQuestion + 1,
      user_response: answer?.label || '',
      is_correct: isCorrect,
      response_time: responseTime
    };
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const response = await axios.post('http://localhost:4000/store_section_response', responseData);
      console.log('Response stored successfully:', response.data);
  
      setUserAnswer(null);
      setTimeLeft(10);
      
      if (currentQuestion >= questions.length - 1) {
        navigate('/assessment/section3');
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error storing response:', error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    // Return null if we're past the last question
    if (currentQuestion >= questions.length) {
      return null;
    }

    const question = questions[currentQuestion];
    console.log('Rendering question:', question.text);
    console.log('Selected Country:', selectedCountry);
    console.log('Selected Province:', selectedProvince);
    console.log('Available Provinces:', availableProvinces);
    console.log('Available Cities:', availableCities);
  
    switch (question.type) {
      case 'country-select':
        return (
          <AsyncSelect
            cacheOptions
            defaultOptions
            value={userAnswer}
            onChange={(selected) => {
              console.log('Country selected:', selected);
              setUserAnswer(selected);
              setSelectedCountry(selected);
              setSelectedProvince(null);
              setAvailableCities([]);
              setIsLoadingProvinces(true);
              
              loadProvinces(selected).then((provinces) => {
                console.log('Loaded provinces:', provinces);
                setAvailableProvinces(provinces);
                setIsLoadingProvinces(false);
              });
            }}
            loadOptions={loadCountries}
            className="w-full"
            isDisabled={isSubmitting}
            placeholder="Search for a country..."
          />
        );
  
      case 'province-select':
        return (
          <Select
            value={userAnswer}
            onChange={(selected) => {
              console.log('Province selected:', selected);
              setUserAnswer(selected);
              setSelectedProvince(selected);
              setAvailableCities([]);
              setIsLoadingCities(true);
              
              if (selected && selectedCountry) {
                loadCities(selectedCountry, selected).then((cities) => {
                  console.log('Loaded cities:', cities);
                  setAvailableCities(cities);
                  setIsLoadingCities(false);
                });
              }
            }}
            options={availableProvinces}
            className="w-full"
            isDisabled={isSubmitting || !selectedCountry || isLoadingProvinces}
            isLoading={isLoadingProvinces}
            placeholder={selectedCountry ? "Select a province/state..." : "Please select a country first"}
          />
        );
  
      case 'city-select':
        return (
          <Select
            value={userAnswer}
            onChange={(selected) => {
              console.log('City selected:', selected);
              setUserAnswer(selected);
            }}
            options={availableCities}
            className="w-full"
            isDisabled={isSubmitting || !selectedProvince || isLoadingCities}
            isLoading={isLoadingCities}
            placeholder={selectedProvince ? "Select a city..." : "Please select a province first"}
          />
        );
  
      default:
        return null;
    }
  };

  // Don't render anything if we're past the last question
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

export default Section2;