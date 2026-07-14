import crypto from "node:crypto";

const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export const customAlphabet = (length: number) => {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
};
export const createGuestToken = () => customAlphabet(16);
