import "dotenv/config"
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
const JWT_SECRET = process.env.JWT_SECRET

const wss = new WebSocketServer({port : 8080})

wss.on('connection', function connection(ws, request){
    const url = request.url
    if(!url){
        return
    }

    const params = new URLSearchParams(url.split('?')[1])
    const token = params.get('token')
    const valid = jwt.verify(token)

    ws.on('message', function message(data){
        ws.send('pong')
    })
})