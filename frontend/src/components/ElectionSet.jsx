import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const ElectionSet = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [postName, setPostName] = useState('');
    const [scheduledElections, setScheduledElections] = useState([]);
    const [scheduledDateTime, setScheduledDateTime] = useState('');
    const [scheduledEndDateTime, setScheduledEndDateTime] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(votingContract);
                fetchScheduledElections(votingContract);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchScheduledElections = async (votingContract) => {
        try {
            const posts = await votingContract.getPostList();
            const elections = [];
            for (const post of posts) {
                const info = await votingContract.getElectionInfo(post);
                elections.push({
                    post,
                    state: Number(info[0]),
                    startTime: Number(info[1]),
                    endTime: Number(info[2])
                });
            }
            setScheduledElections(elections);
        } catch (error) {
            console.error("Error fetching scheduled elections:", error);
        }
    };

    const scheduleElection = async () => {
        if (!contract) return;
        if (!postName) {
            alert("Please enter a post name");
            return;
        }
        if (!scheduledDateTime || !scheduledEndDateTime) {
            alert("Please select both start and end date/time");
            return;
        }

        const startTime = Math.floor(new Date(scheduledDateTime).getTime() / 1000);
        const endTime = Math.floor(new Date(scheduledEndDateTime).getTime() / 1000);

        if (endTime <= startTime) {
            alert("End time must be after start time");
            return;
        }

        setLoading(true);
        try {
            const tx = await contract.setElectionTimes(postName, startTime, endTime);
            await tx.wait();
            alert(`Election scheduled for ${postName}!`);
            setPostName('');
            setScheduledDateTime('');
            setScheduledEndDateTime('');
            fetchScheduledElections(contract);
        } catch (error) {
            console.error("Error scheduling election:", error);
            alert("Failed to schedule: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const startElection = async (post) => {
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.startElection(post);
            await tx.wait();
            alert(`Election for ${post} started!`);
            fetchScheduledElections(contract);
        } catch (error) {
            console.error("Error starting election:", error);
            alert("Failed to start: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const endElection = async (post) => {
        if (!contract) return;
        if (!window.confirm(`End election for ${post}?`)) return;
        setLoading(true);
        try {
            const tx = await contract.endElection(post);
            await tx.wait();
            alert(`Election for ${post} ended!`);
            fetchScheduledElections(contract);
        } catch (error) {
            console.error("Error ending election:", error);
            alert("Failed to end: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const resetElection = async (post) => {
        if (!contract) return;
        if (!window.confirm(`Reset votes for ${post}? (Candidates and post will remain)`)) return;
        setLoading(true);
        try {
            const tx = await contract.resetElection(post);
            await tx.wait();
            alert(`Election for ${post} reset! Votes cleared.`);
            fetchScheduledElections(contract);
        } catch (error) {
            console.error("Error resetting election:", error);
            alert("Failed to reset: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const deleteElection = async (post) => {
        if (!contract) return;
        console.log("Contract object:", contract);
        console.log("Available functions:", Object.keys(contract));

        if (typeof contract.deleteElection !== 'function') {
            alert("Error: deleteElection function not found on contract. Please hard refresh your browser (Ctrl+F5).");
            return;
        }

        if (!window.confirm(`ENTIRELY DELETE election for ${post}? This will remove all candidates and the post itself.`)) return;
        setLoading(true);
        try {
            const tx = await contract.deleteElection(post);
            await tx.wait();
            alert(`Election for ${post} entirely deleted!`);
            fetchScheduledElections(contract);
        } catch (error) {
            console.error("Error deleting election:", error);
            alert("Failed to delete: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const getStatusText = (state) => {
        if (state === 0) return "Not Scheduled";
        if (state === 1) return "Voting Open";
        if (state === 2) return "Voting Closed";
        return "Unknown";
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Election Management</h1>
                    <p className="text-gray-400 mt-2">Schedule and manage multiple election categories</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Scheduling Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg sticky top-8">
                            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                                <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-sm">📅</span> Schedule New
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Post Name</label>
                                    <input
                                        type="text"
                                        value={postName}
                                        onChange={(e) => setPostName(e.target.value)}
                                        placeholder="e.g. President"
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledDateTime}
                                        onChange={(e) => setScheduledDateTime(e.target.value)}
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledEndDateTime}
                                        onChange={(e) => setScheduledEndDateTime(e.target.value)}
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white transition-colors text-sm"
                                    />
                                </div>
                                <button
                                    onClick={scheduleElection}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg mt-2 text-sm"
                                >
                                    {loading ? 'Processing...' : 'Schedule Election'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scheduled Elections List */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                                <span className="bg-green-500/20 text-green-400 p-2 rounded-lg text-sm">📋</span> Scheduled Elections
                            </h2>

                            {scheduledElections.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                                    <p className="text-gray-500">No elections scheduled yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {scheduledElections.map((election) => (
                                        <div key={election.post} className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{election.post}</h3>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(election.startTime * 1000).toLocaleString()} — {new Date(election.endTime * 1000).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${election.state === 1 ? 'bg-green-500/20 text-green-400' : election.state === 2 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {getStatusText(election.state)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                                                <button
                                                    onClick={() => startElection(election.post)}
                                                    disabled={election.state !== 0 || loading}
                                                    className="flex-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 border border-green-600/30"
                                                >
                                                    ▶️ Start
                                                </button>
                                                <button
                                                    onClick={() => endElection(election.post)}
                                                    disabled={election.state !== 1 || loading}
                                                    className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 border border-red-600/30"
                                                >
                                                    🛑 End
                                                </button>
                                                <button
                                                    onClick={() => resetElection(election.post)}
                                                    disabled={election.state !== 2 || loading}
                                                    className="flex-1 bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 border border-yellow-600/30"
                                                >
                                                    🔄 Reset
                                                </button>
                                                <button
                                                    onClick={() => deleteElection(election.post)}
                                                    disabled={loading}
                                                    className="flex-1 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 border border-red-600/30"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 text-center">
                    <p className="text-gray-400 text-sm">Current Server Time: <span className="text-blue-400 font-mono">{currentTime.toLocaleTimeString()}</span></p>
                </div>
            </div>
        </div>
    );
};

export default ElectionSet;
