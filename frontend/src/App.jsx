import { useState } from 'react';
// import { BrowserProvider } from 'ethers';
// import { SiweMessage } from 'siwe';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import CreatePage from './pages/CreatePage';
import Library from './pages/Library';
import ProfilePage from './pages/ProfilePage';
import GraphPage from './pages/GraphPage';

// Components
import WalletConnect from './components/WalletConnect';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsername = async (address) => {
    try {
      const res = await fetch(`/api/chain/account/${address}`);
      const data = await res.json();
      if (data.username) setUsername(data.username);
    } catch (e) { console.error("Failed to fetch username", e); }
  };

  const handleLoginSuccess = (address) => {
    setUserAddress(address);
    setIsAuthenticated(true);
    fetchUsername(address);
  };

  const handleSSOLogin = async () => {
    setLoading(true);
    try {
      window.location.href = '/api/auth/sso';
    } catch (error) {
      console.error('SSO error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUserAddress('');
    setUsername('');
  };

  if (isAuthenticated) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          {/* Simple Navbar for Navigation testing */}
          <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="font-bold text-xl tracking-tight hover:text-indigo-600 transition-colors">Digi-tionary</Link>
            <div className="flex items-center gap-4">
              <Link to="/graph" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Graph View</Link>
              <Link to="/profile" className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                {username ? username : (userAddress.slice(0, 6) + '...' + userAddress.slice(-4))}
              </Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Dashboard userAddress={userAddress} username={username} />} />
            <Route path="/create" element={<CreatePage userAddress={userAddress} />} />
            <Route path="/library" element={<Library userAddress={userAddress} />} />
            <Route path="/graph" element={<GraphPage userAddress={userAddress} />} />
            <Route path="/profile" element={<ProfilePage userAddress={userAddress} onProfileUpdate={() => fetchUsername(userAddress)} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-900/20 blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3 tracking-tight">
            Digi-tionary
          </h1>
          <p className="text-gray-400 text-lg font-light">
            Secure entry gateway
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
          <WalletConnect onConnect={handleLoginSuccess} />

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-500">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleSSOLogin}
            disabled={loading}
            className="w-full bg-gray-800/80 backdrop-blur text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-white/10"
          >
            {loading ? 'Processing...' : 'SSO Login'}
          </button>

          <button
            onClick={async () => {
              let address = '0xDevUser';
              if (window.ethereum) {
                try {
                  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                  if (accounts.length > 0) {
                    address = accounts[0];
                  }
                } catch (e) {
                  console.warn("Could not get metamask account for dev mode", e);
                }
              }
              setIsAuthenticated(true);
              setUserAddress(address);
              fetchUsername(address);
            }}
            className="w-full mt-4 bg-transparent border border-dashed border-gray-600 text-gray-500 py-2 px-4 rounded-xl hover:text-white hover:border-gray-400 transition"
          >
            [Dev Mode] Bypass Auth (Use Wallet Address)
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center mt-8 font-medium">
          By connecting, you agree to our <a href="#" className="text-gray-400 hover:text-white transition-colors underline decoration-dotted">Terms of Service</a> & <a href="#" className="text-gray-400 hover:text-white transition-colors underline decoration-dotted">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
