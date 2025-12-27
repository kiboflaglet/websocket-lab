import express from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { initSocket } from './socket'
dotenv.config()

const app = express()
const httpServer = createServer(app)

initSocket(httpServer)

const PORT = process.env.PORT

httpServer.listen(PORT, () => {
    console.log(`app runs in http://localhost:${PORT}`)
})

