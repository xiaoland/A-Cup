export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function generateKeypair(): KeyPair;
