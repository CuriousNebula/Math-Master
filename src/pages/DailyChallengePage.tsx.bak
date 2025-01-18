import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dataset from '../data/dataset.json';
import Confetti from 'react-confetti';

interface Question {
  text: string;
  answer: string;
  options: string[];
  topic: string;
  level: string;
}

const generateRandomOptions = (correctAnswer: string, topic: string): string[] => {
  const isNumber = !isNaN(Number(correctAnswer.split(' ')[0]));
  let options: string[] = [correctAnswer];
  
  if (isNumber) {
    const correctNum = Number(correctAnswer.split(' ')[0]);
    const unit = correctAnswer.split(' ').slice(1).join(' ');
    const offset = Math.max(1, Math.round(correctNum * 0.25));
    
    const variations = [
      correctNum + offset,
      correctNum - offset,
      correctNum + (offset * 2)
    ].filter(num => num > 0);

    options.push(...variations.map(num => unit ? `${num} ${unit}` : num.toString()));
  } else {
    options.push(
      correctAnswer + " (incorrect)",
      "Not " + correctAnswer,
      correctAnswer.split('').reverse().join('')
    );
  }
  
  return options.sort(() => Math.random() - 0.5);
};

const getRandomQuestionsFromAllTopics = (count: number): Question[] => {
  try {
    const allQuestions: Question[] = [];
    const topics = Object.keys(dataset);
    const maxQuestionsPerTopic = Math.ceil(count * 2 / topics.length);

    topics.forEach(topic => {
      const topicData = dataset[topic];
      let topicQuestions: Question[] = [];

      Object.keys(topicData).forEach(level => {
        const questions = topicData[level];
        questions.forEach(q => {
          const qKey = Object.keys(q).find(k => k.startsWith('Q'));
          const aKey = Object.keys(q).find(k => k.startsWith('A'));
          
          if (qKey && aKey && topicQuestions.length < maxQuestionsPerTopic) {
            const answer = q[aKey];
            topicQuestions.push({
              text: q[qKey],
              answer: answer,
              options: generateRandomOptions(answer, topic),
              topic: topic,
              level: level
            });
          }
        });
      });

      allQuestions.push(...topicQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, maxQuestionsPerTopic));
    });

    return allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  } catch (error) {
    console.error('Error in getRandomQuestionsFromAllTopics:', error);
    return [];
  }
};

export default function DailyChallengePage() {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (questionCount) {
      setIsLoading(true);
      try {
        const randomQuestions = getRandomQuestionsFromAllTopics(questionCount);
        if (randomQuestions.length === 0) {
          setError('Failed to load questions. Please try again.');
        } else {
          setQuestions(randomQuestions);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('An error occurred while loading questions.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [questionCount]);

  const handleQuestionCountSelect = (count: number) => {
    setQuestionCount(count);
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
          
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Daily Challenge
          </h1>

          {error && (
            <div className="p-4 mb-4 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {!questionCount && !isLoading && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">How many questions would you like to practice?</h2>
              <div className="grid grid-cols-3 gap-4">
                {[3, 5, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleQuestionCountSelect(count)}
                    className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>
          )}

          {questionCount && !isLoading && !showResult && questions.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-gray-600">Score: {score}</span>
              </div>

              {questions[currentQuestionIndex] && (
                <div className="mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        Topic: {questions[currentQuestionIndex].topic.charAt(0) + questions[currentQuestionIndex].topic.slice(1).toLowerCase()}
                      </span>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium ml-2">
                        {questions[currentQuestionIndex].level}
                      </span>
                    </div>
                    <h2 className="text-xl text-gray-800 mb-4">{questions[currentQuestionIndex].text}</h2>
                    <div className="space-y-3">
                      {questions[currentQuestionIndex].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setUserAnswer(option)}
                          className={`w-full p-3 text-left rounded-lg transition-colors ${
                            userAnswer === option
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {userAnswer && (
                <button
                  onClick={handleAnswerSubmit}
                  className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Answer
                </button>
              )}

              {isCorrect !== null && (
                <div className={`mt-4 p-3 rounded-lg text-center ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
                </div>
              )}
            </div>
          )}

          {showResult && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Challenge Complete!</h2>
              <p className="text-xl mb-6">
                Your score: {score} out of {questions.length}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Back to Home
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
