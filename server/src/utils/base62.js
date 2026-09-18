const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const KEY_LENGTH = 7;

export function encodeBase62(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('Base10 ID must be a non-negative safe integer');
  }

  let remaining = value;
  let encoded = '';
  do {
    encoded = ALPHABET[remaining % 62] + encoded;
    remaining = Math.floor(remaining / 62);
  } while (remaining > 0);

  if (encoded.length > KEY_LENGTH) {
    throw new Error('Base10 ID exceeds the 7-character Base62 capacity');
  }

  return encoded.padStart(KEY_LENGTH, ALPHABET[0]);
}
