import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, UserCircle, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- TIPE DATA ---
interface IndikatorRef {
  id: string
  type: string
  status: string
  color_hex: string
}

interface TipsItem {
  id: string
  id_indikator: string
  indikator: IndikatorRef
}

export default function Tips() {
  const navigate = useNavigate()
  const [list, setList] = useState<TipsItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get("/tips")
      setList(response.data.data || [])
    } catch (error) {
      toast.error("Gagal memuat data tips")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = async () => {
    try { await api.post("/logout") } catch (e) { console.error(e) }
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-bold text-slate-800">Tips Hidup Sehat</h1>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors outline-none cursor-pointer">
                  <span className="text-sm font-medium text-slate-600 hidden md:block">Admin</span>
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-300">
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

        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Card className="border-0 shadow-sm">
            {/* Header tanpa search, hanya judul */}
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-base text-blue-800">Daftar Tips Berdasarkan Indikator</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-[50px] text-center font-bold text-slate-700 pl-6">No</TableHead>
                      <TableHead className="font-bold text-slate-700">Indikator (Kondisi)</TableHead>
                      <TableHead className="font-bold text-slate-700">Tipe</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center w-[100px] pr-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell></TableRow>
                    ) : list.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada data.</TableCell></TableRow>
                    ) : (
                      list.map((item, idx) => (
                        <TableRow key={item.id} className="hover:bg-blue-50/50">
                          <TableCell className="text-center font-medium text-slate-600 pl-6">{idx + 1}</TableCell>
                          <TableCell>
                            <Badge 
                              className="border-0 px-2 py-1 text-white hover:opacity-90"
                              style={{ backgroundColor: item.indikator.color_hex }}
                            >
                              {item.indikator.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-700">{getTypeLabel(item.indikator.type)}</div>
                          </TableCell>
                          <TableCell className="text-center pr-6">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
                              onClick={() => navigate(`/admin/tips/edit/${item.id}`)}
                            >
                              <Edit className="h-4 w-4" /> Ubah
                            </Button>
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

function getTypeLabel(type: string) {
  if (type === 'td') return "Tekanan Darah"
  if (type === 'gd') return "Gula Darah"
  if (type === 'imt') return "Indeks Massa Tubuh"
  return type.toUpperCase()
}