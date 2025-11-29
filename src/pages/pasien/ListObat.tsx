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
import { Checkbox } from "@/components/ui/checkbox"
import { 
  PillIcon, 
  UserCircle, 
  LogOut,
  Clock
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

// --- TIPE DATA ---
interface ObatDetail {
  id: string
  nama_obat: string
  dosis: string
  waktu: string // pagi/siang/sore/malam
  keterangan: string
}

interface JadwalObatItem {
  id: string
  id_obat: string
  jadwal_konsumsi: string
  status: "sudah" | "belum"
  waktu_aktual_konsumsi: string | null
  obat: ObatDetail
}

export default function ListObat() {
  const navigate = useNavigate()
  const [jadwal, setJadwal] = useState<JadwalObatItem[]>([])
  const [loading, setLoading] = useState(true)
  const namaUser = localStorage.getItem("user_nama") || "Pasien"

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get("/obat-hari-ini")
      setJadwal(response.data.data)
    } catch (error) {
      console.error("Gagal mengambil jadwal obat:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. Handle Checklist (Mark as Done)
  const handleCheck = async (id: string) => {
    // Optimistic Update: Langsung update UI biar cepat
    const oldJadwal = [...jadwal]
    
    setJadwal(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: "sudah" } // Pindahkan ke status sudah di UI sementara
      }
      return item
    }))

    try {
      // --- PERBAIKAN DI SINI ---
      // Menggunakan PUT sesuai error Laravel: "The POST method is not supported... Supported methods: PUT"
      // Dan mengirim body parameter status
      await api.put(`/checklist-obat/${id}`, {
        status: 'sudah'
      })
      
      toast.success("Obat berhasil diminum!")
      
      // Opsional: Refresh data dari server untuk memastikan sinkronisasi data aktual
      // fetchData() 
    } catch (error) {
      console.error("Gagal checklist:", error)
      toast.error("Gagal update status obat")
      setJadwal(oldJadwal) // Balikin data ke posisi awal kalau error
    }
  }

  // 3. Helper Warna Badge Waktu
  const getTimeBadgeColor = (waktu: string) => {
    switch (waktu.toLowerCase()) {
      case 'pagi': return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
      case 'siang': return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
      case 'sore': return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
      case 'malam': return "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200"
      default: return "bg-slate-100 text-slate-700"
    }
  }

  // Logout Function
  const handleLogout = async () => {
    try { await api.post("/logout") } catch (e) { console.error(e) }
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  // Filter Data
  const obatBelum = jadwal.filter(item => item.status === 'belum')
  const obatSudah = jadwal.filter(item => item.status === 'sudah')

  return (
    <SidebarProvider>
      <PasienSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-bold text-slate-800">List Obat</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors outline-none cursor-pointer">
                  <span className="text-sm font-medium text-slate-600 hidden md:block">
                    {namaUser}
                  </span>
                  <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                    <UserCircle className="h-6 w-6"/>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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

        {/* KONTEN UTAMA */}
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-8 max-w-5xl mx-auto w-full">
          
          {/* SECTION 1: OBAT HARI INI (BELUM) */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-bold text-slate-800">
                  Obat Hari Ini
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] pl-6">Waktu</TableHead>
                    <TableHead>Nama Obat</TableHead>
                    <TableHead>Dosis</TableHead>
                    <TableHead className="text-center w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8">Memuat...</TableCell></TableRow>
                  ) : obatBelum.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak Ada Obat</TableCell></TableRow>
                  ) : (
                    obatBelum.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="pl-6">
                          <Badge className={`${getTimeBadgeColor(item.obat.waktu)} border-0 capitalize shadow-none`}>
                            {item.obat.waktu}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {item.obat.nama_obat}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {item.obat.dosis}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            className="h-6 w-6 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 cursor-pointer mx-auto"
                            onCheckedChange={() => handleCheck(item.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SECTION 2: RIWAYAT HARI INI (SUDAH) */}
          {obatSudah.length > 0 && (
            <Card className="border-0 shadow-sm opacity-80">
              <CardHeader className="pb-4 border-b bg-slate-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <PillIcon className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base font-bold text-slate-800">
                    Riwayat Obat Hari Ini
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {obatSudah.map((item) => (
                      <TableRow key={item.id} className="bg-slate-50/50">
                        <TableCell className="w-[100px] pl-6">
                          <Badge variant="outline" className="text-slate-500 border-slate-300 capitalize shadow-none">
                            {item.obat.waktu}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-500 line-through decoration-slate-400">
                          {item.obat.nama_obat}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {item.obat.dosis}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={true} 
                            disabled 
                            className="h-6 w-6 data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-400 cursor-not-allowed mx-auto"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}