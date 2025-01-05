import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Section3 = () => {
  const navigate = useNavigate();

  const wordSets = [
    ["Ball", "Car", "Man"],
    ["Bell", "Jar", "Fan"],
    ["Bill", "Tar", "Can"],
    ["Bull", "Bar", "Pan"],
  ];

  const [selectedWords, setSelectedWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30); // Update the overall timer to 30 seconds
  const [showWords, setShowWords] = useState(false); // Controls the word display
  const [instructionTimeLeft, setInstructionTimeLeft] = useState(10); // Timer for the instructional text

  useEffect(() => {
    // Randomly select a set of words when the component mounts
    const randomIndex = Math.floor(Math.random() * wordSets.length);
    setSelectedWords(wordSets[randomIndex]);

    // Start the countdown timer for the full 30 seconds
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          navigate("/assessment/section4"); // Navigate to "/" when the timer runs out
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [navigate]);

  useEffect(() => {
    // Start a timer for 10 seconds to show the instructional text
    const instructionTimer = setInterval(() => {
      setInstructionTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(instructionTimer);
          setShowWords(true); // After 10 seconds, display the words
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(instructionTimer); // Cleanup on component unmount
  }, []);

  const handleNext = () => {
    navigate("/assessment/section4");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Remember These Words</h2>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>

        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }} // Adjust the progress bar based on 30 seconds
          />
        </div>
      </div>

      {/* Instructional Text (Only visible for 10 seconds) */}
      {!showWords && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-left mb-6">
            I am going to name three objects. Remember what they are because I am
            going to ask you to name them again in a few minutes.
          </h3>
          <div className="text-lg font-semibold text-blue-600">{instructionTimeLeft}s</div>
        </div>
      )}

      {/* Display Word Set after 10 seconds */}
      {showWords && (
        <div>
          {/* Display Word Set */}
          <div className="flex gap-4 justify-center mb-8">
            {selectedWords.map((word, index) => (
              <div
                key={index}
                className="w-7/12 p-6 text-center text-lg font-semibold rounded-lg shadow-md bg-blue-100 border-2 border-blue-300"
              >
                {word}
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="w-full px-8 py-3 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Section3;
