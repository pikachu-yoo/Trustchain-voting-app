import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const VoteDetails = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [voters, setVoters] = useState([]);
    const [voteDetails, setVoteDetails] = useState({});
    const [loading, setLoading] = useState(true);

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

    const fetchData = async (votingContract) => {
        setLoading(true);
        try {
            // Fetch candidates
            const candidatesData = await votingContract.getCandidates();
            setCandidates(candidatesData);

            // Fetch all registered users
            const registeredUsers = await votingContract.getRegisteredUsers();

            // Fetch voter details for each registered user
            const voterDetails = await Promise.all(
                registeredUsers.map(async (user) => {
                    const userInfo = await votingContract.getUserInfo(user.userAddress);
                    const voterData = await votingContract.voters(user.userAddress);

                    return {
                        address: user.userAddress,
                        username: userInfo[0], // username
                        isAuthorized: userInfo[2], // isAuthorized
                        hasVoted: userInfo[3], // hasVoted
                        votedCandidateId: voterData.hasVoted ? Number(voterData.votedCandidateId) : null
                    };
                })
            );

            setVoters(voterDetails);

            // Group voters by candidate
            const votesByCandidate = {};
            candidatesData.forEach(candidate => {
                votesByCandidate[candidate.id] = [];
            });

            voterDetails.forEach(voter => {
                if (voter.hasVoted && voter.votedCandidateId !== null) {
                    if (votesByCandidate[voter.votedCandidateId]) {
                        votesByCandidate[voter.votedCandidateId].push(voter);
                    }
                }
            });

            setVoteDetails(votesByCandidate);
        } catch (error) {
            console.error("Error fetching vote details:", error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Vote Details</h1>
                        <p className="text-gray-400 mt-2">See who voted for each candidate</p>
                    </div>
                    <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                        <span className="text-sm text-gray-400">Admin: </span>
                        <span className="text-sm font-mono text-green-400">{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}</span>
                    </div>
                </header>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-gray-400 mt-4">Loading vote details...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {candidates.length === 0 ? (
                            <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                                <p className="text-gray-500 text-xl">No candidates available</p>
                            </div>
                        ) : (
                            candidates.map((candidate) => (
                                <div key={candidate.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                                    {/* Candidate Header */}
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={candidate.imageUrl || "https://via.placeholder.com/80"}
                                                    alt={candidate.name}
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                                                />
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">{candidate.name}</h2>
                                                    <p className="text-gray-400">{candidate.party}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-4xl font-bold text-blue-400">{Number(candidate.voteCount)}</div>
                                                <div className="text-sm text-gray-500">Total Votes</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Voters List */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-300 mb-4">Voters ({voteDetails[candidate.id]?.length || 0})</h3>
                                        {voteDetails[candidate.id] && voteDetails[candidate.id].length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {voteDetails[candidate.id].map((voter, index) => (
                                                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {voter.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-white truncate">{voter.username}</div>
                                                                <div className="text-xs text-gray-500 font-mono truncate">{voter.address}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No votes yet for this candidate
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Summary Stats */}
                {!loading && candidates.length > 0 && (
                    <div className="mt-8 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4">Voting Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                <div className="text-gray-400 text-sm">Total Voters</div>
                                <div className="text-2xl font-bold text-white">{voters.filter(v => v.hasVoted).length}</div>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                <div className="text-gray-400 text-sm">Authorized Voters</div>
                                <div className="text-2xl font-bold text-white">{voters.filter(v => v.isAuthorized).length}</div>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                <div className="text-gray-400 text-sm">Turnout Rate</div>
                                <div className="text-2xl font-bold text-white">
                                    {voters.filter(v => v.isAuthorized).length > 0
                                        ? Math.round((voters.filter(v => v.hasVoted).length / voters.filter(v => v.isAuthorized).length) * 100)
                                        : 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoteDetails;
