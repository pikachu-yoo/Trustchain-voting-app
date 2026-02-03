import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminPanel = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [postList, setPostList] = useState([]);
    const [electionsInfo, setElectionsInfo] = useState({});

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

            const votersData = await votingContract.getAllVoters();
            setVoters(votersData);

            const registeredUsersData = await votingContract.getRegisteredUsers();
            setRegisteredUsers(registeredUsersData);

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
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-2">Comprehensive overview of all active elections</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                            <span className="text-sm text-gray-400">Connected: </span>
                            <span className="text-sm font-mono text-blue-400">{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}</span>
                        </div>
                        <div className="text-xs text-gray-500">{currentTime.toLocaleString()}</div>
                    </div>
                </header>

                {/* Global Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg hover:border-green-500/50 transition-all text-center">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Authorized Voters</h3>
                        <p className="text-5xl font-bold text-white">{voters.length}</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg hover:border-orange-500/50 transition-all text-center">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Registered Users</h3>
                        <p className="text-5xl font-bold text-white">{registeredUsers.length}</p>
                    </div>
                </div>

                <div className="space-y-24">
                    {postList.map(post => {
                        const postCandidates = candidates.filter(c => c.post === post);
                        const info = electionsInfo[post] || { state: 0 };

                        return (
                            <section key={post} className="border-t border-gray-800 pt-12">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                            <span className="bg-blue-600 w-2 h-8 rounded-full"></span>
                                            Results for: {post}
                                        </h2>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Status: <span className={`font-bold ${info.state === 1 ? 'text-green-400' : info.state === 2 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {getStatusText(info.state)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 text-sm">
                                        <span className="text-gray-400">Candidates: </span>
                                        <span className="text-white font-bold">{postCandidates.length}</span>
                                    </div>
                                </div>

                                {/* Leaderboard */}
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden mb-12">
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
                                                {[...postCandidates]
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
                                                                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                                                    />
                                                                    <span className="font-medium text-white">{candidate.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-gray-400">{candidate.party}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <div className="text-2xl font-bold text-blue-400">{Number(candidate.voteCount)}</div>
                                                                    <div className="w-24 bg-gray-700 rounded-full h-2">
                                                                        <div
                                                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                                            style={{
                                                                                width: `${postCandidates.length > 0 ? (Number(candidate.voteCount) / Math.max(...postCandidates.map(c => Number(c.voteCount)), 1)) * 100 : 0}%`
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

                                {/* Visualizations */}
                                {postCandidates.length > 0 && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                                <span className="text-2xl">📊</span> Vote Distribution
                                            </h2>
                                            <div className="h-[300px] flex items-center justify-center">
                                                <Bar
                                                    data={{
                                                        labels: postCandidates.map(c => c.name),
                                                        datasets: [
                                                            {
                                                                label: 'Votes',
                                                                data: postCandidates.map(c => Number(c.voteCount)),
                                                                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                                                borderColor: 'rgba(59, 130, 246, 1)',
                                                                borderWidth: 1,
                                                            },
                                                        ],
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: { legend: { display: false } },
                                                        scales: {
                                                            y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(75, 85, 99, 0.2)' } },
                                                            x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                                <span className="text-2xl">🥧</span> Vote Share
                                            </h2>
                                            <div className="h-[300px] flex items-center justify-center">
                                                <Pie
                                                    data={{
                                                        labels: postCandidates.map(c => c.name),
                                                        datasets: [
                                                            {
                                                                data: postCandidates.map(c => Number(c.voteCount)),
                                                                backgroundColor: [
                                                                    'rgba(59, 130, 246, 0.6)',
                                                                    'rgba(16, 185, 129, 0.6)',
                                                                    'rgba(245, 158, 11, 0.6)',
                                                                    'rgba(239, 68, 68, 0.6)',
                                                                    'rgba(139, 92, 246, 0.6)',
                                                                    'rgba(236, 72, 153, 0.6)',
                                                                ],
                                                                borderWidth: 1,
                                                            },
                                                        ],
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: { position: 'right', labels: { color: '#9ca3af', font: { size: 12 } } },
                                                        },
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        );
                    })}

                    {postList.length === 0 && (
                        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                            <p className="text-gray-500 text-xl">No elections or candidates found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
