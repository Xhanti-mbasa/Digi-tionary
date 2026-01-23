import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ userAddress, onProfileUpdate }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [stats, setStats] = useState({ balance: 0, words: 0, dictionaries: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [userAddress]);

    const fetchProfile = async () => {
        try {
            // Get Account details
            const res = await fetch(`/api/chain/account/${userAddress}`);
            const data = await res.json();
            if (data.username) setUsername(data.username);

            setStats(prev => ({ ...prev, balance: data.balance }));

            // Get other stats (mocked logic or derived from full lists)
            // Real app would have specific count endpoints or we filter client side
            const wordsRes = await fetch('/api/chain/words');
            const words = await wordsRes.json();
            const userWords = words.filter(w => w.owner === userAddress);

            const libRes = await fetch('/api/chain/library');
            const libs = await libRes.json();
            const userLibs = libs.filter(l => l.author === userAddress);

            setStats({
                balance: data.balance,
                words: userWords.length,
                dictionaries: userLibs.length
            });

        } catch (e) {
            console.error("Failed to fetch profile", e);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/chain/transaction?address=${userAddress}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "updateProfile",
                    username: username
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            alert("Profile Updated!");
            if (onProfileUpdate) await onProfileUpdate();
            // navigate('/create'); // Stay on page
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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

                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
                        {(username || userAddress || "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{username || "Anonymous User"}</h1>
                        <p className="font-mono text-gray-500 text-sm">{userAddress}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                        <div className="text-2xl font-bold text-gray-900">{stats.words}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Words</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                        <div className="text-2xl font-bold text-gray-900">{stats.dictionaries}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Dictionaries</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                        <div className="text-2xl font-bold text-gray-900">{stats.balance}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Credits</div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Set a username"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500">This name will appear on your dictionaries and words.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
