import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const AssessmentIntro = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Check your symptoms</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Take a short (3 min) symptom assessment. The information you give is safe and won't be shared.
          Your results will include:
        </p>
        <ul className="space-y-2 mb-6">
          <li className="text-gray-700">• Possible causes of symptoms.</li>
          <li className="text-gray-700">• Recommendations on what to do next.</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About this symptom checker</h2>
        <ul className="space-y-3">
          <li className="flex items-center text-gray-700">
            <Check className="w-5 h-5 text-blue-500 mr-2" />
            Created and validated by doctors
          </li>
          <li className="flex items-center text-gray-700">
            <Check className="w-5 h-5 text-blue-500 mr-2" />
            Clinically validated with real patient cases
          </li>
          <li className="flex items-center text-gray-700">
            <Check className="w-5 h-5 text-blue-500 mr-2" />
            Class I medical device in European Union
          </li>
        </ul>
      </div>

      <button 
        onClick={() => navigate('/assessment/patient')}
        className="bg-blue-500 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
      >
        Next
      </button>

      <div className="mt-12">
        <div className="flex items-center gap-6 mb-4">
          <img src="/api/placeholder/50/50" alt="CE Mark" className="h-12" />
          <img src="/api/placeholder/50/50" alt="HIPAA Compliant" className="h-12" />
          <img src="/api/placeholder/50/50" alt="GDPR Compliant" className="h-12" />
        </div>
        <button className="text-blue-500 flex items-center">
          <span className="mr-2">ℹ</span>
          Certification and Compliance
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Symptomate is a registered Class I medical device in the European Union. Symptomate is a medical device 
          regulated by the FDA as a general wellness product in the US. It is not yet a licensed medical device in other 
          countries, in particular in Canada nor Australia. For more information about territorial use, please see our 
          Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default AssessmentIntro;