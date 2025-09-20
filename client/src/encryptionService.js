import CryptoJS from 'crypto-js';

const getSharedSecret = (uid1, uid2) => {
  // 1. VALIDATE INPUTS: Ensure we have two valid, non-empty strings.
  if (typeof uid1 !== 'string' || typeof uid2 !== 'string' || uid1.trim() === '' || uid2.trim() === '') {
    console.error("KEY_GEN_ERROR: Invalid UIDs provided. Both must be non-empty strings.", { uid1, uid2 });
    return 'invalid-key-due-to-bad-uids';
  }

  // 2. LOG & NORMALIZE: Log the raw inputs and trim whitespace.
  console.log("KEY_GEN_LOG: Received UIDs:", { uid1, uid2 });
  const trimmedUid1 = uid1.trim();
  const trimmedUid2 = uid2.trim();

  // 3. SORT & COMBINE: Sort to ensure consistency.
  const sortedUids = [trimmedUid1, trimmedUid2].sort();
  const combinedId = sortedUids.join('');
  console.log("KEY_GEN_LOG: Sorted and combined IDs:", combinedId);

  // 4. HASH & RETURN: Generate the final key.
  const finalKey = CryptoJS.SHA256(combinedId).toString(CryptoJS.enc.Hex);
  console.log("KEY_GEN_LOG: Final generated key:", finalKey);

  return finalKey;
};

export const encryptMessage = (plainText, currentUserUid, otherUserUid) => {
  console.log("--- Encrypting Message ---");
  const secretKey = getSharedSecret(currentUserUid, otherUserUid);
  const ciphertext = CryptoJS.AES.encrypt(plainText, secretKey).toString();
  return ciphertext;
};

export const decryptMessage = (ciphertext, currentUserUid, otherUserUid) => {
  console.log("--- Decrypting Message ---");
  const secretKey = getSharedSecret(currentUserUid, otherUserUid);
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalText) {
      console.error("DECRYPT_FAIL: Decryption resulted in empty text. Key is likely wrong.");
      return "⚠️ Failed to decrypt message (Key mismatch)";
    }
    return originalText;
  } catch (error) {
    console.error("DECRYPT_FAIL: A critical error occurred during decryption.", error);
    return "⚠️ Failed to decrypt message (Error)";
  }
};