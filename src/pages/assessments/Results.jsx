import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    console.log('Found assessment ID:', id);
    if (id) {
      setAssessmentId(parseInt(id));
      fetchResults(parseInt(id));
    } else {
      setError('Assessment ID not found');
      setLoading(false);
    }
  }, []);

  const calculateScore = (responses) => {
    let totalScore = 0;
    const pointValues = {
      '1': { '1': 1, '2': 1, '3': 1, '4': 1, '5': 1 },
      '2': { '1': 1, '2': 2, '3': 2 },
      '4': { '1': 0, '2': 5 },
      '5': { '1': 1, '2': 1, '3': 1 },
      '6': { '1': 1 },
      '7': { '1': 1 },
      '8': { '1': 2 },
      '9': { '1': 1 },
      '10': { '1': 2 },
      '11': { '1': 2 },
      '12': { '1': 1, '2': 1, '3': 1 }
    };

    const section4Scores = JSON.parse(localStorage.getItem('section4Scores') || '{}');

    responses.forEach(response => {
      if (response.section_number === '4') {
        // Use the total score from section 4
        totalScore += (section4Scores.forwards || 0) + (section4Scores.backwards || 0);
      } else if (response.is_correct && pointValues[response.section_number]?.[response.question_number]) {
        totalScore += pointValues[response.section_number][response.question_number];
      }
    });

    return totalScore;
  };

  const getResultDescription = (score) => {
    if (score >= 26) {
      return {
        description: 'Could be normal',
        stage: 'Could be normal',
        duration: 'Varies',
        activities: 'Could be normal',
        communication: 'Could be normal',
        memory: 'Could be normal',
        severity: 'normal'
      };
    } else if (score >= 20) {
      return {
        description: 'Mild',
        stage: 'Early',
        duration: '0-2 years',
        activities: 'Difficulty with driving, finances, and shopping',
        communication: 'Finding words, going off topic, repeating',
        memory: 'Three item recall, orientation to time then place',
        severity: 'mild'
      };
    } else if (score >= 10) {
      return {
        description: 'Moderate',
        stage: 'Middle',
        duration: '4-7 years',
        activities: 'Difficulty with dressing, grooming, and toileting',
        communication: 'Sentence fragments, vague terms (this/that)',
        memory: 'Spelling WORLD backward, language, three-step command',
        severity: 'moderate'
      };
    } else {
      return {
        description: 'Severe',
        stage: 'Late',
        duration: '7-14 years',
        activities: 'Difficulty with eating and walking',
        communication: 'Speech disturbances such as stuttering or slurring',
        memory: 'Obvious deficits in all areas',
        severity: 'severe'
      };
    }
  };

  const fetchResults = async (id) => {
    try {
      console.log('Fetching results for assessment ID:', id);
      const response = await axios.get(`http://localhost:4000/assessment_results/${id}`);
      const { patient, responses } = response.data;

      const score = calculateScore(responses);
      const description = getResultDescription(score);

      setPatientInfo(patient);
      setResults({ score, totalPossible: 30, ...description });
      setLoading(false);
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError('Error fetching results: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6">
        {error}
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      mild: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.normal;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Assessment Results</h1>

      {patientInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-medium">{patientInfo.first_name} {patientInfo.last_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Birth Date:</p>
              <p className="font-medium">{formatDate(patientInfo.birth_date)}</p>
            </div>
            <div>
              <p className="text-gray-600">Sex:</p>
              <p className="font-medium">{patientInfo.sex}</p>
            </div>
            <div>
              <p className="text-gray-600">Patient Type:</p>
              <p className="font-medium">{patientInfo.patient_type}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-4">
            {results.score}/{results.totalPossible}
          </div>
          <div className={`inline-block px-4 py-2 rounded-full font-medium ${getSeverityColor(results.severity)}`}>
            {results.description}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Stage</h2>
            <p className="text-gray-700">{results.stage}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Typical Duration</h2>
            <p className="text-gray-700">{results.duration}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Activities of Daily Living</h2>
            <p className="text-gray-700">{results.activities}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Communication</h2>
            <p className="text-gray-700">{results.communication}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Memory</h2>
            <p className="text-gray-700">{results.memory}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
