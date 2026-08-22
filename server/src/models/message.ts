import { Schema, model } from 'mongoose'
import { config } from '../config'

export interface MessageDocument {
  author: string
  text: string
  room: string
  createdAt: Date
}

const messageSchema = new Schema<MessageDocument>({
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: config.maxAuthorLength,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: config.maxMessageLength,
  },
  room: {
    type: String,
    required: true,
    trim: true,
    default: 'general',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Lịch sử chat luôn đọc theo phòng và theo thứ tự thời gian.
messageSchema.index({ room: 1, createdAt: 1 })

// Client không cần biết _id và __v của Mongo. Đổi _id thành id và bỏ __v
// để hình dạng JSON trả về khớp với interface ChatMessage bên client.
messageSchema.set('toJSON', {
  versionKey: false,
  transform(_document, record) {
    const plain = record as unknown as Record<string, unknown>
    plain.id = String(plain._id)
    delete plain._id
    return plain
  },
})

export const Message = model<MessageDocument>('Message', messageSchema)
