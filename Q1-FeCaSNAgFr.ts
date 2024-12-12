import {
  Args,
  stringToBytes,
  u256ToBytes,
  bytesToString,
  bytesToU256,
  u64ToBytes,
  bytesToU64,
} from '@massalabs/as-types';
import {
  _constructor,
  _update,
} from './NFT-internals';

import { setOwner, onlyOwner, ownerAddress } from '../utilities/ownership';
import {
  Storage,
  generateEvent,
  transferCoins,
  Address,
} from '@massalabs/massa-as-sdk';
import { Context, isDeployingContract } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly';

const BASE_URI_KEY = stringToBytes('BASE_URI');
const MAX_SUPPLY_KEY = stringToBytes('MAX_SUPPLY');
const COUNTER_KEY = stringToBytes('COUNTER');

// Helper function for token identification
function getTokenIdFromId(nftId: string): u256 {
  let parts = nftId.split('#');
  return u256.fromString(parts[1]);
}

// Helper function to get NFT category from ID
function getCategoryFromId(nftId: string): string {
  return nftId.split('#')[0];
}

function validateNFTOwnership(nftId: string, owner: string): bool {
  // Placeholder for ownership validation
  return true;
}

function validateNFTStatus(nftId: string, status: string): bool {
  // Placeholder for status validation
  return true;
}

export function constructor(binaryArgs: StaticArray<u8>): void {
  assert(isDeployingContract());
  const args = new Args(binaryArgs);
  const name = args.nextString().expect('name argument is missing or invalid');
  const symbol = args.nextString().expect('symbol argument is missing or invalid');
  _constructor(name, symbol);
  const owner = args.nextString().expect('owner argument is missing or invalid');
  setOwner(new Args().add(owner).serialize());
  const baseURI = args.nextString().expect('baseURI argument is missing or invalid');

  Storage.set(BASE_URI_KEY, stringToBytes(baseURI));
  Storage.set(MAX_SUPPLY_KEY, u256ToBytes(u256.fromU32(5000)));
  Storage.set(COUNTER_KEY, u256ToBytes(u256.Zero));

  generateEvent('Quest NFT COLLECTION IS DEPLOYED');
}

export function mintNFT(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const nftCategory = args.nextString().expect('NFT category is missing');
  const to = args.nextString().expect('Recipient is missing');

  let currentSupply = bytesToU256(Storage.get(COUNTER_KEY));
  let maxSupply = bytesToU256(Storage.get(MAX_SUPPLY_KEY));
  
  assert(currentSupply < maxSupply, 'Max supply reached');

  const newId = currentSupply + u256.One;
  Storage.set(COUNTER_KEY, u256ToBytes(newId));
  _update(to, newId, '');
  generateEvent(`Minted ${nftCategory}#${newId.toString()} to ${to}`);
}

export function mintRewardNFT(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const category = args.nextString().expect('Category is missing');
  const to = args.nextString().expect('Recipient is missing');
  mintNFT(new Args().addString(category).addString(to).serialize());
}

export function mintSpecialNFT(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const nftCategory = args.nextString().expect('NFT category is missing');
  const to = args.nextString().expect('Recipient is missing');
  mintNFT(new Args().addString(nftCategory).addString(to).serialize());
}

export function burn(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const nftIds = args.nextStringArray().expect('NFT IDs are missing');
  for (let i = 0; i < nftIds.length; i++) {
    let nftId = nftIds[i];
    // Here we would remove the NFT from storage, but for now, we'll just log it
    generateEvent(`Burned ${nftId}`);
  }
}

// Placeholder for these functions, they need to be implemented properly
export function updateNFTMetadata(binaryArgs: StaticArray<u8>): void {
  // Logic to update NFT metadata
}

export function verifyNFTs(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  // Logic to verify NFTs
  return boolToByte(true);
}

export function processMASPayment(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const amount = bytesToU64(args.nextU64().expect('Amount is missing'));
  const senderWallet = args.nextString().expect('Sender wallet is missing');

  const expectedAmount = u64.fromU32(12345000); // 123.45 MAS in nanoMAS

  if (amount == expectedAmount) {
    mintSpecialNFT(new Args().addString("CrystalSynthesizer").addString(senderWallet).serialize());
    transferCoins(new Address(bytesToString(ownerAddress([]))), amount - u64.fromU32(232000)); // 123.2 MAS to reward address in nanoMAS
  } else {
    transferCoins(new Address(senderWallet), amount); // Refund
  }
}

// Placeholder for owner validation
function validateOwner(): bool {
  return Context.caller().toString() == bytesToString(Storage.get(ownerAddress([])));
}