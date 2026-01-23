import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePage({ userAddress }) {
    const navigate = useNavigate();
    const [words, setWords] = useState([]);
    const [selectedWord, setSelectedWord] = useState(null);
    const [blockchainStatus, setBlockchainStatus] = useState(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishResult, setPublishResult] = useState(null);

    // Form State
    const [term, setTerm] = useState('');
    const [content, setContent] = useState('');
    const [commitMsg, setCommitMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWords();
        fetchBlockchainStatus();
    }, []);

    const fetchBlockchainStatus = async () => {
        try {
            const res = await fetch('/api/chain/status');
            const data = await res.json();
            setBlockchainStatus(data);
        } catch (e) {
            console.error("Failed to fetch blockchain status", e);
        }
    };

    const fetchWords = async () => {
        try {
            const res = await fetch('/api/chain/words');
            const data = await res.json();
            // Filter words owned by current user for editing, but could show all
            setWords(data.filter(w => w.owner === userAddress));
        } catch (e) {
            console.error("Failed to fetch words", e);
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isUpdate = !!selectedWord;
        const payload = {
            action: isUpdate ? "updateWord" : "addWord",
            term: isUpdate ? selectedWord.term : term,
            content,
            commitMsg,
            wordId: isUpdate ? selectedWord.id : undefined
        };

        try {
            const res = await fetch(`/api/chain/publish?address=${userAddress}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.detail);

            setPublishResult(result);
            setShowPublishModal(true);

            setTerm('');
            setContent('');
            setCommitMsg('');
            setSelectedWord(null);

            // Refresh data
            fetchWords();
            fetchBlockchainStatus();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Blockchain Status Banner */}
            {blockchainStatus && (
                <div className="max-w-6xl mx-auto mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-green-900">Blockchain Connected</span>
                    </div>
                    <div className="flex gap-6 text-sm text-green-700">
                        <span className="font-mono">{blockchainStatus.stats.total_words} words</span>
                        <span className="font-mono">{blockchainStatus.stats.total_dictionaries} dictionaries</span>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left: Editor */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {selectedWord ? `Editing: ${selectedWord.term}` : 'Create New Word'}
                        </h2>
                        {selectedWord && (
                            <button onClick={() => setSelectedWord(null)} className="text-sm text-gray-500 hover:text-gray-900">
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handlePublish} className="space-y-6">
                        {!selectedWord && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Word / Term</label>
                                <input
                                    type="text"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="e.g. Blockchain"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Definition & Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
                                placeholder="Write the definition and usage..."
                                required
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    Commit Message
                                </span>
                            </label>
                            <input
                                type="text"
                                value={commitMsg}
                                onChange={(e) => setCommitMsg(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                placeholder="e.g. Added historical context"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Publishing to Blockchain...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                    {selectedWord ? 'Publish Update' : 'Publish to Blockchain'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right: Your Words (Git History) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Repository</h3>
                        <div className="space-y-3">
                            {words.map(word => (
                                <div
                                    key={word.id}
                                    onClick={() => {
                                        setSelectedWord(word);
                                        setContent(word.history[word.history.length - 1].content);
                                    }}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedWord?.id === word.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-900">{word.term}</span>
                                        <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-600">v{word.history.length}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        Last commit: {word.history[word.history.length - 1].commitMsg}
                                    </div>
                                </div>
                            ))}
                            {words.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">No words published yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-900 rounded-2xl shadow-sm p-6 text-white">
                        <h3 className="text-lg font-bold mb-2">Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-indigo-300 text-sm">Total Words</p>
                                <p className="text-2xl font-mono">{words.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Publish Confirmation Modal */}
            {showPublishModal && publishResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowPublishModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Published to Blockchain!</h3>
                            <p className="text-gray-600 mb-6">Your work has been permanently recorded</p>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Transaction ID:</span>
                                    <span className="font-mono text-gray-900">#{publishResult.wordId || publishResult.dictionaryId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Published by:</span>
                                    <span className="font-mono text-gray-900">{publishResult.published_by?.slice(0, 10)}...</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Status:</span>
                                    <span className="text-green-600 font-semibold">✓ Confirmed</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
