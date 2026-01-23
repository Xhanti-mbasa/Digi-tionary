import { parseEther } from 'ethers';

/**
 * Sends a zero-value transaction to the user's own address to trigger a wallet interaction.
 * @param {Object} signer - The ethers.js Signer object
 * @returns {Promise<Object>} The transaction receipt
 */
export const sendZeroValueTransaction = async (signer) => {
    try {
        const address = await signer.getAddress();
        console.log("Initiating zero-value transaction to:", address);

        const tx = await signer.sendTransaction({
            to: address,
            value: parseEther("0")
        });

        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return receipt;
    } catch (error) {
        console.error("Zero-value transaction failed:", error);
        throw error;
    }
};
