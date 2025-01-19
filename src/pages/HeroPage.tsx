import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import animatedLogo from '../logo/logo_1.gif';

interface Topic {
  name: string;
  displayName: string;
  color: string;
  symbol: string;
}

const topics: Topic[] = [
  { name: 'ARITHMETIC', displayName: 'Arithmetic', color: 'bg-purple-500', symbol: '🔢' },
  { name: 'ALGEBRA', displayName: 'Algebra', color: 'bg-pink-500', symbol: '📐' },
  { name: 'GEOMETRY', displayName: 'Geometry', color: 'bg-emerald-500', symbol: '📏' },
  { name: 'PROBABILITY', displayName: 'Probability', color: 'bg-amber-500', symbol: '🎲' },
  { name: 'STATISTICS', displayName: 'Statistics', color: 'bg-blue-500', symbol: '📊' }
];

const LogoComponent = () => {
  const [showStatic, setShowStatic] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      const timer = setTimeout(() => {
        setShowStatic(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <img 
      src={showStatic ? animatedLogo + '#0' : animatedLogo}
      alt="MathMaster Logo" 
      className="w-32 h-32 object-cover"
    />
  );
};

export default function HeroPage() {
  const navigate = useNavigate();

  const handleTopicClick = (topic: Topic) => {
    navigate(`/quiz/${topic.name.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 overflow-hidden">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-32 h-32 bg-white rounded-full shadow-lg mx-auto mb-4 flex items-center justify-center">
            <LogoComponent />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">MathMaster</h1>
          <p className="text-gray-600">Master mathematics through interactive quizzes</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {topics.map((topic, index) => (
            <motion.button
              key={topic.name}
              onClick={() => handleTopicClick(topic)}
              className={`p-6 text-lg font-semibold text-white rounded-lg transition-all transform hover:scale-105 ${topic.color} hover:opacity-90`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">{topic.symbol}</span>
                <span>{topic.displayName}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => navigate('/daily-challenge')}
            className="py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: topics.length * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">🎯</span>
              <span>Daily Challenge</span>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate('/game-mode')}
            className="py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">🎮</span>
              <span>Game Mode</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}