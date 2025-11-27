import * as React from "react"
import {
  IconDashboard,
  IconPill,
  IconActivity,
  IconNotebook,
  IconHeartHandshake,
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

// Data Menu Pasien
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard-pasien",
    icon: IconDashboard,
    isActive: true, // Menu ini akan menyala otomatis
  },
  {
    title: "List Obat",
    url: "/obat-hari-ini",
    icon: IconPill,
  },
  {
    title: "Monitoring Mandiri",
    url: "/monitor-td",
    icon: IconActivity,
  },
  {
    title: "Catatan Harian",
    url: "/catatan-harian",
    icon: IconNotebook,
  },
  {
    title: "Tips Hidup Sehat",
    url: "/tips-hidup",
    icon: IconHeartHandshake,
  },
]

export function PasienSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      // --- BAGIAN INI YANG MENGUBAH WARNA SIDEBAR ---
      style={{
        "--sidebar": "#1E3A8A",                 // FIXED: Gunakan '--sidebar', bukan '--sidebar-background'
        "--sidebar-foreground": "#FFFFFF",      // Warna Teks Utama
        "--sidebar-primary": "#3B82F6",         // Warna Menu Aktif (Biru Terang)
        "--sidebar-primary-foreground": "#FFFFFF",
        "--sidebar-accent": "#172554",          // Warna Hover (Biru Sangat Gelap)
        "--sidebar-accent-foreground": "#FFFFFF",
        "--sidebar-border": "#1E3A8A",          // Border kanan
        "--sidebar-ring": "#3B82F6",
      } as React.CSSProperties}
      // --------------------------------------------
      className="border-r-0" // Hapus garis batas kanan agar mulus
      {...props}
    >
      <SidebarHeader className="mb-4 pt-6 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 transition-all">
              {/* Logo Circle Putih agar kontras */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-[#1E3A8A]">
                <Logo className="h-7 w-7" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-lg tracking-wide text-white">
                  Sahabat Sehat
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu className="px-4 gap-2">
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                tooltip={item.title}
                size="lg" // Ukuran tombol sedikit lebih besar agar lega
                className="
                  text-sidebar-foreground
                  transition-all duration-200 ease-in-out
                  hover:bg-[var(--sidebar-accent)] 
                  data-[active=true]:bg-[var(--sidebar-primary)] 
                  data-[active=true]:font-semibold 
                  data-[active=true]:shadow-md
                "
              >
                <a href={item.url} className="flex gap-3 items-center">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}