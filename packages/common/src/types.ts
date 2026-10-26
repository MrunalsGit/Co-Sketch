import {z} from "zod"

export const signupZodSchema = z.object({
    "userName" : z.string() .min(1, "Enter your user name"),
    "password" : z.string() .min(1, "Enter password"),
    "name" : z.string() .min(1, "Enter name"),
    "photo" : z.string().optional()
})

export const signinZodSchema = z.object({
    "userName" : z.string() .min(1, "Enter your user name"),
    "password" : z.string() .min(1, "Enter password")
})

export const createRoomZodSchema = z.object({
    roomName : z.string().min(1,`Enter room name`)
})