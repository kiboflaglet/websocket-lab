import { randomUUID } from "crypto";
import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173"
        }
    })


    io.on("connection", (socket) => {
        socket.on("chat", (data) => {
            const response = {
                id: randomUUID(),
                tempId: data.id,
                senderId: socket.id,
                message: data.message,
                date: data.date,
                status: "sent"
            }

            socket.emit("chat", response)

            socket.broadcast.emit('chat', response)

        })

        socket.on("updateMessageStatus", (data) => {
            console.log({ updateMessageStatus: data })
            socket.emit("updateMessageStatus", data)
        })
    })

    return io
}