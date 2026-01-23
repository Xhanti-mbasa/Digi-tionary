import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MerkleGraph from '../components/MerkleGraph';

export default function GraphPage({ userAddress }) {
    const navigate = useNavigate();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGraphData();
    }, []);

    const fetchGraphData = async () => {
        try {
            const res = await fetch('/api/chain/graph');
            const data = await res.json();
            setGraphData(data);
        } catch (e) {
            console.error("Failed to fetch graph data", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Network State Graph
                </h1>
                <div className="w-32"></div> {/* Spacer for center alignment */}
            </div>

            <div className="flex-grow bg-black rounded-xl border border-gray-800 shadow-2xl overflow-hidden relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <MerkleGraph data={graphData} />
                )}

                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur p-4 rounded-lg border border-gray-800 text-xs text-gray-400">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> Users
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-indigo-600"></span> Dictionaries
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Words
                    </div>
                </div>
            </div>
        </div>
    );
}
