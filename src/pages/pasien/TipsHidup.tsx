import { useEffect, useState } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import api from "@/lib/axios"
import { PasienSidebar } from "@/components/pasien-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  HeartHandshake, 
  Activity, 
  Droplets, 
  Scale, 
  UserCircle, 
  LogOut, 
  Calendar,
  ArrowRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"

// --- TIPE DATA ---
interface TipsImage {
  id: string
  url: string
}

interface TipsContent {
  id: string
  konten: string
  gambar_tips: TipsImage[]
}

interface IndicatorData {
  status_terakhir: string
  nilai_terakhir: string | null
  tanggal_cek: string | null
  tips: TipsContent | [] | null 
}

interface TipsResponse {
  td: IndicatorData
  gd: IndicatorData
  imt: IndicatorData
}

export default function TipsHidupSehat() {
  const navigate = useNavigate()
  const [data, setData] = useState<TipsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const namaUser = localStorage.getItem("user_nama") || "Pasien"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/tips-hidup")
        setData(response.data.data)
      } catch (error) {
        console.error("Gagal memuat tips:", error)
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
          <HeartHandshake className="h-10 w-10 animate-pulse text-blue-600" />
          <span className="text-sm text-slate-500">Menyiapkan tips kesehatan...</span>
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
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-pink-600" />
              Tips Hidup Sehat
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors outline-none cursor-pointer">
                  <span className="text-sm font-medium text-slate-600 hidden md:block">{namaUser}</span>
                  <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                    <UserCircle className="h-6 w-6"/>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto w-full">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">Rekomendasi Kesehatan</h2>
            <p className="text-slate-500">Saran yang disesuaikan dengan kondisi pemantauan terakhir Anda.</p>
          </div>

          <div className="grid gap-6">
            
            <TipsCard 
              title="Tekanan Darah"
              icon={Activity}
              iconColor="text-blue-600"
              data={data?.td}
              linkTo="/monitoring-mandiri"
            />

            <TipsCard 
              title="Gula Darah"
              icon={Droplets}
              iconColor="text-pink-600"
              data={data?.gd}
              linkTo="/monitoring-mandiri"
            />

            <TipsCard 
              title="Indeks Massa Tubuh"
              icon={Scale}
              iconColor="text-orange-600"
              data={data?.imt}
              linkTo="/monitoring-mandiri"
            />

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// --- HELPER WARNA STATUS (Dipindah ke luar agar bisa dipakai TipsCard) ---
const getStatusColor = (status?: string) => {
  const s = status?.toLowerCase() || ""
  if (s.includes("normal") || s.includes("normoweight")) return "bg-green-100 text-green-700 hover:bg-green-100"
  if (s.includes("waspada") || s.includes("pre") || s.includes("over")) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
  if (s.includes("belum")) return "bg-slate-100 text-slate-600 hover:bg-slate-100"
  return "bg-red-100 text-red-700 hover:bg-red-100"
}

// --- SUB-KOMPONEN KARTU TIPS ---

function TipsCard({ title, icon: Icon, iconColor, data, linkTo }: any) {
  const navigate = useNavigate()
  
  const hasTips = data?.tips && !Array.isArray(data.tips)
  const tipsContent = hasTips ? (data.tips as TipsContent) : null
  const noData = !data?.nilai_terakhir

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white rounded-lg border shadow-sm`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
              {data?.tanggal_cek && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Update: {format(new Date(data.tanggal_cek), "dd MMM yyyy, HH:mm", { locale: localeId })}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
             {/* PENGGUNAAN getStatusColor DISINI */}
             <Badge className={`border-0 px-3 py-1 text-xs mb-1 ${getStatusColor(data?.status_terakhir)}`}>
                {data?.status_terakhir || "Belum ada data"}
             </Badge>
             <div className="font-bold text-slate-700 text-sm">
                {data?.nilai_terakhir || "-"}
             </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {noData ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="bg-slate-100 p-3 rounded-full">
              <Icon className="h-6 w-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 font-medium">Belum ada data pemantauan</p>
              <p className="text-slate-500 text-sm max-w-md">
                Lakukan monitoring mandiri terlebih dahulu agar kami dapat memberikan saran yang tepat untuk Anda.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate(linkTo)} className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
              Input Data Sekarang <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : hasTips ? (
          <div className="space-y-6">
            <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
              <p>{tipsContent?.konten}</p>
            </div>

            {tipsContent?.gambar_tips && tipsContent.gambar_tips.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {tipsContent.gambar_tips.map((img, idx) => (
                  <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border bg-slate-100 group">
                    <img 
                      src={img.url} 
                      alt={`Tips ${title} ${idx + 1}`} 
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400/e2e8f0/94a3b8?text=Gagal+Muat+Gambar"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg text-green-800">
            <HeartHandshake className="h-5 w-5" />
            <p className="text-sm">Kondisi Anda terpantau <b>Normal</b>. Pertahankan pola hidup sehat Anda!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}