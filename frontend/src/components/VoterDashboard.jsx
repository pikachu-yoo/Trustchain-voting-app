import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const VoterDashboard = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [postList, setPostList] = useState([]);
    const [electionsInfo, setElectionsInfo] = useState({});
    const [voterStatsByPost, setVoterStatsByPost] = useState({});
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [adminPhone, setAdminPhone] = useState('');

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
            const statsMap = {};

            if (account) {
                const userGeneral = await votingContract.getUserInfo(account);
                setIsAuthorized(userGeneral.isAuthorized);
            }

            for (const post of posts) {
                const info = await votingContract.getElectionInfo(post);
                infoMap[post] = {
                    state: Number(info[0]),
                    startTime: Number(info[1]),
                    endTime: Number(info[2])
                };

                if (account) {
                    const status = await votingContract.getVoterStatus(account, post);
                    statsMap[post] = { hasVoted: status[1] };
                }
            }

            setElectionsInfo(infoMap);
            setVoterStatsByPost(statsMap);

            const phone = await votingContract.adminPhone();
            setAdminPhone(phone);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const castVote = async (candidateId, post) => {
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.vote(candidateId);
            await tx.wait();
            alert(`Vote cast successfully for ${post}!`);
            fetchData(contract);
        } catch (error) {
            console.error("Error casting vote:", error);
            alert("Failed to cast vote. Ensure you are authorized and haven't voted for this post yet.");
        }
        setLoading(false);
    };

    const getStatusText = (state) => {
        if (state === 0) return "Not Scheduled";
        if (state === 1) return "Voting Open";
        if (state === 2) return "Voting Closed";
        return "Unknown";
    };

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return "Not set";
        return new Date(timestamp * 1000).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Voter Dashboard</h1>
                        <p className="text-gray-400 mt-2">Cast your vote securely for each post</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 mb-2 inline-block">
                            <span className="text-sm text-gray-400">Wallet: </span>
                            <span className="text-sm font-mono text-purple-400">{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}</span>
                        </div>
                        <div className={`text-sm font-bold uppercase tracking-wider ${isAuthorized ? 'text-green-400' : 'text-red-400'}`}>
                            {isAuthorized ? '✓ Authorized' : '✗ Not Authorized'}
                        </div>
                    </div>
                </header>

                {/* Support Info */}
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-400">
                        <span className="bg-purple-500/10 text-purple-400 p-2 rounded-lg text-xl">📞</span>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-bold">Need Help?</p>
                            <p className="text-white font-mono text-sm">Contact Admin: <span className="text-purple-400">{adminPhone || 'Loading...'}</span></p>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 font-mono">
                        {currentTime.toLocaleTimeString()}
                    </div>
                </div>

                {postList.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                        <p className="text-gray-500 text-xl">No elections available at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {postList.map(post => {
                            const info = electionsInfo[post] || { state: 0, startTime: 0, endTime: 0 };
                            const stats = voterStatsByPost[post] || { hasVoted: false };
                            const postCandidates = candidates.filter(c => c.post === post);

                            return (
                                <section key={post} className="relative">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                                        <div>
                                            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                                <span className="bg-purple-600 w-2 h-8 rounded-full"></span>
                                                Election for: {post}
                                            </h2>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                                <span>Start: {formatDate(info.startTime)}</span>
                                                <span>End: {formatDate(info.endTime)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${info.state === 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {getStatusText(info.state)}
                                            </span>
                                            {stats.hasVoted && (
                                                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                                    ✓ Voted
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {postCandidates.map((candidate) => (
                                            <div key={candidate.id} className="group bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={candidate.imageUrl || "https://via.placeholder.com/400x300"}
                                                        alt={candidate.name}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                                                    <div className="absolute bottom-4 left-4">
                                                        <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                            {candidate.party}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-white mb-4">{candidate.name}</h3>
                                                    <button
                                                        onClick={() => castVote(candidate.id, post)}
                                                        disabled={!isAuthorized || stats.hasVoted || info.state !== 1 || loading}
                                                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
                                                            ${!isAuthorized || stats.hasVoted || info.state !== 1
                                                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                                            }`}
                                                    >
                                                        {stats.hasVoted ? 'Already Voted' : 'Vote Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {postCandidates.length === 0 && (
                                        <div className="text-center py-10 bg-gray-800/20 rounded-xl border border-gray-700 border-dashed">
                                            <p className="text-gray-500">No candidates registered for this post.</p>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoterDashboard;
