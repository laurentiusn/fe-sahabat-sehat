import * as React from "react"
import {
  IconDashboard,
  IconPill,
  IconActivity,
  IconNotebook,
  IconHeartHandshake,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Data Menu Pasien
const data = {
  user: {
    name: localStorage.getItem('user_nama') || "Pasien",
    email: "user@prolanis.com",
    avatar: "", // Bisa dikosongkan atau kasih placeholder
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard-pasien",
      icon: IconDashboard,
    },
    {
      title: "List Obat",
      url: "/obat-hari-ini", // Sesuaikan dengan route di App.tsx
      icon: IconPill,
    },
    {
      title: "Monitoring Mandiri",
      url: "/monitor-td", // Sesuaikan
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
  ],
}

export function PasienSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <IconActivity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Prolanis App</span>
                  <span className="truncate text-xs">Pasien Panel</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}