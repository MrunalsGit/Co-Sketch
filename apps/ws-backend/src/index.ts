import "dotenv/config"
import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/vars"
import {prisma} from "@repo/db/prisma"

const wss = new WebSocketServer({port : 8080})

interface UserType{
    userId : string
    rooms : string[]
    ws : WebSocket
}

const users : UserType[] = []

function check(token : string){
    try{
        if(!JWT_SECRET){
            console.log(`Issue with jwt secret`)
            console.log(`Failed jwt`)
            return
        }

        const valid = jwt.verify(token, JWT_SECRET)
        
        if(typeof valid == "string"){
            console.log(`Failed verification`)
            console.log(token)
            return null
        }
        if(!valid || !valid.userId){
            console.log(`Failed verification`)
            console.log(token)
            return null
        }
        return valid.userId
    }catch(e){
        console.log(`Error`)
        return null
    }
}

wss.on('connection', function connection(ws, request){
    const url = request.url
    if(!url){
        console.log(`No url`)
        return
    }

    const params = new URLSearchParams(url.split('?')[1])
    const token = params.get('token') ?? ""

    const userId = check(token)
    if(!userId){
        ws.close()
        return
    }

    users.push({
        userId,
        rooms:[],
        ws
    })

    ws.on('message', async function message(data){
        const parsedData = JSON.parse(data as unknown as string)

        if(parsedData.type == "join_room"){
            const user = users.find((x)=> x.ws == ws)
            user?.rooms.push(parsedData.roomId)
        }

        if(parsedData.type == "leave_room"){
            const user = users.find((x)=> x.ws == ws)
            user?.rooms.filter((x)=> x == parsedData.roomId)
        }

        if(parsedData.type == "chat"){
            const roomId = parsedData.roomId
            const message = parsedData.message      //add checks on message if too big or sus

            await prisma.chat.create({
                data:{
                    roomId,
                    userId,
                    message
                }
            })

            users.forEach((x)=>{
                if(x.rooms.includes(roomId)){
                    x.ws.send(JSON.stringify({
                        type: "chat",
                        message,
                        roomId
                    }))
                }
            })
        }
    })
})