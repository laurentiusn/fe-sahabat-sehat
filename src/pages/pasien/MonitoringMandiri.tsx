import { useEffect, useState } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import api from "@/lib/axios"
import { toast } from "sonner"
import { PasienSidebar } from "@/components/pasien-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ActivityIcon, 
  DropletsIcon, 
  ScaleIcon, 
  UserCircle, 
  LogOut, 
  ArrowLeft,
  Loader2
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
type ViewType = 'menu' | 'td' | 'gd' | 'imt'

interface HistoryItem {
  id: string
  tanggal: string
  status: string
  // Field dinamis
  sistolik?: number
  diastolik?: number
  gula_darah?: string
  tinggi_badan?: string
  massa_badan?: string
  imt?: string
}

interface MonitorData {
  latest: HistoryItem | null
  history: HistoryItem[]
}

export default function MonitoringMandiri() {
  const navigate = useNavigate()
  const namaUser = localStorage.getItem("user_nama") || "Pasien"
  const [view, setView] = useState<ViewType>('menu') // State untuk navigasi internal
  
  // State Data
  const [data, setData] = useState<MonitorData>({ latest: null, history: [] })
  const [loading, setLoading] = useState(false)
  
  // State Form Input
  const [formData, setFormData] = useState({
    sistolik: "",
    diastolik: "",
    gula_darah: "",
    tinggi_badan: "",
    massa_badan: ""
  })

  // --- FETCH DATA ---
  const fetchData = async (type: ViewType) => {
    if (type === 'menu') return
    
    setLoading(true)
    try {
      let endpoint = ""
      if (type === 'td') endpoint = "/monitor-td"
      else if (type === 'gd') endpoint = "/monitor-gd"
      else if (type === 'imt') endpoint = "/monitor-imt"

      const res = await api.get(endpoint)
      const d = res.data.data

      // Normalisasi Data agar seragam strukturnya
      if (type === 'td') {
        setData({ latest: d.latestMonitorTd, history: d.historyTd })
      } else if (type === 'gd') {
        setData({ latest: d.latestMonitorGd, history: d.historyGd })
      } else if (type === 'imt') {
        setData({ latest: d.latestMonitorImt, history: d.historyImt })
      }
    } catch (error) {
      console.error("Gagal ambil data", error)
      toast.error("Gagal memuat data monitoring")
    } finally {
      setLoading(false)
    }
  }

  // Effect saat view berubah
  useEffect(() => {
    if (view !== 'menu') {
      fetchData(view)
      setFormData({ sistolik: "", diastolik: "", gula_darah: "", tinggi_badan: "", massa_badan: "" }) // Reset form
    }
  }, [view])

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let endpoint = ""
      let payload = {}

      if (view === 'td') {
        endpoint = "/monitor-td"
        payload = { sistolik: formData.sistolik, diastolik: formData.diastolik }
      } else if (view === 'gd') {
        endpoint = "/monitor-gd"
        payload = { gula_darah: formData.gula_darah }
      } else if (view === 'imt') {
        endpoint = "/monitor-imt"
        payload = { tinggi_badan: formData.tinggi_badan, massa_badan: formData.massa_badan }
      }

      await api.post(endpoint, payload)
      toast.success("Data berhasil disimpan!")
      fetchData(view) // Refresh data
    } catch (error) {
      console.error("Gagal simpan", error)
      toast.error("Gagal menyimpan data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await api.post("/logout") } catch (e) { console.error(e) }
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  // Helper Warna Status (Updated)
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || ""
    
    // KONDISI HIJAU (Baik/Normal/Ideal)
    if (
      s.includes("normal") || 
      s.includes("normoweight") || // <--- Tambahkan ini
      s.includes("ideal")
    ) {
      return "bg-green-600 hover:bg-green-700"
    }

    // KONDISI KUNING (Peringatan/Sedang)
    if (
      s.includes("waspada") || 
      s.includes("pre") || 
      s.includes("overweight") || // <--- Tambahkan ini
      s.includes("berisiko")
    ) {
      return "bg-yellow-500 hover:bg-yellow-600"
    }

    // KONDISI MERAH (Bahaya/Buruk)
    // Mencakup: Tinggi, Bahaya, Obesity, Underweight, Stadium 1/2/3
    return "bg-red-600 hover:bg-red-700"
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
            
            {/* Navigasi Judul */}
            {view === 'menu' ? (
              <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ActivityIcon className="h-5 w-5" />
                Monitoring Mandiri
              </h1>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <Button variant="ghost" size="icon" onClick={() => setView('menu')} className="-ml-2 h-8 w-8 rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-bold text-slate-800">
                  {view === 'td' && "Tekanan Darah"}
                  {view === 'gd' && "Gula Darah"}
                  {view === 'imt' && "Indeks Massa Tubuh"}
                </h1>
              </div>
            )}
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

        {/* KONTEN */}
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto w-full">
          
          {/* VIEW: MENU UTAMA */}
          {view === 'menu' && (
            <div className="grid gap-6 md:grid-cols-3 pt-4">
              <MenuCard 
                title="Tekanan Darah" 
                icon={ActivityIcon} 
                iconColor="text-blue-600" 
                onClick={() => setView('td')} 
              />
              <MenuCard 
                title="Gula Darah" 
                icon={DropletsIcon} 
                iconColor="text-blue-600" 
                onClick={() => setView('gd')} 
              />
              <MenuCard 
                title="Indeks Massa Tubuh" 
                icon={ScaleIcon} 
                iconColor="text-blue-600" 
                onClick={() => setView('imt')} 
              />
            </div>
          )}

          {/* VIEW: DETAIL (TD, GD, IMT) */}
          {view !== 'menu' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              
              {/* 1. CARD HASIL TERAKHIR */}
              <Card className="border-0 shadow-sm w-full md:w-1/2">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    {view === 'td' && <ActivityIcon className="h-5 w-5 text-blue-600" />}
                    {view === 'gd' && <DropletsIcon className="h-5 w-5 text-blue-600" />}
                    {view === 'imt' && <ScaleIcon className="h-5 w-5 text-blue-600" />}
                    <h3 className="font-medium text-sm">
                      {view === 'td' && "Tekanan Darah"}
                      {view === 'gd' && "Gula Darah"}
                      {view === 'imt' && "Indeks Massa Tubuh"}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading && !data.latest ? (
                    <div className="h-12 flex items-center text-slate-400">Memuat data...</div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900">
                          {view === 'td' ? `${data.latest?.sistolik || '--'}/${data.latest?.diastolik || '--'}` : 
                           view === 'gd' ? `${data.latest?.gula_darah || '--'}` :
                           `${data.latest?.imt || '--'}`}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {view === 'td' ? 'mmHg' : view === 'gd' ? 'mg/dl' : 'kg/m²'}
                        </span>
                      </div>
                      {data.latest?.status && (
                        <Badge className={`${getStatusColor(data.latest.status)} border-0 px-3 py-1 text-xs`}>
                          {data.latest.status}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. FORM INPUT */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50 pb-4">
                  <CardTitle className="text-base text-blue-700">
                    Hitung {view === 'td' ? 'Tekanan Darah' : view === 'gd' ? 'Gula Darah' : 'Indeks Massa Tubuh'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {view === 'td' && (
                        <>
                          <div className="grid gap-2">
                            <Label>Sistolik</Label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              value={formData.sistolik}
                              onChange={e => setFormData({...formData, sistolik: e.target.value})}
                              required 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Diastolik</Label>
                            <Input 
                              type="number"
                              placeholder="0" 
                              value={formData.diastolik}
                              onChange={e => setFormData({...formData, diastolik: e.target.value})}
                              required 
                            />
                          </div>
                        </>
                      )}
                      {view === 'gd' && (
                        <div className="grid gap-2 md:col-span-2">
                          <Label>Gula Darah (mg/dl)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            value={formData.gula_darah}
                            onChange={e => setFormData({...formData, gula_darah: e.target.value})}
                            required 
                          />
                        </div>
                      )}
                      {view === 'imt' && (
                        <>
                          <div className="grid gap-2">
                            <Label>Tinggi Badan (cm)</Label>
                            <Input 
                              type="number" 
                              placeholder="0.00"
                              step="0.01" 
                              value={formData.tinggi_badan}
                              onChange={e => setFormData({...formData, tinggi_badan: e.target.value})}
                              required 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Berat Badan (kg)</Label>
                            <Input 
                              type="number" 
                              placeholder="0.00"
                              step="0.01" 
                              value={formData.massa_badan}
                              onChange={e => setFormData({...formData, massa_badan: e.target.value})}
                              required 
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perhitungan"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* 3. TABEL RIWAYAT */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <CardTitle className="text-base">
                      Riwayat Monitoring {view === 'td' ? 'Tekanan Darah' : view === 'gd' ? 'Gula Darah' : 'IMT'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 w-[180px]">Tanggal</TableHead>
                        {view === 'td' && <><TableHead>Sistolik</TableHead><TableHead>Diastolik</TableHead><TableHead>Tekanan Darah</TableHead></>}
                        {view === 'gd' && <TableHead>Gula Darah (mg/dl)</TableHead>}
                        {view === 'imt' && <><TableHead>Tinggi (cm)</TableHead><TableHead>Berat (kg)</TableHead><TableHead>IMT</TableHead></>}
                        <TableHead className="text-right pr-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.history.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada riwayat data.</TableCell></TableRow>
                      ) : (
                        data.history.map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50">
                            <TableCell className="pl-6 text-slate-600">
                              {format(new Date(item.tanggal), "dd - MM - yyyy", { locale: localeId })}
                            </TableCell>
                            
                            {view === 'td' && (
                              <>
                                <TableCell>{item.sistolik}</TableCell>
                                <TableCell>{item.diastolik}</TableCell>
                                <TableCell className="font-medium">{item.sistolik}/{item.diastolik}</TableCell>
                              </>
                            )}
                            
                            {view === 'gd' && <TableCell className="font-medium">{item.gula_darah}</TableCell>}
                            
                            {view === 'imt' && (
                              <>
                                <TableCell>{item.tinggi_badan}</TableCell>
                                <TableCell>{item.massa_badan}</TableCell>
                                <TableCell className="font-medium">{item.imt}</TableCell>
                              </>
                            )}

                            <TableCell className="text-right pr-6">
                              <Badge className={`${getStatusColor(item.status)} border-0`}>{item.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          )}

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Komponen Menu Card (Kotak Putih Besar di Halaman Depan)
function MenuCard({ title, icon: Icon, iconColor, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center gap-6 group"
    >
      <div className={`p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
        {title}
      </h3>
    </div>
  )
}