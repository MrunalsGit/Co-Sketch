import express from "express"
import {string, z} from "zod"
import userMiddleware from "./middleware/userMiddleware.js"
import {signupZodSchema, signinZodSchema, createRoomZodSchema} from "@repo/common/types"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/vars"
import {prisma} from "@repo/db/prisma"
import bcrypt from "bcrypt"
import { CustomRequest } from "./interface/CustomRequest.js"
import cors from "cors"


const app = express()

app.use(express.json())

app.use(cors())

app.post("/signup", async (req,res)=>{
   try{
     const valid = signupZodSchema.safeParse(req.body)

        if(!valid.success){
            return res.status(400).json({
                errors : valid.error.issues
            })
        }

        const {userName, password, name, photo} = req.body
        const hash = await bcrypt.hash(password,5)

        const user = await prisma.user.create({
            data:{
                userName,password:hash,name,photo
            }

        })

        res.json({
            "message" : "Sign up successful"
        })
   }
   catch(e){
    console.log(`Error during signup : ${e}`)
    return res.json({
        message : "Error during signup"
    })
   }

})

app.post("/signin", async (req,res)=>{
    try{
        const valid = signinZodSchema.safeParse(req.body)
        if(!valid.success){
            console.log(`Error in signinZodSchema ${valid.error.issues}` )
            return res.status(400).json({
                message : "Invalid input"
            })
        }

        if(!JWT_SECRET){
            console.log(`jwt secret doesnt exist ${JWT_SECRET}`)
            return res.status(500).json({
                message : `Internal server error`
            })
        }

        const {userName,password} = req.body

        const user = await prisma.user.findUnique({
            where:{userName}
        })

        if(!user){
            return res.json({
                message : "User not found"
            })
        }

        const passCheck = await bcrypt.compare(password,user.password)
        if(!passCheck){
            return res.json({
                message : "Invalid credentials"
            })
        }

        const userId = user.id

        const token = jwt.sign({
            userId
        }, JWT_SECRET)

        res.json({
            token,
            message: `Signin successful`
        })
    }
    catch(e){
        res.json({
            message: "Error during sign in"
        })
    }
})

app.post("/room", userMiddleware,async (req:CustomRequest,res)=>{
    try{
        const valid = createRoomZodSchema.safeParse(req.body)
        if(!valid.success){
            return res.status(400).json({
                errors : valid.error.issues
            })
        }

        const userId = req.userId
        const {roomName} = req.body

        if(!userId || !roomName){
            return res.json({
                message : "Enter room name"
            })
        }

        const room = await prisma.room.create({
            data:{
                slug : roomName,
                adminId:userId
            }
        })

        return res.json({
            roomId : room.id
        })
    }catch(e){
        res.json({
            message : `Room already exists`
        })
    }
})

app.get("/chat/:roomId", async (req, res)=>{
    try{
        const roomId = Number(req.params.roomId)
        const messages = await prisma.chat.findMany({
            where : {roomId},
            orderBy:{
                id : "asc"
            },
            take : 50
        })

        res.json({
            messages
        })
    }catch(e){
        res.json({
            message : `Error occured`
        })
    }
})

app.get("/room/:slug", async (req,res)=>{
    try{
        const slug = req.params.slug
        const room = await prisma.room.findFirst({
            where:{slug}
        })

        if (!room) {
            return res.status(404).json({ message: "Room does not exist" })
        }

        res.json({
            room
        })
    }catch(e){
        res.json({
            message : `Room does not exist`
        })
    }
})

app.listen(3001)