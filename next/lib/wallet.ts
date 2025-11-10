import { randomBytes } from 'crypto'
import { ec as EC } from 'elliptic'
import { keccak256 } from 'js-sha3'

const ec = new EC('secp256k1')

export interface WalletCredentials {
  address: string      // Wallet address (0x...)
  privateKey: string   // Private key (without 0x prefix)
}

/**
 * Generate a new Ethereum wallet for Hyperliquid
 * Returns wallet address and private key
 */
export function generateEthereumWallet(): WalletCredentials {
  // Generate random private key (32 bytes)
  const privateKeyBytes = randomBytes(32)
  const privateKeyHex = privateKeyBytes.toString('hex')

  // Generate key pair
  const keyPair = ec.keyFromPrivate(privateKeyBytes)
  const publicKey = keyPair.getPublic()

  // Get uncompressed public key (without 0x04 prefix)
  const publicKeyBytes = Buffer.from(publicKey.encode('array', false).slice(1))

  // Generate Ethereum address (last 20 bytes of keccak256 hash)
  const hash = keccak256(publicKeyBytes)
  const addressBytes = Buffer.from(hash, 'hex').slice(-20)
  const address = '0x' + addressBytes.toString('hex')

  return {
    address,
    privateKey: privateKeyHex, // No 0x prefix
  }
}

/**
 * Validate an Ethereum private key and return its address
 */
export function validateEthereumPrivateKey(privateKeyHex: string): string {
  try {
    // Remove 0x prefix if present
    const cleanKey = privateKeyHex.toLowerCase().replace('0x', '')
    
    // Parse private key
    const keyPair = ec.keyFromPrivate(cleanKey, 'hex')
    const publicKey = keyPair.getPublic()

    // Get uncompressed public key (without 0x04 prefix)
    const publicKeyBytes = Buffer.from(publicKey.encode('array', false).slice(1))

    // Generate Ethereum address
    const hash = keccak256(publicKeyBytes)
    const addressBytes = Buffer.from(hash, 'hex').slice(-20)
    const address = '0x' + addressBytes.toString('hex')

    return address
  } catch (error) {
    throw new Error(`Invalid private key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

