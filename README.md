Overview of functions and their description

-----------------------------------------------------------------------------------------

1. mintForPlayer

Description:
This function is used to create a new NFT (mint) for a specific player. Based on a parameter (param), the category of the NFT is determined (e.g. "Fe" for iron, "Ca" for calcium, etc.). The function first verifies that the caller is the authorized owner of the contract. Upon successful verification, the NFT will be minted into the player's wallet.

Inputs:
OwnerWallet: The address of the contract owner (authorization).
privateKey: Private key for owner authentication.
param: NFT category (Fe, Ca, S, N, Ag, Fr).
playerWallet: Address of the player's wallet.

Output: Returns a success or error message if the parameter is invalid or authorization fails.

-----------------------------------------------------------------------------------------

2. combineFeCaNFTs

Description:
Combines four NFTs of the category "Fe" (iron) or "Ca" (calcium) into a new unique NFT. Two NFTs are burned, the metadata of the remaining two NFTs is updated, and the player receives a reward NFT ("S" for "Fe" or "N" for "Ca").

Conditions:
Exactly 4 NFTs must be provided.
The NFT must be of the category "Fe" or "Ca" and have the status "Stable".

Inputs:
nftIds: An array of NFT IDs that will be combined.
category: category (Fe or Ca).
playerWallet: The address of the player who will receive the new token.

Output: information about the newly created NFT or a failure message.

-----------------------------------------------------------------------------------------

3. combineSN

Description:
Combines the four NFTs of category "S" (sulfur) and "N" (nitrogen) into a new NFT ("Ag" or "Fr"). Required ratio:
3x S + 1x N → Ag
2x S + 2x N → Fr
When combined, two NFTs are burned, the metadata of the remaining two are updated and the player receives a new token.

Conditions:
Exactly 4 NFTs must be provided.
The ratio of categories must follow the rules above.
The NFT must have the status "Stable".

Inputs:
nftIds: An array of NFT IDs to be combined.
playerWallet: The address of the player who will receive the new token.

Output: message about the created NFT or information about the combination failure.

-----------------------------------------------------------------------------------------

4. combineAgFr

Description:
Combines 3 NFTs of category "Ag" (silver) and "Fr" (francium) to create a new NFT of category "Fe" with status "Unstable".
Two NFTs are burned, the metadata of the remaining NFT is modified. This feature simulates the higher risk (instability) that corresponds to the game mechanics.

Conditions:
Exactly 3 NFTs must be provided.
Ratio: 2x Ag + 1x Fr.
NFTs must have a "Stable" status.

Inputs:
nftIds.
playerWallet: The address of the player who will receive the new token.

Output: message indicating the success or failure of the combination.

-----------------------------------------------------------------------------------------

5. processMASPayment

Description:
Processes payments in a MAS token. If the amount of 123.45 MAS is sent, it creates a new NFT of type "CrystalSynthesizer" and redirects the reward to the predefined address (rewardAddress). If the amount is different, the system will refund the difference (refund).

Inputs:
amount: amount sent in MAS.
senderWallet: Address of the sender (player).

Output: information about successful NFT creation or refund.

-----------------------------------------------------------------------------------------

6. verifyNFTs

Description:
Checks if the given NFTs meet the required conditions, such as correct category or status. This function is auxiliary and is called in the context of other operations (e.g. combination).

Inputs:
nftIds: The NFT ID field to verify.
category: the expected category of the NFT.
status: the desired status of the NFT (e.g. "Stable").

Output: Boolean (true/false) depending on whether the authentication succeeded.

-----------------------------------------------------------------------------------------

7. updateNFTMetadata

Description:
Modifies the metadata of the specified NFT. This function allows to change attributes such as status ("Stable" → "Reduced") or visual representation ("Crystals").

Inputs:
nftIds: Array of NFT IDs to be modified.
status: the new status of the NFT.

Output: none (asynchronous operations).
