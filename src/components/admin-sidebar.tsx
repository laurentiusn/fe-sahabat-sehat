import * as React from "react"
import { useLocation } from "react-router-dom" // 1. Import useLocation
import {
  IconDashboard,
  IconChartBar,
  IconPill,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Logo } from "./ui/logo"

// Menu Admin (Hapus isActive: true hardcoded)
const navMain = [
  { 
    title: "Dashboard", 
    url: "/admin/dashboard", 
    icon: IconDashboard 
  },
  { 
    title: "Indikator", 
    url: "/admin/indikator", 
    icon: IconChartBar 
  }, 
  { 
    title: "Tips Hidup Sehat", 
    url: "#", // Nanti diganti jika sudah ada rute tips
    icon: IconPill 
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation() // 2. Ambil URL saat ini

  return (
    <Sidebar
      collapsible="offcanvas"
      style={{
        "--sidebar": "#1E3A8A",
        "--sidebar-foreground": "#FFFFFF",
        "--sidebar-primary": "#3B82F6",
        "--sidebar-primary-foreground": "#FFFFFF",
        "--sidebar-accent": "#172554",
        "--sidebar-accent-foreground": "#FFFFFF",
        "--sidebar-border": "#1E3A8A",
        "--sidebar-ring": "#3B82F6",
      } as React.CSSProperties}
      className="border-r-0"
      {...props}
    >
      <SidebarHeader className="mb-4 pt-6 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-4 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-[#1E3A8A]">
                <Logo className="h-7 w-7" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-lg tracking-wide text-white">Sahabat Sehat</span>
                <span className="truncate text-xs text-blue-200 font-medium">Admin</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu className="px-4 gap-2">
          {navMain.map((item) => {
            // 3. Logika Aktif Dinamis
            // Menggunakan 'startsWith' agar sub-halaman (misal: /admin/indikator/tambah) 
            // tetap membuat menu induknya ("Indikator") menyala.
            const isActive = location.pathname.startsWith(item.url)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  size="lg"
                  className="
                    text-sidebar-foreground 
                    hover:bg-[var(--sidebar-accent)] 
                    data-[active=true]:bg-[var(--sidebar-primary)] 
                    data-[active=true]:font-semibold 
                    transition-all duration-200 
                    rounded-lg
                  "
                >
                  <a href={item.url} className="flex gap-3 items-center">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}