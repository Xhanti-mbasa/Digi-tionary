import { useState } from 'react';
import { BrowserProvider } from 'ethers';

export default function WalletConnect({ onConnect }) {
    const [loading, setLoading] = useState(false);

    const generateRandomNonce = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const createSiweMessage = (address, statement, chainId, nonce) => {
        const domain = window.location.host;
        const origin = window.location.origin;
        const version = '1';
        const issuedAt = new Date().toISOString();

        return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
    };

    const connectWallet = async () => {
        console.log("Starting connectWallet...");
        setLoading(true);
        try {
            if (typeof window.ethereum !== 'undefined') {
                console.log("Ethereum provider found.");
                const provider = new BrowserProvider(window.ethereum);

                console.log("Getting signer...");
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                console.log("Signer address:", address);

                console.log("Getting network...");
                const network = await provider.getNetwork();
                console.log("Network chainId:", network.chainId);

                console.log("Constructing SIWE message...");
                const nonce = generateRandomNonce();
                console.log("Generated nonce:", nonce);

                const messageToSign = createSiweMessage(
                    address,
                    'Sign in to Digi-tionary',
                    Number(network.chainId),
                    nonce
                );

                console.log("Message to sign:", messageToSign);

                console.log("Requesting signature...");
                const signature = await signer.signMessage(messageToSign);
                console.log("Signature received:", signature);

                console.log("Sending to backend...");
                const response = await fetch('/api/auth/siwe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: messageToSign, signature })
                });
                console.log("Backend response status:", response.status);

                if (response.ok) {
                    console.log("Auth success!");
                    if (onConnect) {
                        onConnect(address);
                    }
                } else {
                    console.error("Auth failed response");
                    const errorData = await response.json();
                    console.log("Error details:", errorData);
                    alert('Authentication failed details: ' + JSON.stringify(errorData, null, 2));
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

    return (
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
    );
}
