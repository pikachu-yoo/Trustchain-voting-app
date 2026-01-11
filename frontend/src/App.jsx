import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import VoterDashboard from './components/VoterDashboard';
import LandingPage from './components/LandingPage';
import VoterList from './components/VoterList';
import VoteDetails from './components/VoteDetails';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './constants';

function AppContent() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminContact, setAdminContact] = useState({ email: '', phone: '' });
  const navigate = useNavigate();

  const handleLogout = () => {
    setAccount(null);
    setIsAdmin(false);
    setAdminContact({ email: '', phone: '' });
    navigate('/');
  };

  React.useEffect(() => {
    const fetchContact = async () => {
      if (account && !isAdmin && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const votingContract = new ethers.Contract(contractAddress, contractABI, provider);
          const email = await votingContract.adminEmail();
          const phone = await votingContract.adminPhone();
          setAdminContact({ email, phone });
        } catch (error) {
          console.error("Error fetching admin contact:", error);
        }
      }
    };
    fetchContact();
  }, [account, isAdmin]);

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
            {account && !isAdmin && (
              <div className="flex items-center gap-4">
                <a
                  href={`mailto:${adminContact.email}?subject=Complaint/Enquiry/Feedback&body=Issue in voting:`}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  📧 Send Mail
                </a>
                <span className="text-sm text-gray-500 border-l pl-4">
                  📞 Support: <span className="font-mono font-bold text-gray-700">{adminContact.phone}</span>
                </span>
              </div>
            )}
            {account && (
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 font-medium ml-4"
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
