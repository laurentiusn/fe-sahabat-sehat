import { useEffect, useState } from "react"
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
import { IconActivity, IconDroplet, IconScale } from "@tabler/icons-react"

// Interface untuk Tipe Data Response API
interface DashboardData {
  user: string
  nama: string
  nilaiTd: string | null
  statusTd: string
  nilaiGd: string | null
  statusGd: string
  nilaiImt: string | null
  statusImt: string
  indikator: Array<{
    id: string
    type: 'td' | 'gd' | 'imt'
    status: string
    range: any
    color_hex: string
  }>
}

export default function DashboardPasien() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Loading State Sederhana
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-muted-foreground animate-pulse">Memuat Data Dashboard...</div>
      </div>
    )
  }

  // Mapping Data untuk Card Monitoring
  const monitoringItems = [
    {
      title: "Tekanan Darah",
      value: data?.nilaiTd || "-",
      unit: "", // Unit sudah digabung di backend
      status: data?.statusTd,
      icon: IconActivity,
      color: "text-blue-500",
    },
    {
      title: "Gula Darah",
      value: data?.nilaiGd || "-",
      unit: "",
      status: data?.statusGd,
      icon: IconDroplet,
      color: "text-red-500",
    },
    {
      title: "Indeks Massa Tubuh",
      value: data?.nilaiImt || "-",
      unit: "",
      status: data?.statusImt,
      icon: IconScale,
      color: "text-orange-500",
    },
  ]

  return (
    <SidebarProvider>
      <PasienSidebar />
      <SidebarInset>
        {/* Header Dashboard */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-base font-semibold">Dashboard Pasien</h1>
          </div>
          <div className="ml-auto text-sm font-medium text-slate-600">
            Halo, {data?.nama}
          </div>
        </header>
        
        {/* Konten Utama */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50">
          
          {/* BAGIAN 1: MONITORING TERAKHIR */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-800">Monitoring Terakhir</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {monitoringItems.map((item, index) => (
                <Card key={index} className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </CardTitle>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {item.value}
                    </div>
                    <div className="mt-3">
                        <StatusBadge status={item.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* BAGIAN 2: INDIKATOR KESEHATAN (REFERENSI) */}
          <section>
             <h2 className="text-lg font-bold mb-4 text-slate-800">Indikator Kesehatan (Referensi)</h2>
             <div className="grid gap-4 md:grid-cols-3">
                {/* Card Indikator TD */}
                <IndikatorList title="Tekanan Darah" type="td" items={data?.indikator} />
                {/* Card Indikator GD */}
                <IndikatorList title="Gula Darah" type="gd" items={data?.indikator} />
                {/* Card Indikator IMT */}
                <IndikatorList title="Indeks Massa Tubuh" type="imt" items={data?.indikator} />
             </div>
          </section>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// --- KOMPONEN KECIL (HELPER) ---

// 1. Badge Status Warna-Warni
function StatusBadge({ status }: { status?: string }) {
    if (!status || status === 'Belum ada data') {
        return <Badge variant="outline" className="text-slate-500 border-slate-300">Belum ada data</Badge>
    }
    
    let colorClass = "bg-slate-500 hover:bg-slate-600"
    const lower = status.toLowerCase()

    if (lower.includes('normal') || lower.includes('normoweight')) {
        colorClass = "bg-emerald-500 hover:bg-emerald-600"
    } else if (lower.includes('waspada') || lower.includes('pre') || lower.includes('overweight')) {
        colorClass = "bg-amber-500 hover:bg-amber-600"
    } else if (lower.includes('tinggi') || lower.includes('stadium') || lower.includes('obesity') || lower.includes('underweight')) {
        colorClass = "bg-rose-500 hover:bg-rose-600"
    }

    return <Badge className={`${colorClass} text-white border-0 px-3 py-0.5`}>{status}</Badge>
}

// 2. List Indikator dalam Card
function IndikatorList({ title, type, items }: { title: string, type: string, items?: any[] }) {
    const filtered = items?.filter(i => i.type === type) || []
    
    return (
        <Card className="shadow-sm h-full">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {type === 'td' && <IconActivity className="h-4 w-4 text-blue-500" />}
                    {type === 'gd' && <IconDroplet className="h-4 w-4 text-red-500" />}
                    {type === 'imt' && <IconScale className="h-4 w-4 text-orange-500" />}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {filtered.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                {/* Dot Warna */}
                                <div 
                                    className="w-2.5 h-2.5 rounded-full" 
                                    style={{ backgroundColor: item.color_hex }}
                                />
                                <span className="font-medium text-slate-700">
                                    {item.status}
                                </span>
                            </div>
                            <span className="text-muted-foreground text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                               {formatRange(type, item.range)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// 3. Formatter Range JSON ke String Readable
function formatRange(type: string, range: any) {
    if (type === 'td') {
        const sys = range.sys_max ? `${range.sys_min || 0}-${range.sys_max}` : `≥ ${range.sys_min}`;
        const dia = range.dia_max ? `${range.dia_min || 0}-${range.dia_max}` : `≥ ${range.dia_min}`;
        // Jika format stage 2 (>=), simplekan
        if (!range.sys_max) return `Sys ≥ ${range.sys_min} / Dia ≥ ${range.dia_min}`
        return `${sys} / ${dia}`
    } else {
        // GD & IMT
        if (range.min !== null && range.max !== null) return `${range.min} - ${range.max}`
        if (range.min !== null) return `≥ ${range.min}`
        if (range.max !== null) return `< ${range.max}`
    }
    return '-'
}