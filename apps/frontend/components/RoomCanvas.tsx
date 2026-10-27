"use client"
import { WS_Backed } from "@/config"
import { useEffect, useRef, useState } from "react"
import Canvas from "./Canvas"

export default function roomCanvas({roomId} : {roomId : string}){
    
    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(()=>{
        const ws = new WebSocket(`${WS_Backed}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjY2Mzg2Ni1iNjVkLTQ3NTYtOTY2Ni04ZjFiYThlMjVjNDciLCJpYXQiOjE3OTMxMTI2Mzh9.RxIp0OesyBP4LAHZrOVmeZmXco5Qdb_cxcKODBQ5wkY`)

        ws.onopen = ()=>{
            setSocket(ws)

            ws.send(JSON.stringify({
                type : "join_room",
                roomId
            }))
        }
    },[])

    

    if(!socket){
        return <div className="h-screen w-screen flex justify-center items-center">
            Connecting ....
        </div>
    }

    return <Canvas roomId={roomId} socket={socket}></Canvas>
}