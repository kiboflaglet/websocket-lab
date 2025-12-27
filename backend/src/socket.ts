import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server({
        cors: {
            origin: "*"
        }
    })

    io.on("connection", (socket) => {
        console.log({socket});
    })

    return io
}