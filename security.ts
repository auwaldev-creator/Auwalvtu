import bcrypt from "bcryptjs";

export async function hashSecret(secret: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(secret, salt);
}

export async function compareSecret(secret: string, hash: string) {
  return bcrypt.compare(secret, hash);
}

export function generateAccountNumber(phone: string) {
  const suffix = Math.abs(hashCode(phone)).toString().slice(0, 6).padEnd(6, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `98${suffix}${random}`.slice(0, 10);
}

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
