import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toastSuccess = (message:string) =>{
  toast.success(message,{
    position: "top-right",
    autoClose: 3000,
    theme:"colored",
  })
}


export const showError = (message:string) =>{
  toast.error(message,{
    position: "top-right",
    autoClose: 5000,
    theme:"colored",
  })
}

export const showInfo = (message:string) =>{
  toast.info(message,{
    position: "top-right",
    autoClose: 3000,
    theme:"light",
  })
} 