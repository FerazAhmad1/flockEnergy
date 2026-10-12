import "dotenv/config";

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const config = {
  urjaBaseUrl: getEnv("URJA_BASE_URL"),
  urjaUsername: getEnv("URJA_USERNAME"),
  urjaPassword: getEnv("URJA_PASSWORD"),
};
