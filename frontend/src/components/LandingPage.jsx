import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white font-sans">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-16 text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    TRUST CHAIN
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto">
                    The Future of Secure, Transparent, and Decentralized Elections.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-lg"
                >
                    Vote Now
                </button>
            </header>

            {/* What is Blockchain */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-12 text-center text-blue-400">What is Blockchain?</h2>
                    <div className="flex flex-col md:flex-row items-center gap-12 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                                alt="Blockchain illustration"
                                className="rounded-lg shadow-2xl"
                            />
                        </div>
                        <div className="md:w-1/2 text-lg text-gray-300 leading-relaxed">
                            <p className="mb-6">
                                Blockchain is a shared, immutable ledger that facilitates the process of recording transactions and tracking assets in a business network. It's the technology that enables cryptocurrencies like Bitcoin and Ethereum.
                            </p>
                            <p>
                                In the context of voting, blockchain ensures that once a vote is cast, it cannot be altered or deleted. This provides an unprecedented level of security and transparency, eliminating the possibility of fraud and ensuring every vote counts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How the System Works */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-16 text-center text-purple-400">How TrustChain Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-xl hover:bg-white/10 transition duration-300 border border-white/10">
                            <div className="text-5xl mb-6">🔒</div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Secure Authentication</h3>
                            <p className="text-gray-400">
                                Voters authenticate using their unique Metamask digital wallets. This ensures that only authorized individuals can participate in the election.
                            </p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-xl shadow-xl hover:bg-gray-750 transition duration-300 border border-gray-700">
                            <div className="text-5xl mb-6">🗳️</div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Decentralized Voting</h3>
                            <p className="text-gray-400">
                                Votes are recorded directly onto the Ethereum blockchain. There is no central server that can be hacked or manipulated.
                            </p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-xl shadow-xl hover:bg-gray-750 transition duration-300 border border-gray-700">
                            <div className="text-5xl mb-6">📊</div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Transparent Results</h3>
                            <p className="text-gray-400">
                                The election results are publicly verifiable in real-time. Anyone can audit the blockchain to verify the integrity of the count.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Voting Process */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-12 text-center text-blue-400">How to Vote</h2>
                    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-10 border border-white/10">
                        <div className="relative border-l-4 border-blue-500 ml-6 space-y-12">
                            <div className="mb-8 ml-10 relative">
                                <span className="absolute -left-14 top-1 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white">1</span>
                                <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
                                <p className="text-gray-400">Click "Vote Now" and connect your Metamask wallet to the application.</p>
                            </div>
                            <div className="mb-8 ml-10 relative">
                                <span className="absolute -left-14 top-1 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white">2</span>
                                <h3 className="text-2xl font-bold text-white mb-2">Get Authorized</h3>
                                <p className="text-gray-400">Ensure your wallet address has been authorized by the election administrator.</p>
                            </div>
                            <div className="mb-8 ml-10 relative">
                                <span className="absolute -left-14 top-1 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white">3</span>
                                <h3 className="text-2xl font-bold text-white mb-2">Cast Your Vote</h3>
                                <p className="text-gray-400">Select your preferred candidate from the dashboard and confirm the transaction.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-10 border-t border-gray-800 text-center">
                <p className="text-gray-500">&copy; 2025 TrustChain. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
