import type { ChatMessage } from './types'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function createMessageElement(msg: ChatMessage, currentUser: string): HTMLElement {
  const isMine = msg.author === currentUser

  const el = document.createElement('div')
  el.classList.add('message')
  el.classList.toggle('message--me', isMine)

  const avatar = document.createElement('span')
  avatar.classList.add('avatar')
  avatar.classList.toggle('avatar--me', isMine)
  avatar.textContent = initials(msg.author)

  const author = document.createElement('span')
  author.classList.add('message__author')
  author.textContent = msg.author

  const time = document.createElement('span')
  time.classList.add('message__time')
  time.textContent = formatTime(msg.createdAt)

  const meta = document.createElement('div')
  meta.classList.add('message__meta')
  meta.append(author, time)

  // textContent, không phải innerHTML. Đây là chỗ duy nhất dữ liệu do
  // người dùng nhập chạm vào DOM, tức là nơi lỗ hổng XSS sẽ nằm nếu làm sai.
  const bubble = document.createElement('p')
  bubble.classList.add('bubble')
  bubble.textContent = msg.text

  const body = document.createElement('div')
  body.classList.add('message__body')
  body.append(meta, bubble)

  el.append(avatar, body)
  return el
}

export function renderMessages(
  container: HTMLElement,
  messages: ChatMessage[],
  currentUser: string
): void {
  // replaceChildren xoá con cũ và chèn con mới trong một lần cập nhật DOM.
  container.replaceChildren(
    ...messages.map((msg) => createMessageElement(msg, currentUser))
  )

  // Phải đặt sau khi chèn: trước đó scrollHeight chưa tính nội dung mới.
  container.scrollTop = container.scrollHeight
}
