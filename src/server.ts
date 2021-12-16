import express, { Express } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new Server(server)

export function getApp(): Express {
  return app
}

export function getIO(): Server {
  return io
}

export function startServer(port: number): Promise<void> {
  return new Promise((reolve) => server.listen(port, reolve))
}
