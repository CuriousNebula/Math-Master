import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dataset from '../data/dataset.json';
import Confetti from 'react-confetti';

type Level = 'Level 1' | 'Level 2' | 'Level 3';
type Topic = 'ARITHMETIC' | 'ALGEBRA' | 'GEOMETRY' | 'STATISTICS' | 'PROBABILITY';

interface Question {
  text: string;
  answer: string;
  options: string[];
  topic: Topic;
  level: Level;
}

type GameMode = 'select' | 'suddenDeath' | 'timeAttack';

const topics = [
  { name: 'ARITHMETIC', displayName: 'Arithmetic', color: 'bg-purple-500' },
  { name: 'ALGEBRA', displayName: 'Algebra', color: 'bg-pink-500' },
  { name: 'GEOMETRY', displayName: 'Geometry', color: 'bg-emerald-500' },
  { name: 'PROBABILITY', displayName: 'Probability', color: 'bg-amber-500' },
  { name: 'STATISTICS', displayName: 'Statistics', color: 'bg-blue-500' }
];

// Points based on difficulty level
const DIFFICULTY_POINTS: { [key in Level]: number } = {
  'Level 1': 10,
  'Level 2': 20,
  'Level 3': 30,
};

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

const getRandomQuestion = (topic: Topic): Question | null => {
  const levels: Level[] = ['Level 1', 'Level 2', 'Level 3'];
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];
  
  if (!dataset[topic] || !dataset[topic][randomLevel]) {
    return null;
  }

  const questions = dataset[topic][randomLevel];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  if (!randomQuestion) return null;

  const qKey = Object.keys(randomQuestion).find(k => k.startsWith('Q'));
  const aKey = Object.keys(randomQuestion).find(k => k.startsWith('A'));
  
  if (!qKey || !aKey) return null;

  return {
    text: randomQuestion[qKey],
    answer: randomQuestion[aKey],
    options: generateRandomOptions(randomQuestion[aKey]),
    topic,
    level: randomLevel,
  };
};

export default function GameModePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>('select');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    if (selectedTopic && !gameOver) {
      setCurrentQuestion(getRandomQuestion(selectedTopic));
    }
  }, [selectedTopic]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'timeAttack' && selectedTopic && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            if (score > highScore) {
              setHighScore(score);
              setShowConfetti(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, selectedTopic, gameOver, timeLeft]);

  const handleModeSelect = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setSelectedTopic(null);
    setCurrentQuestion(null);
    setScore(0);
    setGameOver(false);
    setShowConfetti(false);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setStreak(0);
    setMaxStreak(0);
    if (selectedMode === 'timeAttack') {
      setTimeLeft(60);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentQuestion(getRandomQuestion(topic));
    setScore(0);
    setGameOver(false);
    setShowConfetti(false);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setStreak(0);
    setMaxStreak(0);
    if (mode === 'timeAttack') {
      setTimeLeft(60);
    }
  };

  const handleAnswer = (answer: string) => {
    if (gameOver || !currentQuestion) return;

    const isCorrect = answer === currentQuestion.answer;
    setTotalQuestions(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const points = DIFFICULTY_POINTS[currentQuestion.level];
      const streakBonus = Math.floor(streak / 3) * 5; // Bonus points for every 3 correct answers in a row
      
      if (mode === 'timeAttack') {
        setScore(prev => prev + points + streakBonus);
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(current => Math.max(current, newStreak));
          return newStreak;
        });
      } else if (mode === 'suddenDeath') {
        setScore(prev => prev + 1);
        if (score + 1 > highScore) {
          setHighScore(score + 1);
          setShowConfetti(true);
        }
      }
      
      setCurrentQuestion(getRandomQuestion(selectedTopic!));
    } else {
      if (mode === 'suddenDeath') {
        setGameOver(true);
      } else if (mode === 'timeAttack') {
        setStreak(0); // Reset streak on wrong answer
        setCurrentQuestion(getRandomQuestion(selectedTopic!));
      }
    }
  };

  const handleRetry = () => {
    setScore(0);
    setGameOver(false);
    setShowConfetti(false);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setStreak(0);
    setMaxStreak(0);
    if (mode === 'timeAttack') {
      setTimeLeft(60);
    }
    setCurrentQuestion(getRandomQuestion(selectedTopic!));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {showConfetti && <Confetti />}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Home
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-6">Game Mode</h1>

          {mode === 'select' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-700">Select Game Mode:</h2>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={() => handleModeSelect('suddenDeath')}
                  className="p-6 text-lg font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sudden Death
                </motion.button>
                <motion.button
                  onClick={() => handleModeSelect('timeAttack')}
                  className="p-6 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Time Attack
                </motion.button>
              </div>
            </div>
          )}

          {mode !== 'select' && !selectedTopic && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Select Topic:</h2>
                <button
                  onClick={() => handleModeSelect('select')}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Change Mode
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <motion.button
                    key={topic.name}
                    onClick={() => handleTopicSelect(topic.name as Topic)}
                    className={`p-6 text-lg font-semibold text-white rounded-lg transition-all ${topic.color} hover:opacity-90`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {topic.displayName}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {selectedTopic && currentQuestion && !gameOver && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-gray-600">Score: {score}</div>
                  {mode === 'timeAttack' && (
                    <>
                      <div className="text-gray-600">Time: {timeLeft}s</div>
                      <div className="text-gray-600">Streak: {streak}</div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Change Topic
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    Topic: {currentQuestion.topic.charAt(0) + currentQuestion.topic.slice(1).toLowerCase()}
                  </span>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium ml-2">
                    {currentQuestion.level}
                  </span>
                </div>
                <h2 className="text-xl text-gray-800 mb-4">{currentQuestion.text}</h2>
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className="p-4 text-left rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(gameOver || timeLeft === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800">Game Over!</h2>
              <div className="space-y-2">
                <p className="text-xl text-gray-700">Final Score: {score}</p>
                <p className="text-gray-600">Total Questions: {totalQuestions}</p>
                <p className="text-gray-600">
                  Accuracy: {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </p>
                {mode === 'timeAttack' && (
                  <p className="text-indigo-600">
                    Max Streak: {maxStreak} questions
                  </p>
                )}
                {mode === 'suddenDeath' && score > 0 && (
                  <p className="text-green-600 font-semibold">
                    Amazing streak! You got {score} questions right in a row!
                  </p>
                )}
                {score === highScore && score > 0 && (
                  <p className="text-indigo-600 font-semibold">New High Score! 🎉</p>
                )}
              </div>
              <div className="space-y-4">
                <motion.button
                  onClick={handleRetry}
                  className="w-full p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={() => setSelectedTopic(null)}
                  className="w-full p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Change Topic
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
