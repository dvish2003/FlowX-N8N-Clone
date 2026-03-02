'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import type { Session } from 'next-auth'
import { Provider } from "react-redux";
import { store } from "../stores";


import { TooltipProvider } from './components/ui/tooltip';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children, session }: { children: ReactNode; session?: Session }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
        <TooltipProvider delayDuration={0}>
          <Provider store={store}>
            {children}
            <ToastContainer 
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </Provider>
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
