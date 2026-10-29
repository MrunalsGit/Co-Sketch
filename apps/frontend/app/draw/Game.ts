import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./httpCalls";

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
} | {
    type : 'pencil',
    startX : number,
    startY : number,
    endX : number,
    endY : number
}

export class Game{
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private existingShape : Shape[]
    private roomId : string
    private socket : WebSocket
    private clicked : boolean
    private startX : number
    private startY : number
    private selectedTool : Tool = "circle"

    constructor (canvas : HTMLCanvasElement, roomId : string, socket : WebSocket){
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.roomId = roomId
        this.existingShape = []
        this.socket = socket
        this.clicked = false
        this.startX = 0
        this.startY = 0
        this.init()
        this.initHandler()
        this.initMouseHandlers()
    }

    destroy(){
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
    }

    setTool(tool : "circle" | "rectangle" | "pencil"){
        this.selectedTool = tool
    }

    async init(){
        this.existingShape = await getExistingShapes(this.roomId)
        this.clearCanvas()
    }

    initHandler(){
        this.socket.onmessage = (event)=>{
            const message = JSON.parse(event.data)
            if(message.type == 'chat'){
                const parsedShape = JSON.parse(message.message)
                this.existingShape.push(parsedShape)
                this.clearCanvas()
            }
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = "rgba(0,0,0)"
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height)
        this.existingShape.map((e)=>{
            if(e.type == 'rectangle'){
                this.ctx.strokeStyle = "rgba(255,255,255)"
                this.ctx.strokeRect(e.x,e.y,e.width,e.height)
            }else if(e.type == "circle"){
                this.ctx.beginPath()
                this.ctx.arc(e.centerX, e.centerY, Math.abs(e.radius), 0, Math.PI * 2)
                this.ctx.stroke()
                this.ctx.closePath()
            }
        })
    }

    mouseDownHandler= (e) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
    }

    mouseMoveHandler=(e) =>{ 
        if(this.clicked){
            const width = Math.abs(e.clientX - this.startX)
            const height = Math.abs(e.clientY - this.startY)
            this.clearCanvas()
            this.ctx.strokeStyle = "rgba(255,255,255)"
            //@ts-ignore
            let selectedTool = this.selectedTool
            if( selectedTool == "rectangle"){
                this.ctx.strokeRect(this.startX,this.startY, width,height)
            }else if(selectedTool == "circle"){
                const centerX = this.startX + width/2;
                const centerY = this.startY + height/2;
                const radius = Math.max(width,height)/2;
                this.ctx.beginPath()
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2)
                this.ctx.stroke()
                this.ctx.closePath()
            }
        }
    }

    mouseUpHandler= (e) => {
        this.clicked = false
        const width = e.clientX - this.startX
        const height = e.clientY - this.startY
        let shape : Shape | null = null
        if(this.selectedTool == "rectangle") {
            shape = {
                type : "rectangle",
                x : this.startX,
                y : this.startY,
                height,
                width
            }
        }else if(this.selectedTool == "circle"){
            const radius = Math.max(width,height)/2
            shape = {
                type: "circle",
                centerX: this.startX + radius,
                centerY: this.startY + radius,
                radius
            }
        }

        if(!shape) return

        this.existingShape.push(shape)

        this.socket.send(JSON.stringify({
            type : "chat",
            message : JSON.stringify(shape),
            roomId : this.roomId
        }))
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

    }
}