import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import io from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Threats from './pages/Threats/Threats';
import Analysis from './pages/Analysis/Analysis';
import ThreatDetail from './pages/ThreatDetail/ThreatDetail';
import Notifications from './pages/Notifications/Notifications';

// Initialize WebSocket connection
const socket = io('http://localhost:5000');

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar socket={socket} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard socket={socket} />} />
            <Route path="/threats" element={<Threats />} />
            <Route path="/analysis" element={<Analysis socket={socket} />} />
            <Route path="/threat/:id" element={<ThreatDetail />} />
            <Route path="/notifications" element={<Notifications socket={socket} />} />
          </Routes>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;