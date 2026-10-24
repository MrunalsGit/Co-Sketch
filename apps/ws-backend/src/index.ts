import "dotenv/config"
import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/vars"

const wss = new WebSocketServer({port : 8080})

wss.on('connection', function connection(ws, request){
    const url = request.url
    if(!url){
        console.log(`No url`)
        return
    }

    const params = new URLSearchParams(url.split('?')[1])
    const token = params.get('token') ?? ""

    if(!JWT_SECRET){
        console.log(`Issue with jwt secret`)
        return
    }

    const valid = jwt.verify(token, JWT_SECRET)
    if(!valid || !(valid as JwtPayload).userId){
        ws.close()
        return
    }

    ws.on('message', function message(data){
        ws.send('pong')
    })
})