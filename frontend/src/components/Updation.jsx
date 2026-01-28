import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const Updation = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [electionState, setElectionState] = useState(0);
    const [loading, setLoading] = useState(false);
    const [maxCandidates, setMaxCandidates] = useState(10);
    const [maxVoters, setMaxVoters] = useState(100);
    const [maxRegisteredUsers, setMaxRegisteredUsers] = useState(200);
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

    const fetchData = async (votingContract) => {
        try {
            const state = await votingContract.electionState();
            setElectionState(Number(state));

            const maxC = await votingContract.maxCandidates();
            const maxV = await votingContract.maxVoters();
            const maxRU = await votingContract.maxRegisteredUsers();
            setMaxCandidates(Number(maxC));
            setMaxVoters(Number(maxV));
            setMaxRegisteredUsers(Number(maxRU));

            const email = await votingContract.adminEmail();
            const phone = await votingContract.adminPhone();
            setAdminEmail(email);
            setAdminPhone(phone);
            setNewEmail(email);
            setNewPhone(phone);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleSetLimits = async (e) => {
        e.preventDefault();
        if (!contract) return;
        setLoading(true);
        try {
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

    const setAdminContact = async (e) => {
        e.preventDefault();
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.setAdminContact(newEmail, newPhone);
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

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-500">System Updation</h1>
                    <p className="text-gray-400 mt-2">Configure system limits and contact information</p>
                </header>

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
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Max Registered Users</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-white transition-colors"
                                    value={maxRegisteredUsers}
                                    onChange={(e) => setMaxRegisteredUsers(Number(e.target.value))}
                                    disabled={electionState !== 0}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={electionState !== 0 || loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/20"
                        >
                            {loading ? 'Updating...' : '💾 Update Limits'}
                        </button>
                        {electionState !== 0 && (
                            <p className="text-sm text-yellow-400 mt-3">
                                ⚠️ Limits can only be changed when election is not scheduled
                            </p>
                        )}
                    </form>
                </div>

                {/* Admin Contact Settings */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-lg">
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
                            {loading ? 'Updating...' : 'Update Contact Info'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Updation;
