import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';

export default function TestAuthPage() {
    const [connectedAddress, setConnectedAddress] = useState('');
    const [authStatus, setAuthStatus] = useState('Not Connected');

    const handleConnect = (address) => {
        setConnectedAddress(address);
        setAuthStatus('Authenticated Successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-8">MetaMask Auth Test Page</h1>

            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
                <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-2">Status:</p>
                    <div className={`p-3 rounded-lg text-center font-mono ${connectedAddress ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
                        {authStatus}
                    </div>
                </div>

                {!connectedAddress ? (
                    <div className="space-y-4">
                        <p className="text-gray-300 text-center mb-4">
                            Connect your wallet to test the SIWE flow.
                        </p>
                        <WalletConnect onConnect={handleConnect} />
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 overflow-hidden">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Connected Address</p>
                            <p className="font-mono text-blue-400 break-all">{connectedAddress}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition"
                        >
                            Reset / Test Again
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 text-gray-500 text-sm max-w-md text-center">
                This involves signing a message with your wallet to verify ownership. No transaction fees are incurred.
            </div>
        </div>
    );
}
