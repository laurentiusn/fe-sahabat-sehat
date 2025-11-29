import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Search, UserCircle, LogOut, Loader2, Trash2 } from "lucide-react" // Tambah Trash2
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- TIPE DATA ---
interface PasienItem {
  id: string
  nama_lengkap: string
  nik: string
  td_terakhir: string
  gd_terakhir: string
  imt_terakhir: string
}

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [pasienList, setPasienList] = useState<PasienItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // State Form Tambah Pasien
  const [openDialog, setOpenDialog] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  
  // State Delete Pasien (BARU)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nik: "",
    no_hp: "",
    alamat: "",
    jenis_kelamin: "laki-laki",
    tanggal_lahir: "",
    tempat_lahir: ""
  })

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get("/dashboard-admin")
      setPasienList(response.data.data)
    } catch (error) {
      console.error("Gagal ambil data pasien", error)
      toast.error("Gagal memuat data pasien")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- SUBMIT PASIEN BARU ---
  const handleCreatePasien = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSubmit(true)
    try {
      await api.post("/pasien", formData)
      toast.success("Pasien berhasil ditambahkan!")
      setOpenDialog(false)
      setFormData({ 
        nama_lengkap: "", nik: "", no_hp: "", alamat: "", 
        jenis_kelamin: "laki-laki", tanggal_lahir: "", tempat_lahir: "" 
      })
      fetchData()
    } catch (error: any) {
      console.error("Error create pasien:", error)
      const msg = error.response?.data?.message || "Gagal menambah pasien. Cek input Anda."
      // Cek jika ada error validasi spesifik
      if (error.response?.data?.errors) {
         const firstError = Object.values(error.response.data.errors)[0]
         toast.error(`Gagal: ${firstError}`)
      } else {
         toast.error(msg)
      }
    } finally {
      setLoadingSubmit(false)
    }
  }

  // --- DELETE PASIEN (BARU) ---
  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setOpenDeleteDialog(true)
  }

  const handleDeletePasien = async () => {
    if (!deleteId) return
    setLoadingDelete(true)
    try {
      await api.delete(`/pasien/${deleteId}`)
      toast.success("Data pasien berhasil dihapus")
      setOpenDeleteDialog(false)
      fetchData() // Refresh list
    } catch (error) {
      console.error("Gagal hapus:", error)
      toast.error("Gagal menghapus data pasien")
    } finally {
      setLoadingDelete(false)
    }
  }

  const handleLogout = async () => {
    try { await api.post("/logout") } catch (e) { console.error(e) }
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  // Filter Search
  const filteredList = pasienList.filter(p => 
    p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
    p.nik.includes(search)
  )

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-bold text-slate-800">Dashboard Admin</h1>
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
            <CardHeader className="pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle className="text-lg font-bold text-blue-800 w-full sm:w-auto">
                List Pasien
              </CardTitle>
              
              {/* MODAL TAMBAH PASIEN */}
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" /> Tambah Pasien
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Pasien Baru</DialogTitle>
                    <DialogDescription>
                      Isi data diri pasien dengan lengkap. NIK harus 16 digit dan unik.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePasien}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Nama Lengkap</Label>
                        <Input required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} placeholder="Nama Pasien" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>NIK (16 Digit)</Label>
                          <Input required maxLength={16} value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} placeholder="351xxxxxx" />
                        </div>
                        <div className="grid gap-2">
                          <Label>No HP</Label>
                          <Input required value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} placeholder="08xxxxxx" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Tempat Lahir</Label>
                          <Input required value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Tanggal Lahir</Label>
                          <Input type="date" required value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Jenis Kelamin</Label>
                        <Select value={formData.jenis_kelamin} onValueChange={val => setFormData({...formData, jenis_kelamin: val})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Alamat Lengkap</Label>
                        <Input required value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} placeholder="Jl. Contoh No. 123" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={loadingSubmit} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                        {loadingSubmit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Data Pasien"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Cari nama atau NIK..." 
                  className="pl-10 h-10 bg-slate-50" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-[50px] text-center font-bold text-slate-700">No</TableHead>
                      <TableHead className="font-bold text-slate-700">Nama Pasien</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center">TD</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center">GD</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center">IMT</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-10">Memuat data...</TableCell></TableRow>
                    ) : filteredList.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Tidak ada data pasien.</TableCell></TableRow>
                    ) : (
                      filteredList.map((pasien, idx) => (
                        <TableRow 
                          key={pasien.id} 
                          className="cursor-pointer hover:bg-blue-50 transition-colors group"
                          onClick={() => navigate(`/admin/pasien/${pasien.id}`)}
                        >
                          <TableCell className="text-center font-medium text-slate-600">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="font-semibold text-slate-800">{pasien.nama_lengkap}</div>
                            <div className="text-xs text-slate-500">NIK: {pasien.nik}</div>
                          </TableCell>
                          <TableCell className="text-center">{pasien.td_terakhir || "-"}</TableCell>
                          <TableCell className="text-center">{pasien.gd_terakhir || "-"}</TableCell>
                          <TableCell className="text-center">{pasien.imt_terakhir || "-"}</TableCell>
                          <TableCell className="text-center">
                            {/* TOMBOL DELETE (Dengan Stop Propagation) */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation() // <--- PENTING: Mencegah navigasi ke detail saat klik hapus
                                confirmDelete(pasien.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
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

          {/* DIALOG KONFIRMASI HAPUS */}
          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">Hapus Data Pasien?</DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Data pasien beserta riwayat monitoring akan dihapus permanen.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Batal</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeletePasien} 
                  disabled={loadingDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Hapus Pasien"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}