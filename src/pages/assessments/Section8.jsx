import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Mic, Square, PlayCircle } from 'lucide-react';
import axios from 'axios';

const Section8 = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const expectedPhrase = "the big bad wolf";

  // Get assessment ID from localStorage
  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    if (id) {
      setAssessmentId(parseInt(id));
    } else {
      console.error('Assessment ID is missing in localStorage.');
      setError('Assessment ID not found');
    }
  }, []);

  useEffect(() => {
    if (stage === 1 && timeLeft <= 0) {
      setStage(2);
      setTimeLeft(20);
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

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance("The big bad wolf");
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/ogg',
      'audio/wav',
      'audio/aac'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Found supported MIME type:', type);
        return type;
      }
    }
    throw new Error('No supported MIME type found');
  };
  
  const startRecording = async () => {
    setError(null);
    
    try {
      console.log('Requesting media access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log('Media access granted, initializing recorder...');
      
      const mimeType = getSupportedMimeType();
      console.log('Using MIME type:', mimeType);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log('Received chunk of size:', e.data.size);
        }
      };

      recorder.onstop = () => {
        console.log('Recording stopped, processing chunks...');
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const blob = new Blob(chunks, { type: mimeType });
        console.log('Created blob of size:', blob.size);
        
        const newAudioUrl = URL.createObjectURL(blob);
        setAudioUrl(newAudioUrl);
        setRecordedBlob(blob);
        setRecordingComplete(true);
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.onerror = (event) => {
        console.error('Recorder error:', event.error);
        setError('Error during recording: ' + event.error);
      };

      console.log('Starting recording...');
      recorder.start(100);
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Initialize speech recognition
      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setTranscribedText(transcript.toLowerCase());
        };
        
        recognition.onerror = (event) => {
          console.error('Recognition error:', event.error);
        };
        
        recognition.start();
      }

    } catch (error) {
      console.error('Error in startRecording:', error);
      setError(error.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setError('Error stopping recording: ' + error.message);
      }
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onplay = () => console.log('Playing audio...');
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Error playing audio: ' + e.message);
      };
      audio.play().catch(e => {
        console.error('Playback failed:', e);
        setError('Playback failed: ' + e.message);
      });
    }
  };

  const verifyResponse = () => {
    const cleanExpectedPhrase = expectedPhrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const cleanTranscribedText = transcribedText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    return cleanTranscribedText.includes(cleanExpectedPhrase);
  };

  const handleSubmit = async () => {
    if (isSubmitted || !assessmentId) return;
    setIsSubmitted(true);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      stopRecording();
    }

    try {
      const userResponse = transcribedText.trim() || 'NO_RESPONSE';
      const isCorrect = verifyResponse();
      const responseTime = (20 - timeLeft) * 1000; // Convert to milliseconds

      const responseData = {
        assessment_id: assessmentId,
        section_number: 8,
        question_number: 1,
        user_response: userResponse,
        is_correct: isCorrect,
        response_time: responseTime,
      };

      console.log('Submitting response:', responseData);
      
      // Send data to backend
      const response = await axios.post('http://localhost:4000/store_section_response', responseData);
      console.log('Response stored successfully:', response.data);

      // Navigate to next section after a short delay
      setTimeout(() => {
        navigate('/assessment/section9');
      }, 1500);

    } catch (error) {
      console.error('Error storing response:', error.response?.data || error.message);
      setError('Error storing response: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
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

      {stage === 2 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Repeat what you heard</h3>
          
          <div className="flex flex-col items-center gap-6">
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

            <div className="text-center text-gray-600">
              {isRecording && "Recording in progress..."}
              {recordingComplete && "Recording complete. Play to review."}
              {!isRecording && !recordingComplete && "Click the microphone to start recording"}
            </div>
          </div>
        </div>
      )}

      {stage === 2 && transcribedText && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">Transcribed Text:</h4>
          <p>{transcribedText}</p>
        </div>
      )}

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