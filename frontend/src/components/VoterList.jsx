import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const VoterList = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(votingContract);
                fetchRegisteredUsers(votingContract);
            }
        };
        init();
    }, []);

    const fetchRegisteredUsers = async (votingContract) => {
        try {
            const users = await votingContract.getRegisteredUsers();

            // Fetch authorization status for each user
            const usersWithStatus = await Promise.all(
                users.map(async (user) => {
                    try {
                        const userInfo = await votingContract.getUserInfo(user.userAddress);
                        return {
                            address: user.userAddress,
                            username: userInfo[0], // username
                            isRegistered: userInfo[1], // isRegistered
                            isAuthorized: userInfo[2] // isAuthorized
                        };
                    } catch (err) {
                        console.error(`Error fetching info for ${user.userAddress}:`, err);
                        return {
                            address: user.userAddress,
                            username: user.username,
                            isRegistered: true,
                            isAuthorized: false
                        };
                    }
                })
            );

            setRegisteredUsers(usersWithStatus);
        } catch (error) {
            console.error("Error fetching registered users:", error);
        }
    };

    const authorizeVoter = async (voterAddress) => {
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.authorizeVoter(voterAddress);
            await tx.wait();
            alert("Voter authorized successfully!");
            fetchRegisteredUsers(contract);
        } catch (error) {
            console.error("Error authorizing voter:", error);
            alert("Failed to authorize voter: " + (error.reason || error.message));
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
            const tx = await contract.deleteUser(userAddress);
            await tx.wait();
            alert(`User "${username}" deleted successfully!`);
            fetchRegisteredUsers(contract);
        } catch (error) {
            console.error("Error deleting user:", error);
            let errorMsg = "Failed to delete user";
            if (error.message?.includes("User not registered")) {
                errorMsg = "User is not registered";
            }
            alert(errorMsg);
        }
        setLoading(false);
    };

    const filteredUsers = registeredUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Voter List</h1>
                        <p className="text-gray-400 mt-2">View and manage registered users</p>
                    </div>
                    <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                        <span className="text-sm text-gray-400">Connected: </span>
                        <span className="text-sm font-mono text-blue-400">{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not Connected'}</span>
                    </div>
                </header>

                {/* Stats Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg mb-8">
                    <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Registered Users</h3>
                    <p className="text-4xl font-bold text-white">{registeredUsers.length}</p>
                    <div className="mt-4 flex gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Authorized: </span>
                            <span className="text-green-400 font-bold">{registeredUsers.filter(u => u.isAuthorized).length}</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by username or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                    />
                </div>

                {/* Users Table */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-900/50 border-b border-gray-700">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Ethereum Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Voted</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            {searchTerm ? 'No users found matching your search' : 'No registered users yet'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr key={index} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    <span className="font-medium text-white">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm text-gray-300">{user.address}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isAuthorized ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">
                                                        ✓ Authorized
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                                                        ⚠ Not Authorized
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500">N/A</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {!user.isAuthorized && (
                                                        <button
                                                            onClick={() => authorizeVoter(user.address)}
                                                            disabled={loading}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/20"
                                                        >
                                                            ✓ Authorize
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteUser(user.address, user.username)}
                                                        disabled={loading}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/20"
                                                        title="Delete user"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoterList;
