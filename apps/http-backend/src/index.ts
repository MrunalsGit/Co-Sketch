import express from "express"
import {string, z} from "zod"
import userMiddleware from "./middleware/userMiddleware" 

const app = express()

app.use(express.json())

const zodSchema = z.object({
    "userName" : z.string() .min(1, "Enter your name"),
    "password" : z.string() .min(1, "Enter password")
})

app.post("/signup", (req,res)=>{
   try{
     const valid = zodSchema.safeParse(req.body)

        if(!valid.success){
            return res.status(400).json({
                errors : valid.error.issues
            })
        }

        const {userName, password} = req.body

        //add to db

        res.json({
            "message" : "Sign up successful"
        })
   }
   catch(e){
    console.log(`Error during signup : ${e}`)
    return res.json({
        error : "Error during signup"
    })
   }

})

app.post("/signin", (req,res)=>{

})

app.post("/room", userMiddleware ,(req,res)=>{
})

app.listen(3001)