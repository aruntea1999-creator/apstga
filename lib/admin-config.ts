import fs from "fs";
import path from "path";

interface AdminConfig {
  username: string;
  password: string; // plain text password (for development)
}

function configPath() {
  return path.join(process.cwd(), "data", "admin-config.json");
}

export function getAdminConfig(): AdminConfig {
  const raw = fs.readFileSync(configPath(), "utf-8");
  return JSON.parse(raw);
}

export function saveAdminConfig(config: AdminConfig): void {
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2));
}

export function verifyAdminPassword(password: string): boolean {
  const config = getAdminConfig();
  return config.password === password;
}

export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  const config = getAdminConfig();
  return config.username === username && config.password === password;
}

export async function updateAdminCredentials(
  username: string,
  password: string,
): Promise<void> {
  saveAdminConfig({ username, password });
}
