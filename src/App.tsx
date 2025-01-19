import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HeroPage from './pages/HeroPage';
import QuizPage from './pages/QuizPage';
import DailyChallengePage from './pages/DailyChallengePage';
import GameModePage from './pages/GameModePage';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/quiz/:topic" element={<QuizPage />} />
        <Route path="/daily-challenge" element={<DailyChallengePage />} />
        <Route path="/game-mode" element={<GameModePage />} />
      </Routes>
    </div>
  );
}