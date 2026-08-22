import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// .env nằm ở gốc repo, không phải trong server/. Giải đường dẫn từ vị trí
// của file này thay vì từ cwd, để chạy từ thư mục nào cũng đúng.
const here = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(here, '../../.env') })

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`
    )
  }
  return value
}

function numberEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback

  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number, got: ${raw}`)
  }
  return parsed
}

export const config = {
  port: numberEnv('PORT', 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Aufgabe 5.3.1: URL của MongoDB phải cấu hình được từ bên ngoài.
  // Cố tình không có giá trị mặc định — chạy nhầm vào database sai
  // còn tệ hơn là không chạy được.
  dbUrl: requireEnv('DB_URL'),

  maxMessageLength: numberEnv('MAX_MESSAGE_LENGTH', 2000),
  maxAuthorLength: numberEnv('MAX_AUTHOR_LENGTH', 50),
}
