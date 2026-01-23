import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider } from 'ethers';
import { sendZeroValueTransaction } from '../utils/transaction';

export default function Library({ userAddress }) {
    const [dictionaries, setDictionaries] = useState([]);
    const [words, setWords] = useState([]);

    useEffect(() => {
        fetchLibrary();
        fetchWords();
    }, []);

    const fetchLibrary = async () => {
        try {
            const res = await fetch('/api/chain/library');
            const data = await res.json();
            setDictionaries(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchWords = async () => {
        try {
            const res = await fetch('/api/chain/words');
            const data = await res.json();
            setWords(data);
        } catch (e) { console.error(e); }
    }

    // New State for confirmation UI
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const handlePublishStart = () => {
        // Logic: Collect all user's words (Case Insensitive)
        const userWords = words.filter(w => w.owner.toLowerCase() === userAddress.toLowerCase());

        if (userWords.length === 0) {
            alert("You need to mint some words first!");
            navigate('/create');
            return;
        }
        setIsCreating(true);
    };

    const confirmPublish = async () => {
        if (!newTitle.trim()) return;

        const userWords = words.filter(w => w.owner.toLowerCase() === userAddress.toLowerCase());
        const wordIds = userWords.map(w => w.id);

        try {
            // 1. Trigger Zero Value Transaction
            if (window.ethereum) {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                await sendZeroValueTransaction(signer);
            } else {
                throw new Error("No crypto wallet found");
            }

            // 2. Call Backend API
            const res = await fetch(`/api/chain/transaction?address=${userAddress}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "createDictionary",
                    title: newTitle,
                    wordIds
                })
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.detail || result.error || "Unknown error");
            }

            if (result.success) {
                alert("Dictionary Published to Chain!");
                setNewTitle('');
                setIsCreating(false);
                fetchLibrary();
            } else {
                alert("Error: " + result.error);
            }
        } catch (e) {
            alert("Transaction failed: " + e.message);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">The Library</h1>
                        <p className="text-gray-500">Immutable collections on the Digi-tionary blockchain</p>
                    </div>
                    {isCreating ? (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-lg border border-gray-200 animate-fade-in">
                            <input
                                autoFocus
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Dictionary Title..."
                                className="px-3 py-1 border-none focus:ring-0 text-sm font-bold text-gray-900 w-48"
                                onKeyDown={e => e.key === 'Enter' && confirmPublish()}
                            />
                            <button onClick={confirmPublish} className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-800">
                                Confirm
                            </button>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 px-2">
                                ×
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handlePublishStart}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                        >
                            <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-xs">+</div>
                            Publish Dictionary
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dictionaries.map(dict => (
                        <div key={dict.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{dict.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">By {dict.author.slice(0, 6)}...{dict.author.slice(-4)}</p>

                            <div className="flex items-center gap-4 text-sm font-mono text-gray-600 border-t pt-4">
                                <span>{dict.wordIds.length} Words</span>
                                <span>•</span>
                                <span>Block #{dict.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {dictionaries.length === 0 && (
                        <div className="col-span-3 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-400">The library is empty. Be the first to publish a dictionary!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
