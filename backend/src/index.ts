import express from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { initSocket } from './socket'
dotenv.config()

const app = express()
const httpServer = createServer(app)

initSocket(httpServer)

const PORT = Number(process.env.PORT) || 3000

httpServer.listen(PORT, () => {
    console.log(`app runs in http://localhost:${PORT}`)
})

