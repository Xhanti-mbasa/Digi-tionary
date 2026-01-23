import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import CreatePage from './pages/CreatePage';
import Library from './pages/Library';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const network = await provider.getNetwork();
        const message = new SiweMessage({
          domain: window.location.host,
          address: address,
          statement: 'Sign in to Digi-tionary',
          uri: window.location.origin,
          version: '1',
          chainId: Number(network.chainId)
        });

        const messageToSign = message.prepareMessage();
        const signature = await signer.signMessage(messageToSign);

        const response = await fetch('/api/auth/siwe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageToSign, signature })
        });

        if (response.ok) {
          setUserAddress(address);
          setIsAuthenticated(true);
        } else {
          alert('Authentication failed');
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
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
  };

  if (isAuthenticated) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          {/* Simple Navbar for Navigation testing */}
          <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
            <div className="font-bold text-xl tracking-tight">Digi-tionary</div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Dashboard userAddress={userAddress} />} />
            <Route path="/create" element={<CreatePage userAddress={userAddress} />} />
            <Route path="/library" element={<Library userAddress={userAddress} />} />
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
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-white group hover:bg-gray-50 text-gray-900 py-4 px-6 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <>
                <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 256 417" fill="none">
                  <path d="M127.961 0L125.813 7.333V285.168L127.961 287.314L255.922 212.165L127.961 0Z" fill="#343434" />
                  <path d="M127.962 0L0 212.165L127.962 287.314V153.448V0Z" fill="#8C8C8C" />
                  <path d="M127.961 312.187L126.781 313.587V406.603L127.961 416.999L256 237.062L127.961 312.187Z" fill="#3C3C3B" />
                  <path d="M127.962 416.999V312.187L0 237.062L127.962 416.999Z" fill="#8C8C8C" />
                  <path d="M127.961 287.314L255.922 212.165L127.961 153.448V287.314Z" fill="#141414" />
                  <path d="M0 212.165L127.962 287.314V153.448L0 212.165Z" fill="#393939" />
                </svg>
                Sign in with Ethereum
              </>
            )}
          </button>

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
        </div>

        <p className="text-gray-600 text-xs text-center mt-8 font-medium">
          By connecting, you agree to our <a href="#" className="text-gray-400 hover:text-white transition-colors underline decoration-dotted">Terms of Service</a> & <a href="#" className="text-gray-400 hover:text-white transition-colors underline decoration-dotted">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
