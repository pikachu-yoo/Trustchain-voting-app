import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Hero Section */}
            <header className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
                <div className="animate-fade-in-up">
                    <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-blue-400 tracking-wider uppercase">
                        Next Generation Voting
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                            TRUST CHAIN
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Empowering democracy through <span className="text-white font-medium">immutable blockchain technology</span>. Secure, transparent, and verifiable.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative px-10 py-5 bg-blue-600 rounded-2xl font-bold text-lg transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] overflow-hidden"
                        >
                            <span className="relative z-10">Start Voting Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                        <button
                            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl font-bold text-lg transition-all hover:bg-white/10"
                        >
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
                    </svg>
                </div>
            </header>

            {/* Block Chain Section */}
            <section className="relative z-10 py-32 bg-gradient-to-b from-transparent to-black/40">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <img
                                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                                alt="Blockchain Technology"
                                className="relative rounded-2xl shadow-2xl border border-white/10 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">
                                The Power of <span className="text-blue-400">Blockchain</span>
                            </h2>
                            <div className="space-y-6 text-lg text-gray-400 leading-relaxed font-light">
                                <p>
                                    Blockchain is not just for finance. It's a <span className="text-white font-medium">revolutionary trust machine</span>. By distributing data across a network of computers, it creates a record that is impossible to hack, alter, or ignore.
                                </p>
                                <p>
                                    In TrustChain, every vote is a cryptographic transaction. Once confirmed, it's etched into the digital stone of the blockchain, visible to all but owned by none. This is the ultimate defense against election manipulation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="how-it-works" className="relative z-10 py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Engineered for Integrity</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Our system leverages three core pillars of modern cryptography to ensure your voice is heard.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '🔒', title: 'Identity Protection', desc: 'Secure authentication via Metamask ensures one-person-one-vote without compromising your private data.', color: 'blue' },
                            { icon: '🗳️', title: 'Immutable Ledger', desc: 'Votes are stored on the Ethereum blockchain, creating a permanent, tamper-proof record of the election.', color: 'purple' },
                            { icon: '📊', title: 'Real-time Auditing', desc: 'Live results are publicly verifiable. Anyone can verify the math without needing to trust a central authority.', color: 'indigo' }
                        ].map((feature, i) => (
                            <div key={i} className="group p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                                <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="relative z-10 py-32 bg-white/5">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center text-white">The Voting Journey</h2>
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Connection Line */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 -translate-y-1/2"></div>

                            {[
                                { step: '01', title: 'Connect', desc: 'Link your digital wallet to establish your secure connection.' },
                                { step: '02', title: 'Authorize', desc: 'Admin verifies your eligibility to participate in the election.' },
                                { step: '03', title: 'Cast', desc: 'Select your candidate and sign the transaction to vote.' }
                            ].map((item, i) => (
                                <div key={i} className="relative z-10 text-center">
                                    <div className="w-20 h-20 bg-gray-900 border-4 border-blue-600/30 rounded-full flex items-center justify-center text-2xl font-black text-blue-400 mx-auto mb-8 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                                    <p className="text-gray-400 font-light">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-32">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto p-16 rounded-[40px] bg-gradient-to-br from-blue-600 to-purple-700 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to make history?</h2>
                            <p className="text-xl text-white/80 mb-12 max-w-xl mx-auto font-light">Join thousands of voters who trust blockchain for their democratic expression.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-12 py-6 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                            >
                                Enter the Voting Booth
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-white/5 bg-black/20 backdrop-blur-md">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-2xl font-black tracking-tighter text-blue-400">TRUST CHAIN</div>
                    <div className="text-gray-500 text-sm font-light">
                        &copy; 2025 TrustChain. Built with integrity on Ethereum.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default LandingPage;
