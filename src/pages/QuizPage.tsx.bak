import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dataset from '../data/dataset.json';
import Confetti from 'react-confetti';

interface Question {
  text: string;
  answer: string;
  options: string[];
  topic: string;
}

const generateRandomOptions = (correctAnswer: string): string[] => {
  const isNumber = !isNaN(Number(correctAnswer.split(' ')[0]));
  let options: string[] = [correctAnswer];
  
  if (isNumber) {
    const correctNum = Number(correctAnswer.split(' ')[0]);
    const unit = correctAnswer.split(' ').slice(1).join(' ');
    const offset = Math.max(1, Math.round(correctNum * 0.2));
    
    const variations = [
      correctNum + offset,
      correctNum - offset,
      correctNum + (offset * 2)
    ].filter(num => num > 0);

    options.push(...variations.map(num => unit ? `${num} ${unit}` : num.toString()));
  } else {
    const variations = [
      correctAnswer + " (incorrect)",
      "Not " + correctAnswer,
      correctAnswer.split('').reverse().join('')
    ];
    options.push(...variations);
  }
  
  return options.sort(() => Math.random() - 0.5);
};

const getRandomQuestions = (topic: string, level: string): Question[] => {
  try {
    if (!dataset[topic] || !dataset[topic][level]) {
      console.error('No questions found for:', topic, level);
      return [];
    }

    const questions = dataset[topic][level];
    const randomQuestions: Question[] = [];
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(5, shuffled.length); i++) {
      const q = shuffled[i];
      const qKey = Object.keys(q).find(k => k.startsWith('Q'));
      const aKey = Object.keys(q).find(k => k.startsWith('A'));
      
      if (qKey && aKey) {
        const answer = q[aKey];
        randomQuestions.push({
          text: q[qKey],
          answer: answer,
          options: generateRandomOptions(answer),
          topic: topic
        });
      }
    }
    
    return randomQuestions;
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
};

export default function QuizPage() {
  const navigate = useNavigate();
  const { topic = '' } = useParams<{ topic: string }>();
  const [level, setLevel] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (level && topic) {
      const randomQuestions = getRandomQuestions(topic.toUpperCase(), level);
      if (randomQuestions.length === 0) {
        setError('No questions available for this level. Please try another level.');
        setQuestions([]);
      } else {
        setError(null);
        setQuestions(randomQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswer('');
        setScore(0);
        setShowResult(false);
        setIsCorrect(null);
        setShowConfetti(false);
      }
    }
  }, [topic, level]);

  const handleLevelSelect = (selectedLevel: string) => {
    setLevel(selectedLevel);
    setError(null);
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correct = userAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      if (score + 1 >= Math.floor(questions.length * 0.8)) {
        setShowConfetti(true);
      }
    }

    setTimeout(() => {
      setIsCorrect(null);
      setUserAnswer('');
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleRetry = () => {
    setLevel(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setScore(0);
    setShowResult(false);
    setIsCorrect(null);
    setShowConfetti(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {showConfetti && <Confetti />}
      <div className="max-w-2xl w-full px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {topic} Quiz
            </h1>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!level ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Select Difficulty Level:</h2>
              <div className="grid grid-cols-3 gap-3">
                {['Level 1', 'Level 2', 'Level 3'].map((l) => (
                  <motion.button
                    key={l}
                    onClick={() => handleLevelSelect(l)}
                    className="py-4 text-lg font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {l}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : questions.length > 0 && !showResult ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-gray-600">Score: {score}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg text-gray-800 mb-3">{questions[currentQuestionIndex].text}</h2>
                <div className="grid gap-2">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setUserAnswer(option)}
                      className={`py-3 px-4 text-left rounded-lg transition-all ${
                        userAnswer === option
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              {userAnswer && (
                <motion.button
                  onClick={handleAnswerSubmit}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Answer
                </motion.button>
              )}

              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`py-2 rounded-lg text-center ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${questions[currentQuestionIndex].answer}`}
                </motion.div>
              )}
            </div>
          ) : showResult ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
              <p className="text-xl text-gray-700">Your score: {score} out of {questions.length}</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={handleRetry}
                  className="py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={() => navigate('/')}
                  className="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Topics
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}