import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { cn } from './utils/ClassNameMergeHelper'
import { Check, Ticket, Timer } from 'lucide-react'

const socket = io('http://localhost:3000')

type Message = {
  id: string;
  message: string;
  date: string;
  senderId: string;
  tempId?: string;
  status: "pending" | "sent" | "delivered" | "read"
}

function App() {

  const [messages, setMessages] = useState<Message[]>([])
  const [currentSocketID, setCurrentSocketID] = useState<string | null>(null)

  const [message, setMessage] = useState("")

  const sendMessage = () => {
    if (!message || !currentSocketID) return;

    const newMessage = {
      id: crypto.randomUUID(),
      message,
      senderId: currentSocketID,
      date: new Date().toISOString(),
      status: "pending"
    } as Message

    setMessages(prev => [...prev, newMessage])

    socket.emit("chat", newMessage)
  }

  const storeMessage = (data: Message) => {
    setMessages(prev => {
      const index = prev.findIndex(item => item.id === data.tempId)

      if (index > -1) {
        const next = [...prev]
        next[index] = { ...data, tempId: undefined }
        console.log({ data })

        return next
      }
      return [...prev, data]
    })
  }

  const updateMessage = (data: Message) => {
    setMessages(prev => {
      const index = prev.findIndex(item => item.id === data.id)
      console.log({prev: prev})
      console.log(data)
      if (index > -1) {
        const next = [...prev]
        next[index] = data
        return next
      }
      return prev
    })
  }

  useEffect(() => {
    socket.on("connect", () => {
      setCurrentSocketID(socket.id || null)

      socket.on("chat", (data) => {
        if (data?.senderId !== currentSocketID
          && (data?.status !== 'delivered' || data?.status !== 'read')) {
          socket.emit("updateMessageStatus", { ...data, status: "delivered" })
        }
        storeMessage(data)
      })

      socket.on("updateMessageStatus", (data) => {
        if (data) {
          updateMessage(data)
        }
      })
    })



    return () => {
      socket.off("connect")
      socket.off("chat")
    }
  }, [])


  return (

    <div
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          sendMessage()
        }
      }}
      className='flex flex-col items-center justify-center min-h-screen  '>
      <span className='text-5xl mb-4'>Message box (Broadcast)</span>
      <div className="w-200 h-200 border rounded-2xl border-gray-500 flex flex-col ">
        <div className='flex-1 px-10 py-5  overflow-y-auto'>
          {messages.map(item => (
            <Message
              key={item.id}
              id={item.id}
              status={item.status}
              message={item.message}
              date={new Date(item.date).toLocaleString()}
              senderId={item.senderId}
              owner={item.senderId === currentSocketID}
            />
          ))}
        </div>
        <div className='  px-10 py-5  flex gap-5 items-center'>
          <div className='flex-1'>
            <input
              onChange={(event) => {
                setMessage(event.target.value)
              }}
              placeholder='Write a message'
              className='bg-white w-full py-3 rounded-xl text-black px-3' />
          </div>
          <button
            onClick={sendMessage}
            className='border bg-blue-600 py-4 px-13 rounded-xl font-bold'>Send</button>
        </div>
      </div>
    </div>
  )
}

type MessageProps = Message & {
  owner: boolean
}

const Message = ({
  owner,
  senderId,
  date,
  message,
  status
}: MessageProps) => {
  return (
    <div className={cn("flex mb-4 ", owner ? "justify-end" : "justify-start")}>
      <div>
        <div
          className={cn(
            "p-4 flex flex-col max-w-140 rounded-2xl",
            owner ? "bg-amber-500" : "bg-cyan-600"
          )}
        >
          <span className="font-bold">{senderId}</span>
          <span>{message}</span>
        </div>

        <div
          className={cn(
            "py-3 px-1 text-sm opacity-70 flex justify-between",
            owner ? "text-right" : "text-left"
          )}
        >
          {date}
          {owner && (

            <div className="flex gap">
              {status === 'pending' && (<Timer />)}
              {status === 'sent' && (<Check />)}
              {status === 'delivered' && (
                <>
                  <Check />
                  <Check />
                </>)}
              {status === 'read' && (
                <>
                  <Check className='text-blue-400' />
                  <Check className='text-blue-400' />
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App