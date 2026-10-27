import { HTTP_Backend } from "@/config"
import axios from "axios"

type Shape = {
    type : 'rect', 
    x : number,
    y : number,
    width : number,
    height : number
} | {
    type : 'circle',
    centerX : number,
    centerY : number,
    radius : number
}

export default async function initDraw(canvas : HTMLCanvasElement, roomId : string, socket : WebSocket){
    const ctx = canvas.getContext("2d")

    function resizeCanvas(){
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resizeCanvas()
    if(!ctx){
        return
    }

    const existingShape : Shape[] = await getExistingShapes(roomId)
    console.log(existingShape)

    socket.onmessage = (event)=>{
        const message = JSON.parse(event.data)
        if(message.type == 'chat'){
            const parsedShape = JSON.parse(message.message)
            existingShape.push(parsedShape)
            clearCanvas(existingShape, ctx,canvas)
        }
    }

    clearCanvas(existingShape, ctx,canvas)

    let clicked = false
    let startX = 0
    let startY = 0

    canvas.addEventListener("mousedown", (e) => {
        clicked = true
        startX = e.clientX
        startY = e.clientY
    })

    canvas.addEventListener("mousemove", (e) => {
        if(clicked){
            const width = e.clientX - startX
            const height = e.clientY - startY
            clearCanvas(existingShape,ctx,canvas)
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(startX,startY, width,height)
        }
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false
        const width = e.clientX - startX
        const height = e.clientY - startY
        const shape : Shape = {
            type : 'rect',
            x : startX,
            y : startY,
            height,
            width
        }
        existingShape.push(shape)

        socket.send(JSON.stringify({
            type : "chat",
            message : JSON.stringify(shape),
            roomId
        }))
    })
}

function clearCanvas ( existingShape : Shape[], ctx : CanvasRenderingContext2D, canvas : HTMLCanvasElement){
    ctx.clearRect(0,0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width, canvas.height)
    existingShape.map((e)=>{
        if(e.type == 'rect'){
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(e.x,e.y,e.width,e.height)
        }
    })
    
    
}

async function getExistingShapes(roomId : string){
    const res = await axios.get(`${HTTP_Backend}/chat/${roomId}`)
    const existing = res.data.messages

    const shapes = existing.map((x : {message : string})=>{
        const data = JSON.parse(x.message)
        return data
    })

    return shapes
}