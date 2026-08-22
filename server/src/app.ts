import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { chatRouter } from './routes/chat'

// Express 5 tự bắt lỗi từ handler async và đẩy vào middleware này,
// nên các route không cần try/catch.
const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  // Payload sai kiểu hoặc quá dài đã bị Mongoose schema chặn -> đó là lỗi
  // của client, không phải lỗi server.
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({
      error: 'ValidationError',
      details: Object.values(error.errors).map((e) => e.message),
    })
    return
  }

  console.error('Unhandled error', error)
  response.status(500).json({ error: 'InternalServerError' })
}

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(express.json({ limit: '32kb' }))

  app.use('/api', chatRouter)

  app.use((_request, response) => {
    response.status(404).json({ error: 'NotFound' })
  })

  app.use(errorHandler)

  return app
}
