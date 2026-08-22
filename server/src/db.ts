import mongoose from 'mongoose'
import { config } from './config'

export async function connectToDatabase(): Promise<void> {
  await mongoose.connect(config.dbUrl)
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect()
}
