import fs from "fs/promises";
import path from "path";

const uploadRoot = path.join(process.cwd(), "uploads");
const baseUrl = process.env.APP_BASE_URL || "http://localhost:5000";

const ensureDir = async (filePath: string) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

export const uploadObject = async (key: string, buffer: Buffer, _mimeType: string) => {
  const safeKey = key.replace(/\\/g, "/");
  const filePath = path.join(uploadRoot, safeKey);
  await ensureDir(filePath);
  await fs.writeFile(filePath, buffer);
  return `${baseUrl.replace(/\/$/, "")}/uploads/${safeKey}`;
};

export const downloadObject = async (key: string): Promise<Buffer> => {
  const safeKey = key.replace(/\\/g, "/");
  const filePath = path.join(uploadRoot, safeKey);
  return fs.readFile(filePath);
};
