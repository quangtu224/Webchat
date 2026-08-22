import { Router } from 'express'
import mongoose from 'mongoose'
import { Message } from '../models/message'

export const chatRouter = Router()

// CI và HEALTHCHECK của Docker (Phase 7 và 8) gọi endpoint này.
chatRouter.get('/health', (_request, response) => {
  const dbConnected = mongoose.connection.readyState === 1
  response.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
  })
})

// Tương ứng /savedMessages của Aufgabe. Trả toàn bộ lịch sử theo thứ tự thời gian.
chatRouter.get('/messages', async (request, response) => {
  const room = typeof request.query.room === 'string' ? request.query.room : undefined
  const filter = room ? { room } : {}

  const messages = await Message.find(filter).sort({ createdAt: 1 })
  response.json(messages)
})

chatRouter.post('/messages', async (request, response) => {
  // Chỉ nhận đúng ba trường. createdAt do server sinh — client không
  // được phép tự đặt thời gian cho tin nhắn của mình.
  const { author, text, room } = request.body ?? {}

  const message = await Message.create({ author, text, room })
  response.status(201).json(message)
})
