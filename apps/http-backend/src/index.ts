import express from "express"
import {string, z} from "zod"
import userMiddleware from "./middleware/userMiddleware"
import {signupZodSchema, signinZodSchema, createRoomZodSchema} from "@repo/common/types"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/vars"


const app = express()

app.use(express.json())

app.post("/signup", (req,res)=>{
   try{
     const valid = signupZodSchema.safeParse(req.body)

        if(!valid.success){
            return res.status(400).json({
                errors : valid.error.issues
            })
        }

        const {userName, password, name} = req.body

        //add to db

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

app.post("/signin", (req,res)=>{
    try{
        const valid = signinZodSchema.safeParse(req.body)
        if(!valid.success){
            return res.status(400).json({
                errors : valid.error.issues
            })
        }

        if(!JWT_SECRET){
            console.log(`jwt secret doesnt exist`)
            return
        }

        const userId = 1 //dummy for now

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

app.post("/room", userMiddleware, (req,res)=>{
    const valid = createRoomZodSchema.safeParse(req.body)
    if(!valid.success){
        return res.status(400).json({
            errors : valid.error.issues
        })
    }

    const userId = "1" // hardcoded for now

    res.json({
        userId
    })
})

app.listen(3001)