import { Link } from 'react-router-dom';

export default function Dashboard({ userAddress }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, Auditor</h1>
                    <p className="font-mono text-gray-500 bg-white inline-block px-4 py-2 rounded-full border border-gray-200 shadow-sm text-sm">
                        {userAddress}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/create" className="group">
                        <div className="bg-white hover:bg-indigo-50 transition-all p-8 rounded-2xl border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md h-full flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create & Manage Words</h2>
                            <p className="text-gray-500">Mint new words to the blockchain or update existing ones with git-like version control.</p>
                        </div>
                    </Link>

                    <Link to="/library" className="group">
                        <div className="bg-white hover:bg-purple-50 transition-all p-8 rounded-2xl border border-gray-200 hover:border-purple-200 shadow-sm hover:shadow-md h-full flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">The Library</h2>
                            <p className="text-gray-500">Explore community dictionaries and immutable collections stored on-chain.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
