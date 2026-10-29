import initDraw from "@/app/draw/initDraw"
import { useEffect, useRef, useState } from "react"
import Icons from "./Icons"

type Shape = "circle" | "rectangle" | "pencil"

export default function Canvas({roomId, socket}: {
    roomId : string,
    socket : WebSocket
}){
    const [selected, setSetected] = useState<Shape>("pencil")
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(()=>{
        //@ts-ignore
        window.selected  = selected
    },[selected])

    useEffect(()=>{
        
        if(canvasRef.current){
            initDraw(canvasRef.current, roomId, socket)
        }

    },[canvasRef])

    return <div style={{
            height: "100vh",
            overflow: "hidden"
        }}>
            <canvas ref={canvasRef}  width={window.innerWidth} height={window.innerHeight} />
        
            <div className="border border-gray-200" style={{
                position:"fixed",top:20, left:750, display:"flex"
            }}>
                <Icons activated={selected == "pencil"} onClick={()=>{
                    setSetected("pencil")
                }}>pencil</Icons>
                <Icons activated={selected == "rectangle"} onClick={()=>{
                    setSetected("rectangle")
                }}>Rectangle</Icons>
                <Icons activated={selected == "circle"} onClick={()=>{
                    setSetected("circle")
                }}>Circle</Icons>
                
            </div>
    </div>
}