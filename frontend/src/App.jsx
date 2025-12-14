import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import VoterDashboard from './components/VoterDashboard';
import LandingPage from './components/LandingPage';
import VoterList from './components/VoterList';
import VoteDetails from './components/VoteDetails';

function AppContent() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAccount(null);
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate('/')}
          >
            TrustChain
          </h1>
          <div className="flex items-center gap-6">
            {account && isAdmin && (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link to="/voter-list" className="text-gray-600 hover:text-blue-600 transition-colors">Voter List</Link>
                <Link to="/vote-details" className="text-gray-600 hover:text-blue-600 transition-colors">Vote Details</Link>
              </>
            )}
            {account && (
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={<Login setAccount={setAccount} setIsAdmin={setIsAdmin} />}
        />
        <Route
          path="/admin"
          element={
            isAdmin && account ? (
              <AdminPanel account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/voter-list"
          element={
            isAdmin && account ? (
              <VoterList account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/vote-details"
          element={
            isAdmin && account ? (
              <VoteDetails account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/voter"
          element={
            account && !isAdmin ? (
              <VoterDashboard account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
