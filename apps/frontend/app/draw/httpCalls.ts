import { HTTP_Backend } from "@/config"
import axios from "axios"

export async function getExistingShapes(roomId : string){
    const res = await axios.get(`${HTTP_Backend}/chat/${roomId}`)
    const existing = res.data.messages

    const shapes = existing.map((x : {message : string})=>{
        const data = JSON.parse(x.message)
        return data
    })

    return shapes
}