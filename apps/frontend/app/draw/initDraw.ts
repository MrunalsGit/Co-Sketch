import { HTTP_Backend } from "@/config"
import axios from "axios"

type Shape = {
    type : 'rectangle', 
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
            const width = Math.abs(e.clientX - startX)
            const height = Math.abs(e.clientY - startY)
            clearCanvas(existingShape,ctx,canvas)
            ctx.strokeStyle = "rgba(255,255,255)"
            //@ts-ignore
            let selectedTool = window.selected
            if( selectedTool == "rectangle"){
                ctx.strokeRect(startX,startY, width,height)
            }else if(selectedTool == "circle"){
                const centerX = startX + width/2;
                const centerY = startY + height/2;
                const radius = Math.max(width,height)/2;
                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
                ctx.stroke()
                ctx.closePath()
            }
        }
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false
        const width = e.clientX - startX
        const height = e.clientY - startY
        let shape : Shape | null = null
        //@ts-ignore
        const selected = window.selected
        if(selected == "rectangle") {
            shape = {
                type : "rectangle",
                x : startX,
                y : startY,
                height,
                width
            }
        }else if(selected == "circle"){
            const radius = Math.max(width,height)/2
            shape = {
                type: "circle",
                centerX: startX + radius,
                centerY: startY + radius,
                radius
            }
        }

        if(!shape) return

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
        if(e.type == 'rectangle'){
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(e.x,e.y,e.width,e.height)
        }else if(e.type == "circle"){
            ctx.beginPath()
            ctx.arc(e.centerX, e.centerY, e.radius, 0, Math.PI * 2)
            ctx.stroke()
            ctx.closePath()
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