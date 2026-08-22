import type { ChatMessage } from './types'

const BASE = '/api'

/**
 * fetch chỉ ném lỗi khi mất mạng — 404 và 500 vẫn được coi là "thành công".
 * Bọc lại một lần ở đây để mọi lời gọi đều kiểm tra res.ok.
 *
 * TODO Phase 5: `as T` chỉ là lời hứa lúc biên dịch, không kiểm tra gì lúc
 * chạy. Nếu server đổi hình dạng dữ liệu, client sẽ hỏng âm thầm.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, init)

  if (!response.ok) {
    const method = init?.method ?? 'GET'
    throw new Error(`${method} ${path} failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

export async function getMessages(room: string): Promise<ChatMessage[]> {
  return request<ChatMessage[]>(`/messages?room=${encodeURIComponent(room)}`)
}

export async function postMessage(
  input: Pick<ChatMessage, 'author' | 'text' | 'room'>
): Promise<ChatMessage> {
  return request<ChatMessage>('/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}
