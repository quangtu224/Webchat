import type { ChatMessage } from './types'

const BASE = '/api'

// TODO Phase 2: xoá mảng này khi server đã chạy.
const mockMessages: ChatMessage[] = [
  {
    author: 'Mai Anh',
    text: "Morning everyone, I'm starting on the UI today.",
    room: 'general',
    createdAt: '2026-08-21T09:12:00',
  },
  {
    author: 'Lukas',
    text: "I'd suggest two columns: room list on the left, chat pane on the right.",
    room: 'general',
    createdAt: '2026-08-21T09:13:00',
  },
  {
    author: 'Quang Tu',
    text: 'Agreed. Plain HTML and CSS first.',
    room: 'general',
    createdAt: '2026-08-21T09:15:00',
  },
  {
    author: 'Quang Tu',
    text: 'JavaScript comes once the layout is done.',
    room: 'general',
    createdAt: '2026-08-21T09:16:00',
  },
  {
    author: 'Sophia',
    text: "Don't forget to make it look good on mobile!",
    room: 'general',
    createdAt: '2026-08-21T09:20:00',
  },
]

export async function getMessages(): Promise<ChatMessage[]> {
  // Bản sao, không phải mảng gốc: người gọi lỡ sort/pop cũng không hỏng dữ liệu.
  return [...mockMessages]

  // TODO Phase 2: thay dòng trên bằng
  // const res = await fetch(`${BASE}/messages`)
  // if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  // return (await res.json()) as ChatMessage[]
}

export async function postMessage(
  input: Pick<ChatMessage, 'author' | 'text' | 'room'>
): Promise<ChatMessage> {
  // createdAt do "server" sinh ra, không nhận từ người gọi.
  const message: ChatMessage = {
    ...input,
    createdAt: new Date().toISOString(),
  }
  mockMessages.push(message)
  return message

  // TODO Phase 2: thay phần trên bằng
  // const res = await fetch(`${BASE}/messages`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(input),
  // })
  // if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  // return (await res.json()) as ChatMessage
}
