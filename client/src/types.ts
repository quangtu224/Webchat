export interface ChatMessage {
  /** Do MongoDB sinh; không có ở tin nhắn chưa gửi lên server. */
  id?: string
  author: string
  text: string
  room: string
  /** Chuỗi ISO, không phải Date — JSON không có kiểu ngày tháng. */
  createdAt: string
}
