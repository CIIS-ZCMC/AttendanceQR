import React from 'react'
import AppSidebar from '../app/app-sidebar'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({ children }) {
  return (
        <SidebarProvider
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "16rem",
          'background-color': 'white'
        }}
     
        >
          <SidebarTrigger className={"ml-2 mt-2 text-2xl"} />
          <AppSidebar />
          <main className='p-10'>
            {children}
          </main>
        </SidebarProvider>
  )
}
