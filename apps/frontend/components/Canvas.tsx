import initDraw from "@/app/draw/initDraw"
import { useEffect, useRef } from "react"

export default function Canvas({roomId, socket}: {
    roomId : string,
    socket : WebSocket
}){
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(()=>{
        
        if(canvasRef.current){
            initDraw(canvasRef.current, roomId, socket)
        }

    },[canvasRef])

    return <div>
        <canvas ref={canvasRef} style={{
            display: "block",
            margin: 0,
            padding: 0,
            overflow: "hidden"
        }}>
            
        </canvas>
    </div>
}