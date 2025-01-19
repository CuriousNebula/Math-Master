import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dataset from '../data/dataset.json';
import Confetti from 'react-confetti';
import logo from '../logo/logo_5.png';

interface Question {
  text: string;
  answer: string;
  options: string[];
  topic: string;
}

interface Dataset {
  ARITHMETIC: any;
  GEOMETRY: any;
  STATISTICS: any;
  ALGEBRA: any;
  PROBABILITY: any;
}

const generateRandomOptions = (correctAnswer: string, topic: string, gameMode: 'normal' | 'timeAttack' | 'suddenDeath' = 'normal'): string[] => {
  let options: string[] = [correctAnswer];
  
  const generateNumericVariations = (numericPart: number, units: string = '') => {
    const isDecimal = numericPart % 1 !== 0;
    if (isDecimal) {
      const decimalPlaces = (numericPart.toString().split('.')[1] || '').length;
      const multiplier = Math.pow(10, decimalPlaces);
      const baseNum = Math.round(numericPart * multiplier);
      
      // More precise variations for time attack and sudden death
      const variations = gameMode !== 'normal' 
        ? [
            ((baseNum - Math.round(baseNum * 0.02)) / multiplier).toFixed(decimalPlaces),
            ((baseNum + Math.round(baseNum * 0.02)) / multiplier).toFixed(decimalPlaces),
            ((baseNum + Math.round(baseNum * 0.03)) / multiplier).toFixed(decimalPlaces)
          ]
        : [
            ((baseNum - Math.round(baseNum * 0.03)) / multiplier).toFixed(decimalPlaces),
            ((baseNum + Math.round(baseNum * 0.03)) / multiplier).toFixed(decimalPlaces),
            ((baseNum + Math.round(baseNum * 0.05)) / multiplier).toFixed(decimalPlaces)
          ];

      return variations.map(v => units ? `${v} ${units}` : v);
    } else {
      // Tighter variations for time attack and sudden death
      const variationPercent = gameMode !== 'normal' ? 0.05 : 0.1;
      return [
        (numericPart - Math.max(1, Math.floor(numericPart * variationPercent))).toString(),
        (numericPart + Math.max(1, Math.floor(numericPart * variationPercent))).toString(),
        (numericPart + Math.max(2, Math.floor(numericPart * variationPercent * 1.5))).toString()
      ];
    }
  };

  if (topic === 'ARITHMETIC') {
    const makeCloserArithmetic = (value: number): number => {
      const maxOffset = gameMode !== 'normal' ? 1 : 2;
      return value + (Math.random() < 0.5 ? maxOffset : -maxOffset);
    };

    if (!isNaN(Number(correctAnswer))) {
      const numericAnswer = Number(correctAnswer);
      options.push(
        makeCloserArithmetic(numericAnswer).toString(),
        makeCloserArithmetic(numericAnswer + 1).toString(),
        makeCloserArithmetic(numericAnswer - 1).toString()
      );
    }
  } else if (topic === 'GEOMETRY') {
    const answer = correctAnswer.toLowerCase();
    
    // Extract numeric value and unit from the answer
    const match = answer.match(/^([\d.]+)\s*(square units|cubic units|units)?$/);
    if (match) {
      const numericValue = parseFloat(match[1]);
      const unit = match[2] || '';
      
      // Generate variations based on the numeric value
      const variations = [];
      const percentages = [0.9, 1.1, 1.2]; // 90%, 110%, 120%
      
      for (const pct of percentages) {
        const newValue = Math.round(numericValue * pct * 100) / 100;
        variations.push(`${newValue}${unit ? ' ' + unit : ''}`);
      }
      
      options.push(...variations);
    } else if (answer.includes('π')) {
      // Handle expressions with π
      const piValue = 3.14;
      const numericPart = parseFloat(answer.replace('π', piValue.toString()));
      if (!isNaN(numericPart)) {
        const variations = [
          (numericPart * 0.9).toFixed(2),
          (numericPart * 1.1).toFixed(2),
          (numericPart * 1.2).toFixed(2)
        ];
        options.push(...variations);
      }
    } else {
      // Default variations for non-numeric answers
      options.push(
        correctAnswer + ' (incorrect)',
        'Not enough information',
        'Cannot be determined'
      );
    }
  } else if (topic === 'STATISTICS') {
    // Convert answer to string and clean it
    const answer = correctAnswer.toString().trim();
    const numericValue = parseFloat(answer);

    if (!isNaN(numericValue)) {
      // Handle numeric answers (mean, median, standard deviation, etc.)
      const isDecimal = answer.includes('.');
      const variations = [];
      
      if (isDecimal) {
        // For decimal numbers (like standard deviation), use 2 decimal places
        variations.push(
          (numericValue + 0.5).toFixed(2),
          (numericValue - 0.5).toFixed(2),
          (numericValue + 1).toFixed(2)
        );
      } else {
        // For whole numbers (like mean, median), keep them as integers
        variations.push(
          Math.round(numericValue + 2).toString(),
          Math.round(numericValue - 2).toString(),
          Math.round(numericValue + 4).toString()
        );
      }
      
      options.push(...variations);
    } else {
      // For non-numeric answers, provide reasonable alternatives
      options.push(
        'Cannot be determined',
        'Insufficient data',
        'No valid answer'
      );
    }
  } else if (topic === 'ALGEBRA') {
    // Handle different formats of algebra answers
    if (correctAnswer.includes(',')) {
      // System of equations (e.g., "x = 3, y = 1")
      const parts = correctAnswer.split(',').map(part => part.trim());
      const variations = [];
      
      for (let i = 0; i < 3; i++) {
        const newParts = parts.map(part => {
          const [variable, value] = part.split('=').map(p => p.trim());
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            const offset = i + 1;
            return `${variable} = ${numValue + (Math.random() < 0.5 ? offset : -offset)}`;
          }
          return part;
        });
        variations.push(newParts.join(', '));
      }
      options.push(...variations);
    } else if (correctAnswer.includes('±')) {
      // Plus-minus answers (e.g., "x = ±2")
      const base = parseInt(correctAnswer.match(/±(\d+)/)?.[1] || '0');
      if (!isNaN(base)) {
        const variations = [
          `x = ±${base + 1}`,
          `x = ±${base - 1}`,
          base > 2 ? `x = ±${base - 2}` : `x = ±${base + 2}`
        ];
        options.push(...variations);
      }
    } else if (correctAnswer.includes('(') && correctAnswer.includes(')')) {
      // Factored form (e.g., "(x+3)(x-3)")
      const matches = correctAnswer.match(/[+-]?\d+/g);
      if (matches) {
        const numbers = matches.map(n => parseInt(n));
        const variations = [];
        
        for (let i = 0; i < 3; i++) {
          const offset = i + 1;
          const newNumbers = numbers.map(n => {
            const newVal = n + (Math.random() < 0.5 ? offset : -offset);
            return newVal >= 0 ? `+${newVal}` : newVal.toString();
          });
          
          // Ensure proper formatting of the factored expression
          const expr = correctAnswer.replace(/[+-]?\d+/g, () => newNumbers.shift() || '0');
          variations.push(expr);
        }
        options.push(...variations);
      } else {
        // Fallback for complex expressions
        options.push(
          correctAnswer.replace(/\d+/g, m => (parseInt(m) + 1).toString()),
          correctAnswer.replace(/\d+/g, m => (parseInt(m) - 1).toString()),
          correctAnswer.replace(/\d+/g, m => (parseInt(m) + 2).toString())
        );
      }
    } else if (correctAnswer.includes('=')) {
      // Single variable equation (e.g., "x = 7")
      const [variable, valueStr] = correctAnswer.split('=').map(p => p.trim());
      const value = parseInt(valueStr);
      if (!isNaN(value)) {
        const variations = [
          `${variable} = ${value + 1}`,
          `${variable} = ${value - 1}`,
          value > 2 ? `${variable} = ${value - 2}` : `${variable} = ${value + 2}`
        ];
        options.push(...variations);
      }
    } else {
      // Numeric answers
      const numericAnswer = Number(correctAnswer);
      if (!isNaN(numericAnswer)) {
        const variations = [
          (numericAnswer + 1).toString(),
          (numericAnswer - 1).toString(),
          numericAnswer > 2 ? (numericAnswer - 2).toString() : (numericAnswer + 2).toString()
        ];
        options.push(...variations);
      }
    }

    // If no options were generated, add some default variations
    if (options.length === 1) {
      options.push(
        correctAnswer + ' (incorrect)',
        'No solution',
        'undefined'
      );
    }
  } else if (topic === 'PROBABILITY') {
    const makeCloserProbability = (num: number, den: number): { num: number; den: number } => {
      const strategy = Math.random();
      let newNum = num, newDen = den;
      
      // Tighter variations for time attack and sudden death
      const maxOffset = gameMode !== 'normal' ? 1 : 2;
      
      if (strategy < 0.33) {
        // Adjust numerator only
        newNum = num + (Math.random() < 0.5 ? maxOffset : -maxOffset);
      } else if (strategy < 0.66) {
        // Adjust denominator only
        newDen = den + (Math.random() < 0.5 ? maxOffset * 2 : -maxOffset * 2);
      } else {
        // Adjust both slightly
        newNum = num + (Math.random() < 0.5 ? maxOffset : -maxOffset);
        newDen = den + (Math.random() < 0.5 ? maxOffset : -maxOffset);
      }
      
      // Ensure valid probability
      if (newNum <= 0) newNum = 1;
      if (newDen <= newNum) newDen = newNum + 1;
      return { num: newNum, den: newDen };
    };

    if (correctAnswer.includes('/')) {
      const [num, den] = correctAnswer.split('/').map(n => parseInt(n));
      if (!isNaN(num) && !isNaN(den)) {
        const variations = new Set<string>();
        while (variations.size < 3) {
          const { num: newNum, den: newDen } = makeCloserProbability(num, den);
          variations.add(`${newNum}/${newDen}`);
        }
        options.push(...Array.from(variations));
      }
    } else if (correctAnswer.includes('%')) {
      const percent = parseInt(correctAnswer);
      if (!isNaN(percent)) {
        const variations = new Set<string>();
        // Tighter variations for time attack and sudden death
        const maxOffset = gameMode !== 'normal' ? 5 : 10;
        while (variations.size < 3) {
          const offset = Math.floor(Math.random() * maxOffset) + 2;
          const newVal = Math.min(100, Math.max(0, percent + (Math.random() < 0.5 ? offset : -offset)));
          variations.add(`${newVal}%`);
        }
        options.push(...Array.from(variations));
      }
    } else if (correctAnswer.includes('or')) {
      const parts = correctAnswer.split(' or ');
      const decimal = parseFloat(parts[1]);
      if (!isNaN(decimal)) {
        const variations = new Set<string>();
        // Tighter variations for time attack and sudden death
        const maxOffset = gameMode !== 'normal' ? 0.05 : 0.1;
        while (variations.size < 3) {
          const offset = (Math.random() * maxOffset) - (maxOffset / 2);
          const newDecimal = Math.max(0, Math.min(1, decimal + offset));
          const fraction = Math.round(newDecimal * 100) / 100;
          variations.add(`${Math.round(fraction * 100)}/${100} or ${fraction.toFixed(2)}`);
        }
        options.push(...Array.from(variations));
      }
    } else {
      const prob = parseFloat(correctAnswer);
      if (!isNaN(prob)) {
        const variations = new Set<string>();
        // Tighter variations for time attack and sudden death
        const maxOffset = gameMode !== 'normal' ? 0.05 : 0.1;
        while (variations.size < 3) {
          const offset = (Math.random() * maxOffset) - (maxOffset / 2);
          const newProb = Math.max(0, Math.min(1, prob + offset));
          variations.add(newProb.toFixed(4));
        }
        options.push(...Array.from(variations));
      }
    }
  }
  
  // Ensure we have exactly 4 unique options
  const uniqueOptions = Array.from(new Set(options));
  while (uniqueOptions.length < 4) {
    if (topic === 'ALGEBRA') {
      if (correctAnswer.includes(',')) {
        const vars = correctAnswer.split(',').map(part => {
          const [variable] = part.trim().split('=');
          // Tighter range for time attack and sudden death
          const range = gameMode !== 'normal' ? 10 : 20;
          return `${variable.trim()}=${Math.floor(Math.random() * range) - (range / 2)}`;
        });
        uniqueOptions.push(vars.join(', '));
      } else if (correctAnswer.includes('±')) {
        // Tighter range for time attack and sudden death
        const maxNum = gameMode !== 'normal' ? 5 : 10;
        const num = Math.floor(Math.random() * maxNum) + 1;
        uniqueOptions.push(`x = ±${num}`);
      } else if (correctAnswer.includes('=')) {
        const [variable] = correctAnswer.split('=');
        // Tighter range for time attack and sudden death
        const range = gameMode !== 'normal' ? 10 : 20;
        uniqueOptions.push(`${variable.trim()} = ${Math.floor(Math.random() * range) - (range / 2)}`);
      }
    } else if (topic === 'PROBABILITY') {
      if (correctAnswer.includes('/')) {
        // Tighter range for time attack and sudden death
        const maxDen = gameMode !== 'normal' ? 6 : 10;
        const den = Math.floor(Math.random() * maxDen) + 2;
        const num = Math.floor(Math.random() * (den - 1)) + 1;
        uniqueOptions.push(`${num}/${den}`);
      } else if (correctAnswer.includes('%')) {
        // Tighter range for time attack and sudden death
        const step = gameMode !== 'normal' ? 5 : 10;
        const value = Math.floor(Math.random() * (100 / step)) * step;
        uniqueOptions.push(`${value}%`);
      } else {
        // Tighter precision for time attack and sudden death
        const precision = gameMode !== 'normal' ? 3 : 2;
        uniqueOptions.push(Math.random().toFixed(precision));
      }
    }
  }
  
  return uniqueOptions
    .slice(0, 4)
    .sort(() => Math.random() - 0.5);
};

