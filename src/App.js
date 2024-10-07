// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StationsList from './components/StationsList';
import StationDetail from './components/StationDetail';
import Header from './components/Header';
import JourneyPlanner from './components/JourneyPlanner';
import Favorites from './components/Favorites';
import './styles.css';

function App() {
  return (
    <Router>
      <Header />
      <div className="p-6 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<StationsList />} />
          <Route path="/station/:id" element={<StationDetail />} />
          <Route path="/journey-planner" element={<JourneyPlanner />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
