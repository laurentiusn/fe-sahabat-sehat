import { useEffect, useState } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import api from "@/lib/axios"
import { toast } from "sonner"
import { PasienSidebar } from "@/components/pasien-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  NotebookIcon,
  Utensils, 
  Cookie, 
  Activity, 
  UserCircle, 
  LogOut, 
  Calendar as CalendarIcon,
  Plus,
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
interface MakananItem {
  id: string
  nama: string
}

interface AktivitasItem {
  id: string
  nama: string
  durasi: string
}

interface LogHarian {
  id_log_harian: string
  tanggal: string
  makanan_utama: MakananItem[]
  makanan_selingan: MakananItem[]
  aktivitas_fisik: AktivitasItem[]
}

interface StatistikBulanan {
  bulan: string
  total: string
}

interface CatatanHarianData {
  statistik_bulanan: StatistikBulanan[]
  riwayat_harian: LogHarian[]
}

export default function CatatanHarian() {
  const navigate = useNavigate()
  const namaUser = localStorage.getItem("user_nama") || "Pasien"
  const [data, setData] = useState<CatatanHarianData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  // State Form
  const [makananUtama, setMakananUtama] = useState("")
  const [makananSelingan, setMakananSelingan] = useState("")
  const [aktivitas, setAktivitas] = useState({ nama: "", durasi: "" })

  const todayDate = format(new Date(), "yyyy-MM-dd")

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const response = await api.get("/catatan-harian")
      setData(response.data.data)
    } catch (error) {
      console.error("Gagal ambil data", error)
      toast.error("Gagal memuat catatan harian")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- HANDLERS SUBMIT ---
  const handleAddMakanan = async (type: "utama" | "selingan") => {
    const nama = type === "utama" ? makananUtama : makananSelingan
    if (!nama) return toast.error("Nama makanan tidak boleh kosong")

    setLoadingSubmit(true)
    try {
      await api.post("/catatan-harian/makanan", {
        nama_makanan: nama,
        type: type,
        tanggal: todayDate
      })
      toast.success(`Berhasil menambah makanan ${type}`)
      if (type === "utama") setMakananUtama("")
      else setMakananSelingan("")
      fetchData() 
    } catch (error: any) {
      console.error("Error tambah makanan:", error)
      const msg = error.response?.data?.message || "Gagal menyimpan data"
      toast.error(msg)
    } finally {
      setLoadingSubmit(false)
    }
  }

  const handleAddAktivitas = async () => {
    if (!aktivitas.nama || !aktivitas.durasi) return toast.error("Lengkapi data aktivitas")

    setLoadingSubmit(true)
    try {
      await api.post("/catatan-harian/aktivitas", {
        nama_aktivitas: aktivitas.nama,
        durasi: parseInt(aktivitas.durasi),
        tanggal: todayDate
      })
      toast.success("Berhasil menambah aktivitas")
      setAktivitas({ nama: "", durasi: "" })
      fetchData()
    } catch (error: any) {
      console.error("Error tambah aktivitas:", error)
      const msg = error.response?.data?.message || "Gagal menyimpan aktivitas"
      toast.error(msg)
    } finally {
      setLoadingSubmit(false)
    }
  }

  const handleLogout = async () => {
    try { await api.post("/logout") } catch (e) { console.error(e) }
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  const currentMonthName = format(new Date(), "MMMM yyyy", { locale: localeId })
  const displayStat = data?.statistik_bulanan?.[0] || { 
    bulan: currentMonthName, 
    total: "0 menit" 
  }

  return (
    <SidebarProvider>
      <PasienSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <NotebookIcon className="h-5 w-5 text-orange-500" />
              Catatan Harian
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

        <div className="flex flex-1 flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
          
          <div className="grid gap-6 md:grid-cols-3">
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                  <Utensils className="h-5 w-5" /> Makanan Utama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Makanan Utama</Label>
                  <Input 
                    placeholder="Contoh: Nasi Goreng" 
                    value={makananUtama}
                    onChange={(e) => setMakananUtama(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleAddMakanan("utama")} 
                  disabled={loadingSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loadingSubmit ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Tambah</>}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                  <Cookie className="h-5 w-5" /> Makanan Selingan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Makanan Selingan</Label>
                  <Input 
                    placeholder="Contoh: Pisang Rebus" 
                    value={makananSelingan}
                    onChange={(e) => setMakananSelingan(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleAddMakanan("selingan")} 
                  disabled={loadingSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loadingSubmit ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Tambah</>}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Aktivitas Fisik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Aktivitas</Label>
                  <Input 
                    placeholder="Contoh: Jogging" 
                    value={aktivitas.nama}
                    onChange={(e) => setAktivitas({ ...aktivitas, nama: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Durasi (menit)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="30" 
                      value={aktivitas.durasi}
                      onChange={(e) => setAktivitas({ ...aktivitas, durasi: e.target.value })}
                    />
                    <span className="text-sm text-slate-500">Menit</span>
                  </div>
                </div>
                <Button 
                  onClick={handleAddAktivitas} 
                  disabled={loadingSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loadingSubmit ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Tambah</>}
                </Button>
              </CardContent>
            </Card>

          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <CalendarIcon className="h-5 w-5" />
                <CardTitle className="text-base">Riwayat Catatan Harian</CardTitle>
              </div>
              <div className="text-sm font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                {displayStat.bulan}: {displayStat.total}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 w-[150px]">Tanggal</TableHead>
                    <TableHead className="w-[30%]">Makanan Utama</TableHead>
                    <TableHead className="w-[30%]">Makanan Selingan</TableHead>
                    <TableHead>Aktivitas Fisik</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8">Memuat data...</TableCell></TableRow>
                  ) : data?.riwayat_harian.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada catatan.</TableCell></TableRow>
                  ) : (
                    data?.riwayat_harian.map((item) => (
                      <TableRow key={item.id_log_harian} className="hover:bg-slate-50 align-top">
                        <TableCell className="pl-6 font-medium text-slate-700 py-4">
                          {item.tanggal}
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <ul className="list-disc pl-4 space-y-1 text-slate-600">
                            {item.makanan_utama.length > 0 ? (
                              item.makanan_utama.map((m) => (
                                <li key={m.id}>{m.nama}</li>
                              ))
                            ) : <span className="text-slate-400 text-sm italic">-</span>}
                          </ul>
                        </TableCell>

                        <TableCell className="py-4">
                          <ul className="list-disc pl-4 space-y-1 text-slate-600">
                            {item.makanan_selingan.length > 0 ? (
                              item.makanan_selingan.map((m) => (
                                <li key={m.id}>{m.nama}</li>
                              ))
                            ) : <span className="text-slate-400 text-sm italic">-</span>}
                          </ul>
                        </TableCell>

                        {/* --- PERBAIKAN JARAK ADA DI SINI --- */}
                        <TableCell className="py-4 pr-6">
                          <ul className="space-y-2 text-slate-600">
                            {item.aktivitas_fisik.length > 0 ? (
                              item.aktivitas_fisik.map((a) => (
                                <li key={a.id} className="flex items-center justify-between text-sm border-b border-dashed border-slate-200 pb-1 last:border-0">
                                  <span className="truncate pr-4">{a.nama}</span>
                                  <span className="font-semibold text-blue-600 whitespace-nowrap">{a.durasi}</span>
                                </li>
                              ))
                            ) : <span className="text-slate-400 text-sm italic">-</span>}
                          </ul>
                        </TableCell>
                        
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}