import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const VoterResults = ({ account }) => {
    const [candidates, setCandidates] = useState([]);
    const [postList, setPostList] = useState([]);
    const [electionsInfo, setElectionsInfo] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const votingContract = new ethers.Contract(contractAddress, contractABI, provider);
                fetchData(votingContract);
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

    const fetchData = async (votingContract) => {
        try {
            const candidatesData = await votingContract.getCandidates();
            setCandidates(candidatesData);

            const posts = await votingContract.getPostList();
            setPostList(posts);

            const infoMap = {};
            for (const post of posts) {
                const info = await votingContract.getElectionInfo(post);
                infoMap[post] = {
                    state: Number(info[0]),
                    startTime: Number(info[1]),
                    endTime: Number(info[2])
                };
            }
            setElectionsInfo(infoMap);
        } catch (error) {
            console.error("Error fetching data:", error);
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
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center">Live Election Results</h1>
                    <p className="text-gray-400 mt-2 text-center">Real-time leaderboard for all active and completed elections</p>
                </header>

                <div className="space-y-20">
                    {postList.map(post => {
                        const postCandidates = candidates.filter(c => c.post === post);
                        const info = electionsInfo[post] || { state: 0 };

                        return (
                            <section key={post} className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 shadow-xl">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                            <span className="bg-blue-600 w-2 h-8 rounded-full"></span>
                                            {post}
                                        </h2>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Status: <span className={`font-bold ${info.state === 1 ? 'text-green-400' : info.state === 2 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {getStatusText(info.state)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Votes</p>
                                        <p className="text-3xl font-black text-blue-400">
                                            {postCandidates.reduce((sum, c) => sum + Number(c.voteCount), 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[...postCandidates]
                                        .sort((a, b) => Number(b.voteCount) - Number(a.voteCount))
                                        .map((candidate, index) => (
                                            <div key={candidate.id} className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row items-center gap-6 hover:border-gray-600 transition-all">
                                                <div className="flex items-center gap-4 min-w-[60px]">
                                                    {index === 0 && <span className="text-4xl">🥇</span>}
                                                    {index === 1 && <span className="text-4xl">🥈</span>}
                                                    {index === 2 && <span className="text-4xl">🥉</span>}
                                                    {index > 2 && <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>}
                                                </div>

                                                <div className="flex items-center gap-4 flex-1">
                                                    <img
                                                        src={candidate.imageUrl || "https://via.placeholder.com/60"}
                                                        alt={candidate.name}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                                                    />
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">{candidate.name}</h3>
                                                        <p className="text-blue-400 text-sm font-medium">{candidate.party}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 w-full md:w-64">
                                                    <div className="flex justify-between w-full text-sm mb-1">
                                                        <span className="text-gray-400 font-bold">{Number(candidate.voteCount)} Votes</span>
                                                        <span className="text-gray-500">
                                                            {postCandidates.reduce((sum, c) => sum + Number(c.voteCount), 0) > 0
                                                                ? ((Number(candidate.voteCount) / postCandidates.reduce((sum, c) => sum + Number(c.voteCount), 0)) * 100).toFixed(1)
                                                                : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-1000"
                                                            style={{
                                                                width: `${postCandidates.reduce((sum, c) => sum + Number(c.voteCount), 0) > 0
                                                                    ? (Number(candidate.voteCount) / postCandidates.reduce((sum, c) => sum + Number(c.voteCount), 0)) * 100
                                                                    : 0}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </section>
                        );
                    })}

                    {postList.length === 0 && (
                        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                            <p className="text-gray-500 text-xl">No election results available yet.</p>
                        </div>
                    )}
                </div>

                <footer className="mt-16 text-center border-t border-gray-800 pt-8">
                    <p className="text-gray-500 text-sm">Last updated: {currentTime.toLocaleTimeString()}</p>
                </footer>
            </div>
        </div>
    );
};

export default VoterResults;
