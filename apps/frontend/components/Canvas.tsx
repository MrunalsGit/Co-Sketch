import initDraw from "@/app/draw/initDraw"
import { useEffect, useRef, useState } from "react"
import Icons from "./Icons"
import { Game } from "@/app/draw/Game"

export type Tool = "circle" | "rectangle" | "pencil"

export default function Canvas({roomId, socket}: {
    roomId : string,
    socket : WebSocket
}){
    const [selectedTool, setSetectedTool] = useState<Tool>("rectangle")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Game>()

    useEffect(()=>{
        game?.setTool(selectedTool)
    },[selectedTool, game])

    useEffect(()=>{
        
        if(canvasRef.current){
            const g = new Game(canvasRef.current, roomId, socket)
            setGame(g)

            return ()=>{
                g.destroy()
            }
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
                <Icons activated={selectedTool == "pencil"} onClick={()=>{
                    setSetectedTool("pencil")
                }}>pencil</Icons>
                <Icons activated={selectedTool == "rectangle"} onClick={()=>{
                    setSetectedTool("rectangle")
                }}>Rectangle</Icons>
                <Icons activated={selectedTool == "circle"} onClick={()=>{
                    setSetectedTool("circle")
                }}>Circle</Icons>
                
            </div>
    </div>
}