const getRandomQuestions = (
  topic: string,
  level: "Level 1" | "Level 2" | "Level 3",
  gameMode: 'normal' | 'timeAttack' | 'suddenDeath' = 'normal'
): Question[] => {
  try {
    console.log(`Fetching questions for topic: ${topic}, level: ${level}`);
    const topicData = dataset[topic as keyof typeof dataset];
    if (!topicData || !topicData[level]) {
      console.error('No questions found for:', topic, level);
      return [];
    }

    const questions = topicData[level];
    const randomQuestions: Question[] = [];
    
    // Convert questions to question-answer pairs
    const questionArray = questions.map(questionObj => {
      const entries = Object.entries(questionObj);
      const qEntry = entries.find(([key]) => key.startsWith('Q'));
      const aEntry = entries.find(([key]) => key.startsWith('A'));
      
      if (qEntry && aEntry) {
        console.log(`Found question: ${qEntry[1]} with answer: ${aEntry[1]}`);
        return {
          question: qEntry[1],
          answer: aEntry[1]
        };
      }
      return null;
    }).filter((q): q is { question: string; answer: string } => q !== null);

    // Shuffle and take required number of questions
    const shuffled = [...questionArray].sort(() => Math.random() - 0.5);
    const numQuestions = gameMode === 'normal' ? 5 : 20;
    
    for (let i = 0; i < Math.min(numQuestions, shuffled.length); i++) {
      const q = shuffled[i];
      if (q) {
        const formattedAnswer = q.answer.trim();
        randomQuestions.push({
          text: q.question,
          answer: formattedAnswer,
          options: generateRandomOptions(formattedAnswer, topic, gameMode),
          topic: topic
        });
      }
    }
    
    if (randomQuestions.length === 0) {
      console.error('No valid questions generated for:', topic, level);
    } else {
      console.log(`Generated ${randomQuestions.length} questions for topic: ${topic}, level: ${level}`);
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
  const [gameMode, setGameMode] = useState<'normal' | 'timeAttack' | 'suddenDeath'>('normal');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    console.log(`Level selected: ${level}, Topic: ${topic}`);
    if (level && topic) {
      console.log('Attempting to fetch questions...');
      // Ensure level is one of the valid string literals
      const validLevel = level as "Level 1" | "Level 2" | "Level 3";
      const allQuestions = getRandomQuestions(topic.toUpperCase(), validLevel, gameMode);
      console.log(`Questions fetched: ${allQuestions.length}`);
      if (allQuestions.length === 0) {
        setError('No questions available for this level. Please try another level.');
        setQuestions([]);
      } else {
        setError(null);
        // In Time Attack and Sudden Death, use more questions
        const questionCount = gameMode === 'normal' ? 5 : 20;
        const selectedQuestions = allQuestions.slice(0, questionCount);
        console.log(`Selected ${selectedQuestions.length} questions for quiz.`);
        setQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswer('');
        setScore(0);
        setShowResult(false);
        setIsCorrect(null);
        setShowConfetti(false);
        setStreak(0);
        setBestStreak(0);
        
        // Set initial time for Time Attack mode
        if (gameMode === 'timeAttack') {
          setTimeLeft(60); // 60 seconds for Time Attack
          console.log('Time Attack mode: 60 seconds set.');
        }
        
        // Set lives for Sudden Death mode
        if (gameMode === 'suddenDeath') {
          setLives(3);
          console.log('Sudden Death mode: 3 lives set.');
        }
      }
    }
  }, [topic, level, gameMode]);

  // Timer for Time Attack mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameMode === 'timeAttack' && timeLeft > 0 && !showResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowResult(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameMode, showResult]);

  const handleLevelSelect = (selectedLevel: string) => {
    setLevel(selectedLevel);
    setError(null);
  };

  const handleGameModeSelect = (mode: 'normal' | 'timeAttack' | 'suddenDeath') => {
    setGameMode(mode);
    setLevel(null);
    resetGame();
  };

  const resetGame = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setScore(0);
    setShowResult(false);
    setIsCorrect(null);
    setShowConfetti(false);
    setError(null);
    setTimeLeft(0);
    setLives(3);
    setStreak(0);
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correct = userAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      
      if (gameMode === 'timeAttack') {
        // Add bonus time for correct answers
        setTimeLeft(prev => Math.min(prev + 3, 60)); // Add 3 seconds, max 60
      }
      
      if (score + 1 >= Math.floor(questions.length * 0.8)) {
        setShowConfetti(true);
      }
    } else {
      setStreak(0);
      if (gameMode === 'suddenDeath') {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setShowResult(true);
          }
          return newLives;
        });
      }
    }

    const delay = gameMode === 'timeAttack' ? 500 : 1500; // Faster feedback in Time Attack
    
    setTimeout(() => {
      setIsCorrect(null);
      setUserAnswer('');
      
      if (currentQuestionIndex < questions.length - 1 && 
          (gameMode !== 'suddenDeath' || lives > 1 || correct)) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (!correct && gameMode === 'suddenDeath' && lives <= 1) {
        setShowResult(true);
      } else if (currentQuestionIndex >= questions.length - 1) {
        setShowResult(true);
      }
    }, delay);
  };

  const handleRetry = () => {
    setLevel(null);
    resetGame();
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
            <div className="flex items-center">
              <img src={logo} alt="MathMaster Logo" className="w-8 h-8 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800 capitalize">
                {topic} Quiz - {gameMode === 'normal' ? 'Classic' : gameMode === 'timeAttack' ? 'Time Attack' : 'Sudden Death'}
              </h1>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!gameMode ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Select Game Mode:</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'normal', name: 'Classic', desc: '5 questions, no time limit' },
                  { id: 'timeAttack', name: 'Time Attack', desc: '60 seconds, score as many as you can' },
                  { id: 'suddenDeath', name: 'Sudden Death', desc: '3 lives, how far can you go?' }
                ].map((mode) => (
                  <motion.button
                    key={mode.id}
                    onClick={() => handleGameModeSelect(mode.id as any)}
                    className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex flex-col items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-bold">{mode.name}</span>
                    <span className="text-sm mt-2 text-indigo-100">{mode.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : !level ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Select Difficulty Level:</h2>
              <div className="grid grid-cols-3 gap-3">
                {['Level 1', 'Level 2', 'Level 3'].map((l) => (
                  <motion.button
                    key={l}
                    onClick={() => handleLevelSelect(l)}
                    className="py-4 text-lg font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
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
                <span className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {gameMode === 'normal' ? questions.length : '∞'}
                </span>
                <div className="flex items-center gap-4">
                  {gameMode === 'timeAttack' && (
                    <span className="text-gray-600">Time: {timeLeft}s</span>
                  )}
                  {gameMode === 'suddenDeath' && (
                    <span className="text-gray-600">Lives: {'❤️'.repeat(lives)}</span>
                  )}
                  <span className="text-gray-600">Score: {score}</span>
                  <span className="text-gray-600">Streak: {streak}</span>
                </div>
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
              <div className="space-y-2">
                <p className="text-xl text-gray-700">Final Score: {score}</p>
                <p className="text-gray-600">Best Streak: {bestStreak}</p>
                {gameMode === 'suddenDeath' && (
                  <p className="text-gray-600">Questions Answered: {currentQuestionIndex + 1}</p>
                )}
                {gameMode === 'timeAttack' && (
                  <p className="text-gray-600">Questions Per Minute: {Math.round((score / 60) * 60)}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={handleRetry}
                  className="py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={() => navigate('/')}
                  className="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Home
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}