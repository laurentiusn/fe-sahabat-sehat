import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, UserCircle, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface IndikatorItem {
  id: string
  type: 'td' | 'gd' | 'imt'
  status: string
  color_hex?: string 
}

export default function Indikator() {
  const navigate = useNavigate()
  const [list, setList] = useState<IndikatorItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // State Delete
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get("/indikator")
      setList(response.data.data || [])
    } catch (error) {
      toast.error("Gagal memuat data indikator")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setLoadingDelete(true)
    try {
      await api.delete(`/indikator/${deleteId}`)
      toast.success("Indikator berhasil dihapus")
      setOpenDelete(false)
      fetchData()
    } catch (error) {
      toast.error("Gagal menghapus indikator")
    } finally {
      setLoadingDelete(false)
    }
  }

  const confirmDelete = (id: string) => {
    if (!id) {
      toast.error("ID Indikator tidak valid")
      return
    }
    setDeleteId(id)
    setOpenDelete(true)
  }

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
            <h1 className="text-lg font-bold text-slate-800">Indikator Kesehatan</h1>
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
            {/* HEADER TANPA SEARCH, TOMBOL DI KANAN */}
            <CardHeader className="pb-4 flex flex-row items-center justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/admin/indikator/tambah")}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Indikator
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-[50px] text-center font-bold text-slate-700">No</TableHead>
                      <TableHead className="font-bold text-slate-700">Nama Status</TableHead>
                      <TableHead className="font-bold text-slate-700">Tipe</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center w-[150px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell></TableRow>
                    ) : list.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada data.</TableCell></TableRow>
                    ) : (
                      list.map((item, idx) => (
                        <TableRow key={item.id || idx} className="hover:bg-blue-50/50">
                          <TableCell className="text-center font-medium text-slate-600">{idx + 1}</TableCell>
                          <TableCell className="font-semibold text-slate-800">
                            {item.status}
                            {!item.id && <span className="text-red-500 text-xs ml-2">(ID Missing)</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white">{getTypeLabel(item.type)}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => {
                                  if(item.id) navigate(`/admin/indikator/edit/${item.id}`)
                                  else toast.error("ID Data tidak valid")
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => item.id && confirmDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus Indikator?</DialogTitle>
                <DialogDescription>
                  Tindakan ini permanen. Data indikator ini akan dihapus dari sistem.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDelete(false)}>Batal</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={loadingDelete}>
                  {loadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Hapus"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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