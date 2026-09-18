export function getDb(): never {
  throw new Error("Database adapter is not configured in the Vercel demo build.");
}
