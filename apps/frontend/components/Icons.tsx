import { ReactNode } from "react"

export default function childrens({children, onClick, activated}:{
    children : ReactNode,
    onClick : ()=>void,
    activated: boolean
}){
    return <div onClick={onClick} className={`flex justify-center items-center w-25 px-[8px] py-[10px] hover:bg-gray-600 bg-gray-800 cursor-pointer
        rounded-md ${activated ? "text-gray-500" : "text-gray-100" } ` }
     >
        {children}
    </div>
}