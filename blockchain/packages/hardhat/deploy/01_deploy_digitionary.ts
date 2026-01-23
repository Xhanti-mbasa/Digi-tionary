import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the Digitionary contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployDigitionary: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // Deploy Digitionary contract
    await deploy("Digitionary", {
        from: deployer,
        args: [], // No constructor arguments
        log: true,
        autoMine: true,
    });

    // Get the deployed contract
    const digitionary = await hre.ethers.getContract<Contract>("Digitionary", deployer);

    // Log initial stats
    const stats = await digitionary.getStats();
    console.log("📚 Digitionary deployed!");
    console.log("   Total Words:", stats[0].toString());
    console.log("   Total Dictionaries:", stats[1].toString());
    console.log("   Total Staked:", hre.ethers.formatEther(stats[2]), "ETH");
};

export default deployDigitionary;

deployDigitionary.tags = ["Digitionary"];
