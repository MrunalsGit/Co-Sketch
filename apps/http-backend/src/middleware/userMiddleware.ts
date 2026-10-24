import "dotenv/config"
import {NextFunction, Request, Response} from "express"
import {CustomRequest} from "../interface/CustomRequest"
import jwt from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/vars"

export default function userMiddleware(req : CustomRequest, res:Response, next:NextFunction){
    try{
        const token = req.headers["authorization"]

        if(!token){
            return res.status(401).json({
                message : "Authorization token is required"
            })
        }
        if(!JWT_SECRET){
            console.log(`Issue with accessing jwt secert`)
            return
        }

        const valid = jwt.verify(token,JWT_SECRET)

        if(typeof valid == "object" && valid != null && 'userId' in valid){
            req.userId = valid.userId
            next()
        }
        else{
            return res.status(401).json({
                message : `Invalid token payload`
            })
        }
        
    }
    catch(e){
        return res.status(403).json({
            message : `Invalid or expired jwt`
        })
    }
}