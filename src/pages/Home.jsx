import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-white p-6">
            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 p-8 gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
                            The dementia checker
                            <br />
                            made by doctors for
                            <br />
                            <span className="text-blue-600">you</span>
                        </h1>
                        
                        <div className="space-y-4 mt-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-2 text-gray-700">Analyze your symptoms</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-2 text-gray-700">Understand your health</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-2 text-gray-700">Plan your next steps</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-2 text-gray-700">Get ready for your visit</span>
                            </div>
                        </div>

                        <button className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Start interview
                        </button>
                    </div>

                    <div className="relative">
                        <div className="bg-blue-50 rounded-lg p-6">
                            <img 
                                src="/api/placeholder/400/600"
                                alt="Symptom checker interface"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works section */}
            <section className="bg-white py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif text-center mb-6">How does it work?</h2>
                    <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
                        EarlyOnset is very easy to use. Either yourself or a loved one can use it to check for symptoms of dementia. 
                        Once you are ready, go ahead and click "Start Interview" to begin, and have the patient answer the questions that follow.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Step cards */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-medium mb-2">1. Open EarlyOnset when you believe you or a loved one need to check for dementia.</h3>
                            <img src="/api/placeholder/200/200" alt="Step 1" className="w-full" />
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-medium mb-2">2. Input patient details</h3>
                            <img src="/api/placeholder/200/200" alt="Step 2" className="w-full" />
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-medium mb-2">3. Sit in a quiet space for a 10 min assessment</h3>
                            <img src="/api/placeholder/200/200" alt="Step 3" className="w-full" />
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-medium mb-2">4. Answer some questions</h3>
                            <img src="/api/placeholder/200/200" alt="Step 4" className="w-full" />
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-medium mb-2">5. Get your results</h3>
                            <img src="/api/placeholder/200/200" alt="Step 5" className="w-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Who is this for section */}
            <section className="bg-white py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif text-center mb-12">Who is this for?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-4">Individuals</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point1
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point2
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point3
                                </li>
                            </ul>
                            <img src="/api/placeholder/300/200" alt="Individuals" className="mt-6 w-full" />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-4">Parents</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point1
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point2
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point3
                                </li>
                            </ul>
                            <img src="/api/placeholder/300/200" alt="Parents" className="mt-6 w-full" />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-xl font-medium mb-4">Family members</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point1
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point2
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    point3
                                </li>
                            </ul>
                            <img src="/api/placeholder/300/200" alt="Family members" className="mt-6 w-full" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;