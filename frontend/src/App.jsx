import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import VoterDashboard from './components/VoterDashboard';
import LandingPage from './components/LandingPage';
import VoterList from './components/VoterList';
import VoteDetails from './components/VoteDetails';
import ElectionSet from './components/ElectionSet';
import Updation from './components/Updation';
import AddCandidate from './components/AddCandidate';
import Profile from './components/Profile';
import VoterResults from './components/VoterResults';
import VoterProfile from './components/VoterProfile';
import VoterHistory from './components/VoterHistory';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './constants';
import * as XLSX from 'xlsx';

function AppContent() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminContact, setAdminContact] = useState({ email: '', phone: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAccount(null);
    setIsAdmin(false);
    setAdminContact({ email: '', phone: '' });
    setShowDropdown(false);
    navigate('/');
  };

  useEffect(() => {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportToExcel = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const candidates = await contract.getCandidates();
      const posts = await contract.getPostList();
      const voters = await contract.getAllVoters();

      const wb = XLSX.utils.book_new();

      // Candidates Sheet
      const candidatesData = candidates.map(c => ({
        ID: Number(c.id),
        Name: c.name,
        Party: c.party,
        Post: c.post,
        Votes: Number(c.voteCount)
      }));
      const wsCandidates = XLSX.utils.json_to_sheet(candidatesData);
      XLSX.utils.book_append_sheet(wb, wsCandidates, "Candidates");

      // Election Info Sheet
      const electionData = [];
      for (const post of posts) {
        const info = await contract.getElectionInfo(post);
        electionData.push({
          Post: post,
          Status: Number(info[0]) === 0 ? "Not Scheduled" : Number(info[0]) === 1 ? "Open" : "Closed",
          StartTime: new Date(Number(info[1]) * 1000).toLocaleString(),
          EndTime: new Date(Number(info[2]) * 1000).toLocaleString()
        });
      }
      const wsElections = XLSX.utils.json_to_sheet(electionData);
      XLSX.utils.book_append_sheet(wb, wsElections, "Elections");

      // Voters Sheet
      const votersData = voters.map(v => ({ Address: v }));
      const wsVoters = XLSX.utils.json_to_sheet(votersData);
      XLSX.utils.book_append_sheet(wb, wsVoters, "Authorized Voters");

      XLSX.writeFile(wb, `Election_Details_${new Date().toLocaleDateString()}.xlsx`);
      alert("Election details exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
    }
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate('/')}
          >
            TrustChain
          </h1>
          <div className="flex items-center gap-4 md:gap-6">
            {account && isAdmin && (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Dashboard</Link>
                <Link to="/admin/election-set" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Election set</Link>
                <Link to="/admin/updation" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Updation</Link>
                <Link to="/admin/add-candidate" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Add candidate</Link>
                <Link to="/voter-list" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Voters</Link>
                <Link to="/vote-details" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Results</Link>
              </>
            )}
            {account && !isAdmin && (
              <div className="flex items-center gap-4">
                <Link to="/voter" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Dashboard</Link>
                <Link to="/voter/results" className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full hover:bg-green-100 transition-colors">
                  📊 Results
                </Link>
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all font-medium text-gray-700"
                >
                  <span>{isAdmin ? 'Admin' : 'Voter'}</span>
                  <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => { navigate('/admin/profile'); setShowDropdown(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                        >
                          👤 Profile
                        </button>
                        <button
                          onClick={exportToExcel}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2 transition-colors"
                        >
                          📊 Export Results
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { navigate('/voter/profile'); setShowDropdown(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2 transition-colors"
                        >
                          👤 Profile
                        </button>
                        <button
                          onClick={() => { navigate('/voter/history'); setShowDropdown(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2 transition-colors"
                        >
                          📜 Voting History
                        </button>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
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
          path="/admin/election-set"
          element={
            isAdmin && account ? (
              <ElectionSet account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/updation"
          element={
            isAdmin && account ? (
              <Updation account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/add-candidate"
          element={
            isAdmin && account ? (
              <AddCandidate account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/profile"
          element={
            isAdmin && account ? (
              <Profile account={account} />
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
          path="/voter/results"
          element={
            account && !isAdmin ? (
              <VoterResults account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/voter/profile"
          element={
            account && !isAdmin ? (
              <VoterProfile account={account} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/voter/history"
          element={
            account && !isAdmin ? (
              <VoterHistory account={account} />
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
