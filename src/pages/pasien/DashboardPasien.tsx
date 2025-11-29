import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { PasienSidebar } from "@/components/pasien-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ActivityIcon, 
  DropletsIcon, 
  ScaleIcon, 
  UserCircle,
  LogOut,
  UserIcon 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- TIPE DATA ---
interface RangeTD { sys_min: number | null; sys_max: number | null; dia_min: number | null; dia_max: number | null; operator?: string; }
interface RangeStandard { min: number | null; max: number | null; }

interface IndikatorItem { 
  id: string; 
  type: 'td' | 'gd' | 'imt'; 
  status: string; 
  range: RangeTD | RangeStandard; // PERBAIKAN: Bukan string lagi, tapi Object
  color_hex: string; 
}

interface DashboardData { 
  user: string; 
  nama: string; 
  nilaiTd: string; 
  statusTd: string; 
  nilaiGd: string; 
  statusGd: string; 
  nilaiImt: string; 
  statusImt: string; 
  indikator: IndikatorItem[]; 
}

// --- HELPER FUNCTION ---
// PERBAIKAN: Menerima object range langsung, tidak perlu JSON.parse
const formatRange = (range: any, type: string): string => {
  try {
    if (!range) return "-"

    if (type === 'td') {
      const r = range as RangeTD
      if (r.sys_max && r.dia_max && !r.sys_min) return `< ${r.sys_max}/${r.dia_max} mmHg`
      if (r.sys_min && r.sys_max) {
        const diaPart = (r.dia_min && r.dia_max) ? ` / ${r.dia_min} - ${r.dia_max}` : ''
        return `${r.sys_min} - ${r.sys_max}${diaPart} mmHg`
      }
      if (r.sys_min && !r.sys_max) return `> ${r.sys_min}/${r.dia_min} mmHg`
      return "Range Khusus"
    } else {
      const r = range as RangeStandard
      const unit = type === 'imt' ? 'kg/m²' : 'mg/dl'
      if (r.min !== null && r.max !== null) return `${r.min} - ${r.max} ${unit}`
      if (r.min !== null) return `> ${r.min} ${unit}`
      if (r.max !== null) return `< ${r.max} ${unit}`
    }
    return "-"
  } catch (e) { return "-" }
}

export default function DashboardPasien() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const namaUser = localStorage.getItem("user_nama") || "Pasien"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/dashboard-pas")
        setData(response.data.data)
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    try { await api.post("/logout") } catch (e) { console.error(e) }
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <ActivityIcon className="h-8 w-8 animate-pulse text-blue-600" />
          <span className="text-sm text-slate-500">Memuat data kesehatan...</span>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <PasienSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>
          </div>
          
          {/* AREA PROFIL */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors outline-none cursor-pointer">
                  <span className="text-sm font-medium text-slate-600 hidden md:block">
                    {data?.nama || namaUser}
                  </span>
                  <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                    <UserCircle className="h-6 w-6"/>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")} 
                  className="cursor-pointer font-medium text-slate-700"
                >
                  <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Akun Saya</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* KONTEN DASHBOARD */}
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
          
          {/* Monitoring Terakhir */}
          <section>
            <h2 className="text-base font-bold text-slate-800 mb-4">Monitoring Terakhir</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <MonitoringCard 
                title="Tekanan Darah" 
                value={data?.nilaiTd} 
                unit="mmHg" 
                status={data?.statusTd} 
                icon={ActivityIcon} 
                iconColor="text-blue-600"
                type="td" 
                indikator={data?.indikator}
              />
              <MonitoringCard 
                title="Gula Darah" 
                value={data?.nilaiGd} 
                unit="mg/dl" 
                status={data?.statusGd} 
                icon={DropletsIcon} 
                iconColor="text-blue-600"
                type="gd" 
                indikator={data?.indikator}
              />
              <MonitoringCard 
                title="Indeks Massa Tubuh" 
                value={data?.nilaiImt} 
                unit="kg/m²" 
                status={data?.statusImt} 
                icon={ScaleIcon} 
                iconColor="text-blue-600"
                type="imt" 
                indikator={data?.indikator}
              />
            </div>
          </section>

          {/* Indikator */}
          <section>
            <h2 className="text-base font-bold text-slate-800 mb-4">Indikator</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <ReferenceList title="Tekanan Darah" icon={ActivityIcon} type="td" items={data?.indikator} />
              <ReferenceList title="Gula Darah" icon={DropletsIcon} type="gd" items={data?.indikator} />
              <ReferenceList title="Indeks Massa Tubuh" icon={ScaleIcon} type="imt" items={data?.indikator} />
            </div>
          </section>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// --- KOMPONEN CARD ---

function MonitoringCard({ title, value, unit, status, icon: Icon, iconColor, type, indikator }: any) {
  
  const matchedItem = indikator?.find((item: IndikatorItem) => 
    item.type === type && item.status.toLowerCase() === status?.toLowerCase()
  );

  const badgeStyle = matchedItem 
    ? { backgroundColor: matchedItem.color_hex, color: 'white', border: 'none' } 
    : { backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-md"><Icon className={`h-5 w-5 ${iconColor}`} /></div>
            <CardTitle className="text-sm font-semibold text-slate-700">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{value || "--"}</span>
                <span className="text-sm text-slate-500 font-medium">{unit}</span>
            </div>
            {status && status !== "Belum ada data" && (
              <Badge style={badgeStyle} className="px-3 py-1 rounded-md text-xs font-semibold shadow-none">
                  {status}
              </Badge>
            )}
        </div>
      </CardContent>
    </Card>
  )
}

function ReferenceList({ title, icon: Icon, type, items }: any) {
  const filteredItems = items?.filter((item: any) => item.type === type) || []
  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2"><Icon className="h-5 w-5 text-blue-600" /><CardTitle className="text-sm font-semibold text-slate-700">{title}</CardTitle></div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
            {filteredItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="px-3 py-1.5 rounded-md text-white text-xs font-medium min-w-[80px] text-center shadow-sm" style={{ backgroundColor: item.color_hex }}>{item.status}</div>
                    <div className="text-right text-slate-600 font-medium text-xs sm:text-sm">
                        {/* Panggil formatRange tanpa JSON.parse */}
                        {formatRange(item.range, item.type)}
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}