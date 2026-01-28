import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const VoterHistory = ({ account }) => {
    const [votingHistory, setVotingHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (window.ethereum && account) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const contract = new ethers.Contract(contractAddress, contractABI, provider);

                    const posts = await contract.getPostList();
                    const candidates = await contract.getCandidates();
                    const history = [];

                    for (const post of posts) {
                        const status = await contract.getVoterStatus(account, post);
                        const hasVoted = status[1];
                        const candidateId = Number(status[2]);

                        if (hasVoted) {
                            const candidate = candidates.find(c => Number(c.id) === candidateId);
                            history.push({
                                post,
                                voted: true,
                                candidateName: candidate ? candidate.name : 'Unknown',
                                candidateParty: candidate ? candidate.party : 'Unknown',
                                candidateImage: candidate ? candidate.imageUrl : null
                            });
                        } else {
                            history.push({
                                post,
                                voted: false
                            });
                        }
                    }
                    setVotingHistory(history);
                } catch (error) {
                    console.error("Error fetching voting history:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchHistory();
    }, [account]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Voting History</h1>
                    <p className="text-gray-400 mt-2">A permanent record of your participation</p>
                </header>

                {votingHistory.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                        <p className="text-gray-500 text-xl">You haven't participated in any elections yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {votingHistory.map((item, index) => (
                            <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 ${item.voted ? 'bg-gray-800/80 border-purple-500/30 shadow-lg' : 'bg-gray-800/30 border-gray-700 opacity-60'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-1">{item.post}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.voted ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                {item.voted ? '✓ Voted' : '✗ Not Voted'}
                                            </span>
                                        </div>
                                    </div>

                                    {item.voted ? (
                                        <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700 min-w-[300px]">
                                            <img
                                                src={item.candidateImage || "https://via.placeholder.com/50"}
                                                alt={item.candidateName}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Voted For</p>
                                                <p className="text-lg font-bold text-white">{item.candidateName}</p>
                                                <p className="text-xs text-purple-400">{item.candidateParty}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 italic text-sm">
                                            No vote cast for this post
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <p className="text-gray-600 text-xs">
                        All votes are recorded on the blockchain and are immutable. Your identity remains anonymous to others while your vote is counted.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoterHistory;
