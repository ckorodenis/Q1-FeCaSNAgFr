import { SmartContractsClient, WalletClient, Args } from '@massalabs/massa-web3';

class QuestContract {
  private ownerWallet: string = "<OWNER_WALLET_ADDRESS>";
  private burnAddress: string = "0000000000000000000000000000000000000000000000000000";
  private rewardAddress: string = "MW0rldWallet";
  private smartContractsClient: SmartContractsClient;
  private walletClient: WalletClient;

  constructor(smartContractsClient: SmartContractsClient, walletClient: WalletClient) {
    this.smartContractsClient = smartContractsClient;
    this.walletClient = walletClient;
  }

  // 1. Mintování NFT podle parametru
  async mintForPlayer(param: string, playerWallet: string, ownerPrivateKey: string): Promise<string> {
    if (!this.validateOwner(this.ownerWallet, ownerPrivateKey)) {
      return "Unauthorized access.";
    }

    const nftCategory = { Fe: "Iron", Ca: "Calcium", S: "Sulfur", N: "Nitrogen", Ag: "Silver", Fr: "Francium" }[param];
    if (!nftCategory) return "Invalid parameter.";

    const args = new Args().addString(nftCategory).addString(playerWallet);
    await this.smartContractsClient.callSmartContract({
      maxGas: 100000n,
      address: this.ownerWallet,
      functionName: 'mintNFT',
      parameter: args.serialize(),
    });

    return `NFT (${nftCategory}) minted for wallet: ${playerWallet}`;
  }

  // 2. Kombinace 4x Fe nebo Ca
  async combineFourNFTs(nftIds: string[], category: string, playerWallet: string): Promise<string> {
    if (nftIds.length !== 4 || !["Fe", "Ca"].includes(category)) return "Invalid input.";
    const verified = await this.verifyNFTs(nftIds, category, "Stable");
    if (!verified) return "NFT validation failed.";

    // Burn 2 NFTs and update metadata of the remaining 2
    await this.burnNFTs(nftIds.slice(0, 2));
    await this.updateNFTMetadata(nftIds.slice(2), "Reduced");

    const rewardCategory = category === "Fe" ? "S" : "N";
    const args = new Args().addString(rewardCategory).addString(playerWallet);
    await this.smartContractsClient.callSmartContract({
      maxGas: 150000n,
      address: this.ownerWallet,
      functionName: 'mintRewardNFT',
      parameter: args.serialize(),
    });

    return `NFTs combined and new NFT (${rewardCategory}) minted.`;
  }

  // 3. Kombinace S a N
  async combineSN(nftIds: string[], playerWallet: string): Promise<string> {
    if (!this.validateSNCombination(nftIds)) return "Invalid combination.";
    const verified = await this.verifyNFTs(nftIds, null, "Stable");
    if (!verified) return "NFT verification failed.";

    await this.burnNFTs(nftIds.slice(0, 2));
    await this.updateNFTMetadata(nftIds.slice(2), "Reduced");

    const rewardCategory = nftIds.filter(id => id.startsWith("S")).length === 3 ? "Ag" : "Fr";
    const args = new Args().addString(rewardCategory).addString(playerWallet);
    await this.smartContractsClient.callSmartContract({
      maxGas: 150000n,
      address: this.ownerWallet,
      functionName: 'mintRewardNFT',
      parameter: args.serialize(),
    });

    return `NFTs combined and new NFT (${rewardCategory}) minted.`;
  }

  // 4. Kombinace Ag a Fr
  async combineAgFr(nftIds: string[], playerWallet: string): Promise<string> {
    if (nftIds.length !== 3 || nftIds.filter(id => id.startsWith("Ag")).length !== 2 || nftIds.filter(id => id.startsWith("Fr")).length !== 1) {
      return "Invalid combination.";
    }

    const verified = await this.verifyNFTs(nftIds, null, "Stable");
    if (!verified) return "NFT verification failed.";

    await this.burnNFTs(nftIds.slice(0, 2));
    await this.updateNFTMetadata(nftIds.slice(2), "Reduced");

    const args = new Args().addString("Fe").addString(playerWallet).addString("Unstable");
    await this.smartContractsClient.callSmartContract({
      maxGas: 150000n,
      address: this.ownerWallet,
      functionName: 'mintRewardNFT',
      parameter: args.serialize(),
    });

    return `NFTs combined and new NFT (Fe) minted with metadata Crystals = Unstable.`;
  }

  // 5. Zpracování MAS plateb
  async processMASPayment(amount: number, senderWallet: string): Promise<string> {
    if (amount === 123.45) {
      const args = new Args().addString("CrystalSynthesizer").addString(senderWallet).addString("New");
      await this.smartContractsClient.callSmartContract({
        maxGas: 150000n,
        address: this.ownerWallet,
        functionName: 'mintSpecialNFT',
        parameter: args.serialize(),
      });

      await this.walletClient.sendTransaction({
        amount: 123.2n,
        recipient: this.rewardAddress,
        senderWallet,
      });

      return `NFT minted and payment processed.`;
    } else {
      const refund = amount - 0.8;
      await this.walletClient.sendTransaction({
        amount: BigInt(refund * 1e9),
        recipient: senderWallet,
        senderWallet,
      });

      return `Invalid amount. Refunded: ${refund} MAS.`;
    }
  }

  // Auxiliary functions
  private async verifyNFTs(nftIds: string[], category: string | null, status: string): Promise<boolean> {
    // Logic for verifying NFT ownership and metadata
    return true; // Mock implementation
  }

  private async updateNFTMetadata(nftIds: string[], newStatus: string): Promise<void> {
    for (const nftId of nftIds) {
      // Update metadata for each NFT
    }
  }

  private async burnNFTs(nftIds: string[]): Promise<void> {
    const args = new Args().addStringArray(nftIds);
    await this.smartContractsClient.callSmartContract({
      maxGas: 100000n,
      address: this.burnAddress,
      functionName: 'burn',
      parameter: args.serialize(),
    });
  }

  private validateOwner(ownerWallet: string, privateKey: string): boolean {
    // Validate owner logic
    return true; // Mock implementation
  }

  private validateSNCombination(nftIds: string[]): boolean {
    const countS = nftIds.filter(id => id.startsWith("S")).length;
    const countN = nftIds.filter(id => id.startsWith("N")).length;
    return (countS === 3 && countN === 1) || (countS === 2 && countN === 2);
  }
}

export default QuestContract;
