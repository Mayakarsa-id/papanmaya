const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret(length = 20): string {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  let bits = 0, value = 0, output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32ToBuffer(base32: string): Uint8Array {
  const cleanInput = base32.toUpperCase().replace(/=+$/, '');
  const output = new Uint8Array(Math.floor(cleanInput.length * 5 / 8));
  let bits = 0, value = 0, index = 0;
  for (let i = 0; i < cleanInput.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanInput[i]);
    if (val === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return output;
}

async function generateHOTP(secretBase32: string, step: number): Promise<string> {
  const keyBytes = base32ToBuffer(secretBase32);
  const counter = new Uint8Array(8);
  let temp = step;
  for (let i = 7; i >= 0; i--) { counter[i] = temp & 0xff; temp = temp >> 8; }
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, counter);
  const hash = new Uint8Array(signature);
  const offset = hash[19] & 0xf;
  const binary = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16) | ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff);
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export async function verifyTOTP(secretBase32: string, token: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) return false;
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let i = -1; i <= 1; i++) {
    const validOtp = await generateHOTP(secretBase32, currentStep + i);
    if (validOtp === token) return true;
  }
  return false;
}