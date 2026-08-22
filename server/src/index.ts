import { createApp } from './app'
import { config } from './config'
import { connectToDatabase, disconnectFromDatabase } from './db'

async function main(): Promise<void> {
  // Kết nối database trước khi mở cổng: server nhận request mà chưa có DB
  // thì mọi request đầu tiên đều lỗi.
  await connectToDatabase()

  const app = createApp()
  const server = app.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port} (${config.nodeEnv})`)
  })

  // Docker gửi SIGTERM khi dừng container (Phase 7). Đóng gọn ghẽ để
  // không bỏ dở request đang xử lý.
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      server.close(() => {
        void disconnectFromDatabase()
      })
    })
  }
}

main().catch((error: unknown) => {
  console.error('Failed to start server', error)
  process.exitCode = 1
})
