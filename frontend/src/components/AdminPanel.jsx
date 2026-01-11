import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const AdminPanel = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [voters, setVoters] = useState([]);
    const [electionState, setElectionState] = useState(0);
    const [candidateName, setCandidateName] = useState('');
    const [candidateParty, setCandidateParty] = useState('');
    const [candidateImage, setCandidateImage] = useState('');
    const [candidateImageFile, setCandidateImageFile] = useState(null);
    const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'file'
    const [voterAddress, setVoterAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [scheduledDateTime, setScheduledDateTime] = useState('');
    const [scheduledEndDateTime, setScheduledEndDateTime] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [electionTimes, setElectionTimes] = useState({ startTime: 0, endTime: 0 });
    const [maxCandidates, setMaxCandidates] = useState(10);
    const [maxVoters, setMaxVoters] = useState(100);
    const [maxRegisteredUsers, setMaxRegisteredUsers] = useState(200);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPhone, setAdminPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(votingContract);
                fetchData(votingContract);
            }
        };
        init();
    }, []);

    // Real-time clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-end election when end time is reached
    useEffect(() => {
        const checkElectionEnd = async () => {
            if (contract && electionState === 1 && electionTimes.endTime > 0) {
                const now = Math.floor(Date.now() / 1000);
                if (now >= electionTimes.endTime) {
                    try {
                        console.log("Election end time reached. Automatically ending election...");
                        const tx = await contract.endElection();
                        await tx.wait();
                        console.log("Election ended automatically");
                        fetchData(contract);
                    } catch (error) {
                        console.error("Error auto-ending election:", error);
                    }
                }
            }
        };

        const interval = setInterval(checkElectionEnd, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [contract, electionState, electionTimes]);

    // Listen for CandidateAdded events to auto-refresh
    useEffect(() => {
        if (contract) {
            const handleCandidateAdded = (id, name, party, event) => {
                console.log('✅ CandidateAdded event received:', { id: id.toString(), name, party });
                console.log('Event details:', event);
                // Refresh data when a candidate is added
                fetchData(contract);
            };

            // Listen for the event
            contract.on('CandidateAdded', handleCandidateAdded);

            // Cleanup listener on unmount
            return () => {
                contract.off('CandidateAdded', handleCandidateAdded);
            };
        }
    }, [contract]);

    // Auto-start election when start time is reached
    useEffect(() => {
        const checkElectionStart = async () => {
            if (contract && electionState === 0 && electionTimes.startTime > 0 && electionTimes.endTime > 0) {
                const now = Math.floor(Date.now() / 1000);
                if (now >= electionTimes.startTime && now < electionTimes.endTime) {
                    try {
                        console.log("Election start time reached. Automatically starting election...");
                        const tx = await contract.startElection();
                        await tx.wait();
                        console.log("Election started automatically");
                        fetchData(contract);
                    } catch (error) {
                        console.error("Error auto-starting election:", error);
                    }
                }
            }
        };

        const interval = setInterval(checkElectionStart, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [contract, electionState, electionTimes]);

    const fetchData = async (votingContract) => {
        try {
            console.log('🔄 Fetching data from contract...');

            const candidatesData = await votingContract.getCandidates();
            console.log('📊 Fetched candidates:', candidatesData.length, 'candidates');
            console.log('Candidates details:', candidatesData.map(c => ({ id: c.id.toString(), name: c.name, party: c.party, votes: c.voteCount.toString() })));
            setCandidates(candidatesData);

            const votersData = await votingContract.getAllVoters();
            console.log('👥 Fetched voters:', votersData.length, 'voters');
            setVoters(votersData);

            const state = await votingContract.electionState();
            console.log('🗳️ Election state:', Number(state), '(0=NotScheduled, 1=Open, 2=Closed)');
            setElectionState(Number(state));

            // Fetch election times
            const times = await votingContract.getElectionTimes();
            setElectionTimes({
                startTime: Number(times[0]),
                endTime: Number(times[1])
            });

            // Fetch limits
            const maxC = await votingContract.maxCandidates();
            const maxV = await votingContract.maxVoters();
            const maxRU = await votingContract.maxRegisteredUsers();
            setMaxCandidates(Number(maxC));
            setMaxVoters(Number(maxV));
            setMaxRegisteredUsers(Number(maxRU));

            // Fetch registered users
            const registeredUsersData = await votingContract.getRegisteredUsers();
            console.log('👥 Fetched registered users:', registeredUsersData.length, 'users');
            setRegisteredUsers(registeredUsersData);

            const email = await votingContract.adminEmail();
            const phone = await votingContract.adminPhone();
            setAdminEmail(email);
            setAdminPhone(phone);
            setNewEmail(email);
            setNewPhone(phone);

            console.log('✅ Data fetch complete');
        } catch (error) {
            console.error("❌ Error fetching data:", error);
        }
    };

    const addCandidate = async (e) => {
        e.preventDefault();
        if (!contract) {
            console.error('❌ Contract not initialized');
            return;
        }

        setLoading(true);
        console.log('🚀 Starting candidate addition process...');

        try {
            let imageUrl = candidateImage;

            // If file is selected, convert to base64 data URL
            if (imageInputType === 'file' && candidateImageFile) {
                console.log('📁 Processing image file:', candidateImageFile.name, 'Size:', candidateImageFile.size, 'bytes');
                // Check file size (max 500KB recommended)
                if (candidateImageFile.size > 500000) {
                    alert("Warning: Large images may cause transaction failures. Consider using an image URL instead or upload a smaller image (< 500KB).");
                }
                imageUrl = await convertFileToDataURL(candidateImageFile);
                console.log('✅ Image converted to data URL, length:', imageUrl.length, 'characters');
            }

            console.log('📝 Adding candidate:', { name: candidateName, party: candidateParty, imageUrlLength: imageUrl.length });
            console.log('⏳ Sending transaction...');

            const tx = await contract.addCandidate(candidateName, candidateParty, imageUrl);
            console.log('📤 Transaction sent! Hash:', tx.hash);
            console.log('⏳ Waiting for confirmation...');

            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed! Block:', receipt.blockNumber);
            console.log('Receipt:', receipt);

            // Wait a moment for blockchain state to propagate
            console.log('⏳ Waiting for blockchain state to update...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Fetch updated data
            console.log('🔄 Fetching updated candidate list...');
            await fetchData(contract);

            // Verify the candidate was added
            const currentCandidates = await contract.getCandidates();
            console.log('✅ Verification: Current candidate count:', currentCandidates.length);

            alert("Candidate added successfully!");

            // Clear form
            setCandidateName('');
            setCandidateParty('');
            setCandidateImage('');
            setCandidateImageFile(null);

        } catch (error) {
            console.error("❌ Error adding candidate:", error);
            console.error('Error details:', {
                message: error.message,
                reason: error.reason,
                code: error.code,
                data: error.data
            });

            let errorMessage = "Failed to add candidate";

            if (error.message && error.message.includes("out of gas")) {
                errorMessage = "Transaction failed: Image too large. Please use an image URL instead of uploading a file, or upload a much smaller image (< 100KB).";
            } else if (error.reason) {
                errorMessage += ": " + error.reason;
            } else if (error.message) {
                if (error.message.includes("Max candidates reached")) {
                    errorMessage = "Maximum number of candidates reached";
                } else if (error.message.includes("Cannot add candidates during election")) {
                    errorMessage = "Cannot add candidates while election is in progress";
                } else if (error.message.includes("Only admin")) {
                    errorMessage = "Only admin can add candidates";
                } else {
                    errorMessage += ": " + error.message.substring(0, 100);
                }
            }

            alert(errorMessage);
        }
        setLoading(false);
    };

    const convertFileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const img = new Image();

            reader.onload = (e) => {
                img.src = e.target.result;
                img.onload = () => {
                    // Create canvas to resize image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set max dimensions
                    const maxWidth = 400;
                    const maxHeight = 400;
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with reduced quality
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedDataUrl);
                };
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Warn about large files
            if (file.size > 500000) {
                alert('Warning: Large image detected. The image will be compressed, but for best results, use an image URL instead.');
            }
            setCandidateImageFile(file);
        }
    };

    const authorizeVoter = async (e) => {
        e.preventDefault();
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.authorizeVoter(voterAddress);
            await tx.wait();
            alert("Voter authorized successfully!");
            setVoterAddress('');
            fetchData(contract);
        } catch (error) {
            console.error("Error authorizing voter:", error);
            alert("Failed to authorize voter");
        }
        setLoading(false);
    };

    const scheduleElection = async () => {
        if (!contract) return;
        if (!scheduledDateTime || !scheduledEndDateTime) {
            alert("Please select both start and end date/time for the election");
            return;
        }

        const startTime = Math.floor(new Date(scheduledDateTime).getTime() / 1000);
        const endTime = Math.floor(new Date(scheduledEndDateTime).getTime() / 1000);
        const now = Math.floor(Date.now() / 1000);

        if (endTime <= startTime) {
            alert("End time must be after start time");
            return;
        }

        if (endTime <= now) {
            alert("End time must be in the future");
            return;
        }

        setLoading(true);
        try {
            // Set the election times
            const setTimesTx = await contract.setElectionTimes(startTime, endTime);
            await setTimesTx.wait();

            // If start time is now or in the past, start immediately
            if (startTime <= now) {
                const tx = await contract.startElection();
                await tx.wait();
                alert(`Election started and will end at ${new Date(scheduledEndDateTime).toLocaleString()}!`);
            } else {
                alert(`Election scheduled! Will start at ${new Date(scheduledDateTime).toLocaleString()} and end at ${new Date(scheduledEndDateTime).toLocaleString()}`);
            }

            fetchData(contract);
        } catch (error) {
            console.error("Error scheduling election:", error);
            alert("Failed to schedule election: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const endElection = async () => {
        if (!contract) return;

        if (!window.confirm("Are you sure you want to end the election now?")) {
            return;
        }

        setLoading(true);
        try {
            const tx = await contract.endElection();
            await tx.wait();
            alert("Election ended successfully!");
            fetchData(contract);
        } catch (error) {
            console.error("Error ending election:", error);
            alert("Failed to end election: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const resetElection = async () => {
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.resetElection();
            await tx.wait();
            alert("Election reset!");
            fetchData(contract);
        } catch (error) {
            console.error("Error resetting election:", error);
            alert("Failed to reset election");
        }
        setLoading(false);
    };

    const handleSetLimits = async (e) => {
        e.preventDefault();
        if (!contract) return;
        setLoading(true);
        try {
            console.log('🔧 Setting limits:', { maxCandidates, maxVoters, maxRegisteredUsers });
            const tx = await contract.setLimits(maxCandidates, maxVoters, maxRegisteredUsers);
            await tx.wait();
            alert("Limits updated successfully!");
            fetchData(contract);
        } catch (error) {
            console.error("Error setting limits:", error);
            alert("Failed to set limits: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const deleteUser = async (userAddress, username) => {
        if (!contract) return;

        // Confirm deletion
        if (!window.confirm(`Delete user "${username}"?\nAddress: ${userAddress}`)) {
            return;
        }

        setLoading(true);
        try {
            console.log('🗑️ Deleting user:', username, userAddress);
            const tx = await contract.deleteUser(userAddress);
            await tx.wait();
            alert(`User "${username}" deleted successfully!`);
            fetchData(contract);
        } catch (error) {
            console.error("Error deleting user:", error);
            let errorMsg = "Failed to delete user";
            if (error.message?.includes("Cannot delete authorized voter")) {
                errorMsg = "Cannot delete: User is already authorized as a voter";
            } else if (error.message?.includes("User not registered")) {
                errorMsg = "User is not registered";
            }
            alert(errorMsg);
        }
        setLoading(false);
    };

    const quickAuthorizeUser = async (userAddress, username) => {
        if (!contract) return;
        setLoading(true);
        try {
            console.log('✅ Authorizing user:', username, userAddress);
            const tx = await contract.authorizeVoter(userAddress);
            await tx.wait();
            alert(`User "${username}" authorized successfully!`);
            fetchData(contract);
        } catch (error) {
            console.error("Error authorizing user:", error);
            alert("Failed to authorize user: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const setAdminContact = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const votingContract = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await votingContract.setAdminContact(newEmail, newPhone);
            await tx.wait();

            setAdminEmail(newEmail);
            setAdminPhone(newPhone);
            alert('Admin contact updated successfully!');
        } catch (error) {
            console.error('Error setting admin contact:', error);
            alert('Failed to update admin contact');
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (state) => {
        if (state === 0) return "Not Scheduled";
        if (state === 1) return "Voting Open";
        if (state === 2) return "Voting Closed";
        return "Unknown";
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-2">Manage elections securely on the blockchain</p>
                    </div>
                    <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                        <span className="text-sm text-gray-400">Connected: </span>
                        <span className="text-sm font-mono text-blue-400">{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}</span>
                    </div>
                </header>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg hover:border-blue-500/50 transition-all">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Candidates</h3>
                        <p className="text-4xl font-bold text-white">{candidates.length}</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg hover:border-green-500/50 transition-all">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Authorized Voters</h3>
                        <p className="text-4xl font-bold text-white">{voters.length}</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg hover:border-purple-500/50 transition-all">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Election Status</h3>
                        <p className={`text-4xl font-bold ${electionState === 1 ? 'text-green-400' : electionState === 2 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {getStatusText(electionState)}
                        </p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg hover:border-orange-500/50 transition-all">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Registered Users</h3>
                        <p className="text-4xl font-bold text-white">{registeredUsers.length}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Unlimited registration • {maxVoters} can be authorized
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-white">Election Controls</h2>

                    {/* Real-time Clock */}
                    <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Current Time:</span>
                            <span className="text-2xl font-mono font-bold text-blue-400">
                                {currentTime.toLocaleTimeString('en-US', { hour12: true })}
                            </span>
                        </div>
                        <div className="text-center mt-2 text-gray-500 text-sm">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    {/* Schedule Election */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Election Start Time</label>
                            <input
                                type="datetime-local"
                                value={scheduledDateTime}
                                onChange={(e) => setScheduledDateTime(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-white transition-colors"
                                disabled={electionState !== 0}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Election End Time</label>
                            <input
                                type="datetime-local"
                                value={scheduledEndDateTime}
                                onChange={(e) => setScheduledEndDateTime(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 text-white transition-colors"
                                disabled={electionState !== 0}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={scheduleElection}
                            disabled={electionState !== 0 || loading || !scheduledDateTime || !scheduledEndDateTime}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20"
                        >
                            📅 Schedule Election
                        </button>

                        <button
                            onClick={endElection}
                            disabled={electionState !== 1 || loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/20"
                        >
                            🛑 End Election
                        </button>

                        <button
                            onClick={resetElection}
                            disabled={electionState !== 2 || loading}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/20"
                        >
                            Reset Election
                        </button>
                    </div>
                </div>

                {/* Set Limits Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">⚙️</span> Configure Limits
                    </h2>
                    <form onSubmit={handleSetLimits}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Max Candidates</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                                    value={maxCandidates}
                                    onChange={(e) => setMaxCandidates(Number(e.target.value))}
                                    disabled={electionState !== 0}
                                />
                                <p className="text-xs text-gray-500 mt-1">Current: {candidates.length}</p>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Max Authorized Voters</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-white transition-colors"
                                    value={maxVoters}
                                    onChange={(e) => setMaxVoters(Number(e.target.value))}
                                    disabled={electionState !== 0}
                                />
                                <p className="text-xs text-gray-500 mt-1">Current: {voters.length}</p>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Max Registered Users (Reference)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white transition-colors"
                                    value={maxRegisteredUsers}
                                    onChange={(e) => setMaxRegisteredUsers(Number(e.target.value))}
                                    disabled={electionState !== 0}
                                />
                                <p className="text-xs text-gray-500 mt-1">Current: {registeredUsers.length} (unlimited)</p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={electionState !== 0 || loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/20"
                        >
                            💾 Update Limits
                        </button>
                        {electionState !== 0 && (
                            <p className="text-sm text-yellow-400 mt-3">
                                ⚠️ Limits can only be changed when election is not scheduled
                            </p>
                        )}
                    </form>
                </div>

                {/* Admin Contact Settings */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                        <span className="bg-pink-500/20 text-pink-400 p-2 rounded-lg">📧</span> Contact Settings
                    </h2>
                    <form onSubmit={setAdminContact}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Admin Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500 text-white transition-colors"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Current: {adminEmail}</p>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Admin Phone</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500 text-white transition-colors"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    placeholder="+1234567890"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Current: {adminPhone}</p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/20"
                        >
                            Update Contact Info
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Add Candidate */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                            <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">👤</span> Add Candidate
                        </h2>
                        <form onSubmit={addCandidate} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    placeholder="Enter candidate name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Party Affiliation</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                                    value={candidateParty}
                                    onChange={(e) => setCandidateParty(e.target.value)}
                                    placeholder="Enter party name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Candidate Image</label>

                                {/* Toggle between URL and File */}
                                <div className="flex gap-4 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('url')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageInputType === 'url'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        Image URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('file')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageInputType === 'file'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        Upload File
                                    </button>
                                </div>

                                {imageInputType === 'url' ? (
                                    <input
                                        type="text"
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                                        value={candidateImage}
                                        onChange={(e) => setCandidateImage(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        required={imageInputType === 'url'}
                                    />
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                                            required={imageInputType === 'file'}
                                        />
                                        {candidateImageFile && (
                                            <p className="mt-2 text-sm text-green-400">
                                                Selected: {candidateImageFile.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading || electionState !== 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-blue-500/20 mt-2"
                            >
                                Add Candidate
                            </button>
                        </form>
                    </div>

                    {/* Authorize Voter */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                            <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">🔐</span> Authorize Voter
                        </h2>
                        <form onSubmit={authorizeVoter} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Wallet Address</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 text-white transition-colors font-mono"
                                    value={voterAddress}
                                    onChange={(e) => setVoterAddress(e.target.value)}
                                    placeholder="0x..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/20 mt-2"
                            >
                                Authorize Voter
                            </button>
                        </form>

                        <div className="mt-8">
                            <h3 className="font-bold text-gray-300 mb-4">Authorized Voters</h3>
                            <div className="bg-gray-900/50 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
                                {voters.length === 0 ? (
                                    <p className="p-4 text-gray-500 text-center text-sm">No voters authorized yet</p>
                                ) : (
                                    voters.map((v, i) => (
                                        <div key={i} className="px-4 py-3 border-b border-gray-700 last:border-0 text-sm font-mono text-gray-300 hover:bg-gray-800/50 transition-colors">
                                            {v}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Ledger */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-white">Live Results Ledger</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-900/50 border-b border-gray-700">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Party</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Votes</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {candidates.map((candidate) => {
                                    const totalVotes = candidates.reduce((acc, c) => acc + Number(c.voteCount), 0);
                                    const percentage = totalVotes > 0 ? (Number(candidate.voteCount) / totalVotes) * 100 : 0;

                                    return (
                                        <tr key={candidate.id} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-400">#{candidate.id.toString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={candidate.imageUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-600" />
                                                    <span className="font-medium text-white">{candidate.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{candidate.party}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-white">{candidate.voteCount.toString()}</td>
                                            <td className="px-6 py-4 w-1/3">
                                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1 block">{percentage.toFixed(1)}%</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
