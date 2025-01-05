import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Mic, Square, PlayCircle } from 'lucide-react';

const Section8 = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1); // 1 for listening, 2 for recording
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingComplete, setRecordingComplete] = useState(false);

  useEffect(() => {
    if (stage === 1 && timeLeft <= 0) {
      setStage(2);
      setTimeLeft(20); // Reset timer for recording stage
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (stage === 2) {
            handleSubmit();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, stage]);

  const playAudio = () => {
    // In a real implementation, you would have an actual audio file
    // This is just a placeholder using the Web Speech API
    const utterance = new SpeechSynthesisUtterance("No. ifs. ands. or. buts.");
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setRecordingComplete(true);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const audio = new Audio(URL.createObjectURL(recordedBlob));
      audio.play();
    }
  };

  const handleSubmit = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      stopRecording();
    }
    setTimeout(() => {
      navigate('/assessment/section9');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {stage === 1 ? "Listen to the Phrase" : "Record Your Response"}
          </h2>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / (stage === 1 ? 10 : 20)) * 100}%` }}
          />
        </div>
      </div>

      {/* Stage 1: Listening */}
      {stage === 1 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Listen to the recording carefully</h3>
          <div className="flex justify-center">
            <button 
              onClick={playAudio}
              className="p-8 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <Volume2 className="w-12 h-12 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: Recording */}
      {stage === 2 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Repeat what you heard here</h3>
          
          <div className="flex flex-col items-center gap-6">
            {/* Recording Controls */}
            <div className="flex gap-4">
              {!isRecording && !recordingComplete && (
                <button
                  onClick={startRecording}
                  className="p-6 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                >
                  <Mic className="w-8 h-8 text-red-600" />
                </button>
              )}
              
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="p-6 rounded-full bg-red-100 hover:bg-red-200 transition-colors animate-pulse"
                >
                  <Square className="w-8 h-8 text-red-600" />
                </button>
              )}
              
              {recordingComplete && (
                <button
                  onClick={playRecording}
                  className="p-6 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                >
                  <PlayCircle className="w-8 h-8 text-green-600" />
                </button>
              )}
            </div>

            {/* Recording Status */}
            <div className="text-center text-gray-600">
              {isRecording && "Recording in progress..."}
              {recordingComplete && "Recording complete. Play to review."}
              {!isRecording && !recordingComplete && "Click the microphone to start recording"}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button - Only show in stage 2 */}
      {stage === 2 && (
        <button
          onClick={handleSubmit}
          disabled={!recordingComplete}
          className={`w-full px-8 py-3 rounded-full font-medium transition-colors ${
            !recordingComplete
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Submit
        </button>
      )}
    </div>
  );
};

export default Section8;