import {z} from "zod"

export const userZodSchema = z.object({
    "userName" : z.string() .min(1, "Enter your user name"),
    "password" : z.string() .min(1, "Enter password"),
    "name" : z.string() .min(1, "Enter name")
})

export const signUpSchema = z.object({
    "userName" : z.string() .min(1, "Enter your user name"),
    "password" : z.string() .min(1, "Enter password")
})

export const createRoomSchema = z.object({
    roomName : z.string().min(1,`Enter room name`)
})