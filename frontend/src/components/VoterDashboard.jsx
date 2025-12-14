import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const VoterDashboard = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [electionState, setElectionState] = useState(0);
    const [voterStatus, setVoterStatus] = useState({ isAuthorized: false, hasVoted: false });
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [electionTimes, setElectionTimes] = useState({ startTime: 0, endTime: 0 });

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
    }, [account]);

    // Real-time clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async (votingContract) => {
        try {
            const candidatesData = await votingContract.getCandidates();
            setCandidates(candidatesData);
            const state = await votingContract.electionState();
            setElectionState(Number(state));
            if (account) {
                const status = await votingContract.getVoterStatus(account);
                setVoterStatus({ isAuthorized: status[0], hasVoted: status[1] });
            }
            // Fetch election times
            const times = await votingContract.getElectionTimes();
            setElectionTimes({
                startTime: Number(times[0]),
                endTime: Number(times[1])
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const castVote = async (candidateId) => {
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.vote(candidateId);
            await tx.wait();
            alert("Vote cast successfully!");
            fetchData(contract);
        } catch (error) {
            console.error("Error casting vote:", error);
            alert("Failed to cast vote. Ensure you are authorized and haven't voted yet.");
        }
        setLoading(false);
    };

    const getStatusText = (state) => {
        if (state === 0) return "Not Scheduled";
        if (state === 1) return "Voting Open";
        if (state === 2) return "Voting Closed";
        return "Unknown";
    };

    const getTimeRemaining = () => {
        if (electionTimes.endTime === 0) return null;

        const now = Math.floor(Date.now() / 1000);
        const timeLeft = electionTimes.endTime - now;

        if (timeLeft <= 0) return { expired: true };

        const days = Math.floor(timeLeft / (24 * 60 * 60));
        const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
        const seconds = timeLeft % 60;

        return { days, hours, minutes, seconds, expired: false };
    };

    const formatDate = (timestamp) => {
        if (timestamp === 0) return "Not set";
        return new Date(timestamp * 1000).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const timeRemaining = getTimeRemaining();

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Voter Dashboard</h1>
                        <p className="text-gray-400 mt-2">Cast your vote securely and transparently</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 mb-2 inline-block">
                            <span className="text-sm text-gray-400">Wallet: </span>
                            <span className="text-sm font-mono text-purple-400">{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}</span>
                        </div>
                        <div className={`text-sm font-bold uppercase tracking-wider ${electionState === 1 ? 'text-green-400' : 'text-red-400'}`}>
                            Status: {getStatusText(electionState)}
                        </div>
                    </div>
                </header>

                {/* Real-Time Clock and Election Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Current Time */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Current Time</h3>
                        <div className="text-3xl font-bold text-white font-mono">
                            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Time Remaining</h3>
                        {electionState === 1 && timeRemaining && !timeRemaining.expired ? (
                            <div className="flex gap-4">
                                {timeRemaining.days > 0 && (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{timeRemaining.days}</div>
                                        <div className="text-xs text-gray-500">Days</div>
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{String(timeRemaining.hours).padStart(2, '0')}</div>
                                    <div className="text-xs text-gray-500">Hours</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                                    <div className="text-xs text-gray-500">Minutes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                                    <div className="text-xs text-gray-500">Seconds</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                {electionState === 0 ? 'Election not started' : electionState === 2 ? 'Voting has ended' : 'No time limit set'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Election Schedule */}
                {(electionTimes.startTime > 0 || electionTimes.endTime > 0) && (
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg mb-8">
                        <h3 className="text-lg font-bold text-white mb-4">Election Schedule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-400 text-sm">Start Time: </span>
                                <span className="text-white font-medium">{formatDate(electionTimes.startTime)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 text-sm">End Time: </span>
                                <span className="text-white font-medium">{formatDate(electionTimes.endTime)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Voter Status Card */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full opacity-10 blur-xl"></div>

                    <h2 className="text-2xl font-bold mb-6 text-white relative z-10">Your Voting Status</h2>
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <div className={`w-4 h-4 rounded-full ${voterStatus.isAuthorized ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                            <span className="font-medium text-lg">{voterStatus.isAuthorized ? 'Authorized to Vote' : 'Not Authorized'}</span>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <div className={`w-4 h-4 rounded-full ${voterStatus.hasVoted ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-500'}`}></div>
                            <span className="font-medium text-lg">{voterStatus.hasVoted ? 'Vote Cast' : 'Has Not Voted'}</span>
                        </div>
                    </div>
                </div>

                {/* Candidates Grid */}
                <h2 className="text-3xl font-bold mb-8 text-white">Candidates</h2>
                {candidates.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                        <p className="text-gray-500 text-xl">No candidates available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {candidates.map((candidate) => (
                            <div key={candidate.id} className="group bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2">
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60 z-10"></div>
                                    <img
                                        src={candidate.imageUrl || "https://via.placeholder.com/400x300"}
                                        alt={candidate.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            {candidate.party}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{candidate.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                        Vote for {candidate.name} to represent the {candidate.party} party.
                                    </p>

                                    <button
                                        onClick={() => castVote(candidate.id)}
                                        disabled={!voterStatus.isAuthorized || voterStatus.hasVoted || electionState !== 1 || loading}
                                        className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                      ${!voterStatus.isAuthorized || voterStatus.hasVoted || electionState !== 1
                                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/25'
                                            }`}
                                    >
                                        {voterStatus.hasVoted ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Voted
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Vote Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Leaderboard */}
                {candidates.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                            <span className="text-4xl">🏆</span>
                            Leaderboard
                        </h2>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-900/50 border-b border-gray-700">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Party</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Votes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {[...candidates]
                                            .sort((a, b) => Number(b.voteCount) - Number(a.voteCount))
                                            .map((candidate, index) => (
                                                <tr key={candidate.id} className="hover:bg-gray-700/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {index === 0 && <span className="text-2xl">🥇</span>}
                                                            {index === 1 && <span className="text-2xl">🥈</span>}
                                                            {index === 2 && <span className="text-2xl">🥉</span>}
                                                            {index > 2 && <span className="text-gray-500 font-bold">#{index + 1}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={candidate.imageUrl || "https://via.placeholder.com/40"}
                                                                alt={candidate.name}
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                                                            />
                                                            <span className="font-medium text-white">{candidate.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-400">{candidate.party}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <div className="text-2xl font-bold text-purple-400">{Number(candidate.voteCount)}</div>
                                                            <div className="w-24 bg-gray-700 rounded-full h-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${candidates.length > 0 ? (Number(candidate.voteCount) / Math.max(...candidates.map(c => Number(c.voteCount)), 1)) * 100 : 0}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoterDashboard;
