import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const VoterProfile = ({ account }) => {
    const [userInfo, setUserInfo] = useState({ username: '', isRegistered: false, isAuthorized: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (window.ethereum && account) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const contract = new ethers.Contract(contractAddress, contractABI, provider);
                    const info = await contract.getUserInfo(account);
                    setUserInfo({
                        username: info[0],
                        isRegistered: info[1],
                        isAuthorized: info[2]
                    });
                } catch (error) {
                    console.error("Error fetching user info:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserInfo();
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
            <div className="max-w-2xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Voter Profile</h1>
                    <p className="text-gray-400 mt-2">Your decentralized identity on TrustChain</p>
                </header>

                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl space-y-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg">
                            {userInfo.username ? userInfo.username[0].toUpperCase() : '?'}
                        </div>
                        <h2 className="text-2xl font-bold">{userInfo.username || 'Anonymous Voter'}</h2>
                        <p className="text-gray-500 font-mono text-sm mt-1">{account}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Registration Status</p>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${userInfo.isRegistered ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                                <span className="font-medium">{userInfo.isRegistered ? 'Registered' : 'Not Registered'}</span>
                            </div>
                        </div>
                        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Authorization Status</p>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${userInfo.isAuthorized ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                                <span className="font-medium">{userInfo.isAuthorized ? 'Authorized to Vote' : 'Pending Authorization'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                            <span>ℹ️</span> Security Tip
                        </h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Your profile is linked to your Ethereum wallet address. Ensure you keep your private keys safe and never share them with anyone. TrustChain will never ask for your seed phrase.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoterProfile;
