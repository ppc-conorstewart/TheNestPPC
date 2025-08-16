import React, { useState, useEffect } from 'react';

const logo = '/assets/logo.png';
const camoBg = '/assets/new-bg.jpg';
const gasketImage = '/assets/module_2/Gasket.jpg';

export default function TrainingRoom({ module }) {
  const [questionData, setQuestionData] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const endpoint = module === 'module2' ? '/api/module2' : '/api/questions';
    fetch(`http://localhost:3001${endpoint}`)
      .then(res => res.json())
      .then(data => setQuestionData(data))
      .catch(err => console.error('Failed to fetch questions:', err));

    const storedUser = localStorage.getItem('flyiq_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [module]);

  if (questionData.length === 0) return <p className="text-white p-4">Loading questions...</p>;

  const current = questionData[questionIndex];
  const imageToUse = module === 'module2' ? gasketImage : current.image;

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);
    setTimeout(() => {
      setSelected(null);
      setQuestionIndex((prev) => prev + 1);
    }, 1000);
  };

  const progressPercent = ((questionIndex + 1) / questionData.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-4 sm:p-8">



      <div
  className="max-w-4xl mx-auto rounded-2xl shadow-xl p-6"
  style={{
    backgroundImage: `url(${camoBg})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
  }}
>

        <div className="flex flex-col items-center justify-center mb-6">
  <img
    src={logo}
    alt="FLY-IQ Logo"
    className="w-full max-w-[220px] mx-auto object-contain drop-shadow-xl"
  />
  <h2 className="text-white text-center text-2xl sm:text-3xl font-bold mt-4">
  {module === 'module2' ? 'NAME THE CORRECT GASKET:' : 'NAME THIS FITTING:'}
</h2>

</div>


        <h2 className="text-2xl font-semibold mb-4 leading-tight">{current.question}</h2>
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-md mb-6">
          <img
            src={imageToUse}
            alt="trivia"
            className="w-full max-h-[450px] object-contain"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              className={`text-left p-4 rounded-xl shadow-md transition duration-200 ease-in-out transform hover:scale-105 border font-medium tracking-tight
                ${selected === idx
                  ? opt.correct
                    ? 'bg-green-600 border-green-300'
                    : 'bg-red-600 border-red-300'
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-500'}`}
              onClick={() => {
                setSelected(idx);
                handleAnswer(opt.correct);
              }}
            >
              <span className="font-bold mr-2">{opt.label}.</span> {opt.text}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <div className="flex justify-between text-sm mb-2 text-gray-300">
            <span>Module Progress: {questionIndex + 1}/{questionData.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-600 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-teal-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
