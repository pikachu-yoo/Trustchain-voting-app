import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../constants';

const AddCandidate = ({ account }) => {
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [candidateName, setCandidateName] = useState('');
    const [candidateParty, setCandidateParty] = useState('');
    const [candidateImage, setCandidateImage] = useState('');
    const [targetPost, setTargetPost] = useState('');
    const [postList, setPostList] = useState([]);
    const [candidateImageFile, setCandidateImageFile] = useState(null);
    const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'file'

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
            const candidatesData = await votingContract.getCandidates();
            setCandidates(candidatesData);
            const list = await votingContract.getPostList();
            setPostList(list);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const convertFileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const img = new Image();

            reader.onload = (e) => {
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 400;
                    const maxHeight = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedDataUrl);
                };
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            setCandidateImageFile(file);
        }
    };

    const addCandidate = async (e) => {
        e.preventDefault();
        if (!contract) return;
        if (!targetPost) {
            alert("Please enter a post name first");
            return;
        }

        setLoading(true);
        try {
            let imageUrl = candidateImage;
            if (imageInputType === 'file' && candidateImageFile) {
                imageUrl = await convertFileToDataURL(candidateImageFile);
            }

            const tx = await contract.addCandidate(candidateName, candidateParty, imageUrl, targetPost);
            await tx.wait();

            alert(`Candidate added successfully to ${targetPost}!`);
            setCandidateName('');
            setCandidateParty('');
            setCandidateImage('');
            setCandidateImageFile(null);
            fetchData(contract);
        } catch (error) {
            console.error("Error adding candidate:", error);
            alert("Failed to add candidate: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    const deleteCandidate = async (id, name) => {
        if (!contract) return;
        if (!window.confirm(`Are you sure you want to delete candidate "${name}"?`)) return;

        setLoading(true);
        try {
            const tx = await contract.deleteCandidate(id);
            await tx.wait();
            alert("Candidate deleted successfully!");
            fetchData(contract);
        } catch (error) {
            console.error("Error deleting candidate:", error);
            alert("Failed to delete candidate: " + (error.reason || error.message));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500">Candidate Management</h1>
                    <p className="text-gray-400 mt-2">Add or remove candidates for different posts</p>
                </header>

                {/* Post Entry */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg mb-8">
                    <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Target Post</label>
                    <input
                        type="text"
                        value={targetPost}
                        onChange={(e) => setTargetPost(e.target.value)}
                        placeholder="Enter post name (e.g. President)"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors text-lg font-bold"
                    />
                    <p className="text-gray-500 text-[10px] mt-2">All candidates added below will be assigned to this post.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Candidate Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg sticky top-24">
                            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                                <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-sm">➕</span> Add to {targetPost || '...'}
                            </h2>
                            <form onSubmit={addCandidate} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white transition-colors text-sm"
                                        value={candidateName}
                                        onChange={(e) => setCandidateName(e.target.value)}
                                        placeholder="Candidate Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Party</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white transition-colors text-sm"
                                        value={candidateParty}
                                        onChange={(e) => setCandidateParty(e.target.value)}
                                        placeholder="Party Name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Image</label>
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setImageInputType('url')}
                                            className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${imageInputType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageInputType('file')}
                                            className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${imageInputType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            File
                                        </button>
                                    </div>

                                    {imageInputType === 'url' ? (
                                        <input
                                            type="text"
                                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white transition-colors text-sm"
                                            value={candidateImage}
                                            onChange={(e) => setCandidateImage(e.target.value)}
                                            placeholder="https://..."
                                            required={imageInputType === 'url'}
                                        />
                                    ) : (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 text-white transition-colors text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                            required={imageInputType === 'file'}
                                        />
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !targetPost}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg mt-2 text-sm"
                                >
                                    {loading ? 'Processing...' : 'Add Candidate'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Candidate List */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span className="bg-green-500/20 text-green-400 p-2 rounded-lg text-sm">📋</span> Registered Candidates
                                </h2>
                                <div className="text-xs text-gray-500">Filtered by: <span className="text-blue-400 font-bold">{targetPost || 'All'}</span></div>
                            </div>

                            {candidates.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                                    <p className="text-gray-500">No candidates added yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {candidates
                                        .filter(c => !targetPost || c.post.toLowerCase().includes(targetPost.toLowerCase()))
                                        .map((candidate) => (
                                            <div key={candidate.id} className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700 flex flex-col">
                                                <div className="h-32 relative">
                                                    <img
                                                        src={candidate.imageUrl || "https://via.placeholder.com/400x200"}
                                                        alt={candidate.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2">
                                                        <button
                                                            onClick={() => deleteCandidate(candidate.id, candidate.name)}
                                                            disabled={loading}
                                                            className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-lg transition-all disabled:opacity-50"
                                                            title="Delete Candidate"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-2 left-2 bg-blue-600/80 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                        {candidate.post}
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-white truncate">{candidate.name}</h3>
                                                    <p className="text-xs text-gray-400 font-medium">{candidate.party}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCandidate;
