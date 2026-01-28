import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const Login = ({ setAccount, setIsAdmin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const navigate = useNavigate();

    const connectWallet = async () => {
        if (window.ethereum) {
            setIsConnecting(true);
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                setAccount(accounts[0]);
                return accounts[0];
            } catch (error) {
                console.error("Error connecting wallet:", error);
                alert("Failed to connect wallet");
                return null;
            } finally {
                setIsConnecting(false);
            }
        } else {
            alert("Please install Metamask!");
            return null;
        }
    };

    const registerUserOnBlockchain = async (username, address) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Check if user is already registered
            const userInfo = await contract.getUserInfo(address);
            const isAlreadyRegistered = userInfo[1]; // isRegistered field

            if (!isAlreadyRegistered) {
                console.log("Registering user on blockchain...");
                const tx = await contract.registerUser(username);
                await tx.wait();
                console.log("User registered successfully on blockchain!");
                return true;
            } else {
                console.log("User already registered on blockchain");
                return true;
            }
        } catch (error) {
            console.error("Error registering user on blockchain:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                reason: error.reason,
                data: error.data
            });

            // Don't block login if registration fails
            if (error.message && error.message.includes("User already registered")) {
                return true; // Already registered is fine
            }

            // Show more specific error message
            let errorMsg = "Warning: Could not register username on blockchain. You can still vote if authorized.";
            if (error.reason) {
                errorMsg += `\n\nReason: ${error.reason}`;
            } else if (error.message) {
                errorMsg += `\n\nError: ${error.message}`;
            }

            alert(errorMsg);
            return false;
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // 1. Ensure Wallet is Connected
        let currentAddress = walletAddress;
        if (!currentAddress) {
            currentAddress = await connectWallet();
            if (!currentAddress) return; // Failed to connect
        }

        // 2. Analyze Credentials
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);

            const isAdminValid = await contract.verifyAdmin(username, password);

            if (isAdminValid) {
                setIsAdmin(true);
                navigate('/admin');
            } else {
                // For voters, we accept any other credentials
                if (username && password) {
                    setIsRegistering(true);
                    // Register user on blockchain
                    await registerUserOnBlockchain(username, currentAddress);
                    setIsRegistering(false);
                    setIsAdmin(false);
                    navigate('/voter');
                } else {
                    alert("Invalid credentials or missing username/password.");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        TrustChain
                    </h2>
                    <p className="text-gray-300 text-sm">Secure Decentralized Voting</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Wallet Connection Status/Button */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 text-center">
                        {walletAddress ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-green-400 text-sm font-mono">
                                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                                </span>
                                <span className="text-xs text-gray-400">Wallet Connected</span>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={connectWallet}
                                disabled={isConnecting}
                                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                            >
                                {isConnecting ? 'Connecting...' : '🔌 Connect Metamask Wallet'}
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-xs font-bold mb-2 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>{isRegistering ? 'Creating Account...' : 'Login / Create Account'}</span>
                        {!isRegistering && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
