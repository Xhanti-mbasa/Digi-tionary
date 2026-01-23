import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePage({ userAddress }) {
    const navigate = useNavigate();
    const [words, setWords] = useState([]);
    const [selectedWord, setSelectedWord] = useState(null);

    // Form State
    const [term, setTerm] = useState('');
    const [content, setContent] = useState('');
    const [commitMsg, setCommitMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWords();
    }, []);

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

    const handleSubmit = async (e) => {
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
            const res = await fetch(`/api/chain/transaction?address=${userAddress}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.detail);

            alert(isUpdate ? "Version committed!" : "Word created!");
            setTerm('');
            setContent('');
            setCommitMsg('');
            setSelectedWord(null);
            fetchWords();
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
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

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing Transaction...' : (selectedWord ? 'Commit Changes' : 'Mint Word')}
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
                                <p className="text-gray-400 text-sm text-center py-4">No words minted yet.</p>
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
        </div>
    );
}
