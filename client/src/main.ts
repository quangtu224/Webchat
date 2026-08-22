import { getMessages, postMessage } from './api'
import { renderMessages } from './ui'

// TODO Phase 3: lấy tên người dùng từ localStorage thay vì gán cứng.
const CURRENT_USER = 'Quang Tu'
const CURRENT_ROOM = 'general'

// TODO Phase 3: xoá polling, thay bằng WebSocket.
const POLL_INTERVAL_MS = 1000

// querySelector trả về T | null. Bọc lại một lần để phần dưới nhận thẳng
// kiểu không-null, và để lỗi sai selector lộ ra ngay tại đây kèm tên selector,
// thay vì biến thành "Cannot read properties of null" ở một chỗ khác khó lần.
function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Missing required DOM element: ${selector}`)
  }
  return element
}

const messagesEl = requireElement<HTMLElement>('.messages')
const formEl = requireElement<HTMLFormElement>('.composer')
const inputEl = requireElement<HTMLInputElement>('.composer input')

async function refresh(): Promise<void> {
  try {
    const messages = await getMessages(CURRENT_ROOM)
    renderMessages(messagesEl, messages, CURRENT_USER)
  } catch (error) {
    // Server chết không được làm sập cả trang: lần polling sau vẫn chạy.
    console.error('Failed to load messages', error)
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault() // thiếu dòng này trình duyệt sẽ tải lại trang

  const text = inputEl.value.trim()
  if (!text) return

  inputEl.value = ''

  try {
    await postMessage({ author: CURRENT_USER, text, room: CURRENT_ROOM })
    await refresh()
  } catch (error) {
    console.error('Failed to send message', error)
    inputEl.value = text // trả lại nội dung để người dùng không mất công gõ
  }
})

refresh()
setInterval(refresh, POLL_INTERVAL_MS)
