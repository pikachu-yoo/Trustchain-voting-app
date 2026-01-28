import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const Profile = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [username, setUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(votingContract);
                const currentUsername = await votingContract.adminUsername();
                setUsername(currentUsername);
                setNewUsername(currentUsername);
            }
        };
        init();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!contract) return;
        if (!newUsername || !newPassword) {
            alert("Please provide both new username and password");
            return;
        }

        setLoading(true);
        try {
            const tx = await contract.updateAdminCredentials(newUsername, newPassword);
            await tx.wait();
            alert("Admin credentials updated successfully!");
            setUsername(newUsername);
            setNewPassword('');
        } catch (error) {
            console.error("Error updating credentials:", error);
            alert("Failed to update credentials: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Admin Profile</h1>
                    <p className="text-gray-400 mt-2">Manage your administrative credentials</p>
                </header>

                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg">
                    <div className="mb-8 pb-8 border-b border-gray-700">
                        <h2 className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">Current Username</h2>
                        <p className="text-2xl font-mono text-blue-400">{username}</p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">New Username</label>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                                placeholder="Enter new username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
                        >
                            {loading ? 'Updating...' : 'Update Credentials'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-xs leading-relaxed">
                        <span className="font-bold">Note:</span> Updating your credentials will change the username and password required for admin login. Please ensure you remember your new credentials.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
