export async function hashSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export async function verifyPlayer(
  secret: string,
  player1Id: string,
  player2Id: string | null,
): Promise<{ isValid: boolean; playerNumber: 1 | 2 | null }> {
  const hashed = await hashSecret(secret);
  if (hashed === player1Id) {
    return { isValid: true, playerNumber: 1 };
  }
  if (player2Id && hashed === player2Id) {
    return { isValid: true, playerNumber: 2 };
  }
  return { isValid: false, playerNumber: null };
}
