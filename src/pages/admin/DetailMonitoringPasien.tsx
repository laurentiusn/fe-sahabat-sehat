import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Activity, Droplets, Scale, Loader2, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// --- TIPE DATA ---
interface HistoryItem {
  id: string
  tanggal: string
  status: string
  // Field dinamis sesuai tipe
  sistolik?: number
  diastolik?: number
  gula_darah?: string
  tinggi_badan?: string
  massa_badan?: string
  imt?: string
}

export default function DetailMonitoringPasien() {
  const { id, type } = useParams()
  const navigate = useNavigate()
  
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pasienName, setPasienName] = useState("Pasien")

  // --- KONFIGURASI TAMPILAN BERDASARKAN TIPE URL ---
  const config = {
    td: {
      title: "Riwayat Tekanan Darah",
      endpoint: `/monitor-td/${id}`,
      icon: Activity,
      color: "text-blue-600",
      bgIcon: "bg-blue-50 border-blue-100",
      columns: ["Sistolik", "Diastolik", "Tekanan Darah"]
    },
    gd: {
      title: "Riwayat Gula Darah",
      endpoint: `/monitor-gd/${id}`,
      icon: Droplets,
      color: "text-pink-600",
      bgIcon: "bg-pink-50 border-pink-100",
      columns: ["Gula Darah (mg/dL)"]
    },
    imt: {
      title: "Riwayat Indeks Massa Tubuh",
      endpoint: `/monitor-imt/${id}`,
      icon: Scale,
      color: "text-orange-600",
      bgIcon: "bg-orange-50 border-orange-100",
      columns: ["Tinggi (cm)", "Berat (kg)", "IMT"]
    }
  }

  const currentConfig = config[type as keyof typeof config]

  // --- FETCH DATA ---
  useEffect(() => {
    if (!currentConfig) return;

    const fetchData = async () => {
      setLoading(true)
      try {
        const resPasien = await api.get(`/pasien/${id}`)
        setPasienName(resPasien.data.data.profil.nama_lengkap)

        const resHistory = await api.get(currentConfig.endpoint)
        const d = resHistory.data.data
        
        if (type === 'td') setHistory(d.historyTd || [])
        else if (type === 'gd') setHistory(d.historyGd || [])
        else if (type === 'imt') setHistory(d.historyImt || [])

      } catch (error) {
        console.error("Gagal load history:", error)
        toast.error("Gagal memuat riwayat monitoring")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, type])

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || ""
    if (s.includes("normal") || s.includes("normoweight")) return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
    if (s.includes("waspada") || s.includes("pre") || s.includes("over")) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
    return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
  }

  if (!currentConfig) return <div className="p-10 text-center">Tipe monitoring tidak valid.</div>

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        {/* HEADER */}
        <header className="flex h-16 items-center gap-3 border-b bg-white px-6 sticky top-0 z-10 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{pasienName}</h1>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <currentConfig.icon className="h-3 w-3" /> {currentConfig.title}
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
          
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b py-4 px-6 flex flex-row items-center gap-3">
               <div className={`p-2 rounded-lg border shadow-sm ${currentConfig.bgIcon}`}>
                  <currentConfig.icon className={`h-5 w-5 ${currentConfig.color}`} />
               </div>
               <CardTitle className="text-base text-slate-800 font-semibold">
                 {currentConfig.title}
               </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b">
                      <TableHead className="pl-6 h-10 w-[200px] font-semibold text-slate-700">Tanggal & Waktu</TableHead>
                      {currentConfig.columns.map((col) => (
                        <TableHead key={col} className="h-10 font-semibold text-slate-700">{col}</TableHead>
                      ))}
                      <TableHead className="h-10 pr-6 text-right font-semibold text-slate-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center h-full gap-2">
                            <Loader2 className="h-6 w-6 animate-spin"/>
                            <span>Memuat data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : history.length === 0 ? (
                      <TableRow>
                        {/* --- PERBAIKAN DI SINI --- */}
                        <TableCell colSpan={6} className="h-64">
                           <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-muted-foreground">
                              <div className="p-3 bg-slate-100 rounded-full">
                                <Calendar className="h-8 w-8 text-slate-400" />
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-slate-600">Belum ada riwayat</div>
                                <div className="text-xs text-slate-400">Pasien belum melakukan monitoring ini.</div>
                              </div>
                           </div>
                        </TableCell>
                        {/* ------------------------- */}
                      </TableRow>
                    ) : (
                      history.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 border-b last:border-0">
                          <TableCell className="pl-6 py-4 font-medium text-slate-600">
                            {format(new Date(item.tanggal), "dd MMMM yyyy", { locale: localeId })}
                            <div className="text-xs text-slate-400 font-normal mt-0.5">
                              Pukul {format(new Date(item.tanggal), "HH:mm")} WIB
                            </div>
                          </TableCell>
                          
                          {type === 'td' && (
                            <>
                              <TableCell className="py-4 text-slate-600">{item.sistolik}</TableCell>
                              <TableCell className="py-4 text-slate-600">{item.diastolik}</TableCell>
                              <TableCell className="py-4 font-bold text-slate-800">{item.sistolik}/{item.diastolik} mmHg</TableCell>
                            </>
                          )}
                          
                          {type === 'gd' && (
                            <TableCell className="py-4 font-bold text-slate-800">{item.gula_darah}</TableCell>
                          )}
                          
                          {type === 'imt' && (
                            <>
                              <TableCell className="py-4 text-slate-600">{item.tinggi_badan}</TableCell>
                              <TableCell className="py-4 text-slate-600">{item.massa_badan}</TableCell>
                              <TableCell className="py-4 font-bold text-slate-800">{item.imt}</TableCell>
                            </>
                          )}

                          <TableCell className="py-4 pr-6 text-right">
                            <Badge className={`${getStatusColor(item.status)} border px-3 py-1 shadow-sm`}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}