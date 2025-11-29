import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, addDays } from "date-fns"
import { id as localeId } from "date-fns/locale"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// Tambahkan import 'Square' untuk icon stop
import { ArrowLeft, Activity, Droplets, Scale, Trash2, Plus, Loader2, Calendar, CheckCircle2, XCircle, CircleOff } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// --- TIPE DATA ---
interface Profil {
  nama_lengkap: string
  nik: string
  no_hp: string
  alamat: string
  jenis_kelamin: string
  tanggal_lahir: string
}
interface Monitoring { td?: string; gd?: string; imt?: string }

interface ObatAktif {
  id: string
  waktu: string
  nama_obat: string
  dosis: string
  rentang: string
  is_active: boolean
  keterangan: string
}

interface RiwayatObatItem {
  id: string
  id_obat: string
  jadwal_konsumsi: string
  status: "sudah" | "belum"
  waktu_aktual_konsumsi: string | null
  obat: {
    nama_obat: string
    dosis: string
    waktu: string
  }
}

interface Makanan { id: string; nama: string }
interface Aktivitas { id: string; nama: string; durasi: string }
interface LogHarian {
  id_log_harian: string
  tanggal: string
  makanan_utama: Makanan[]
  makanan_selingan: Makanan[]
  aktivitas_fisik: Aktivitas[]
}

interface DetailPasienData {
  profil: Profil
  monitoring_terakhir?: Monitoring
  catatan_harian?: LogHarian[]
}

export default function DetailPasien() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [data, setData] = useState<DetailPasienData | null>(null)
  const [obatList, setObatList] = useState<ObatAktif[]>([])        
  const [riwayatObat, setRiwayatObat] = useState<RiwayatObatItem[]>([]) 
  
  const [loading, setLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const [formObat, setFormObat] = useState({
    nama_obat: "", dosis: "", waktu: "pagi", jumlah_hari: "7", keterangan: ""
  })

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true)
    setIsError(false)
    try {
      const [resPasien, resObat, resRiwayat] = await Promise.allSettled([
        api.get(`/pasien/${id}`),
        api.get(`/daftar-obat`, { params: { id_user: id } }),
        api.get(`/riwayat-obat`, { params: { id_user: id } })
      ])

      if (resPasien.status === 'fulfilled') {
        setData(resPasien.value.data.data)
      } else {
        throw new Error("Gagal ambil profil")
      }

      if (resObat.status === 'fulfilled') {
        setObatList(resObat.value.data.data || [])
      } else {
        setObatList([]) 
      }

      if (resRiwayat.status === 'fulfilled') {
        setRiwayatObat(resRiwayat.value.data.data || [])
      } else {
        setRiwayatObat([])
      }

    } catch (error) {
      console.error("Error detail:", error)
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(id) fetchData()
  }, [id])

  // --- TAMBAH OBAT ---
  const handleAddObat = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSubmit(true)
    const today = new Date()
    const startDate = format(today, "yyyy-MM-dd")
    const endDate = format(addDays(today, parseInt(formObat.jumlah_hari) || 0), "yyyy-MM-dd")

    try {
      await api.post("/obat", {
        id_user: id,
        nama_obat: formObat.nama_obat,
        dosis: formObat.dosis,
        waktu: formObat.waktu,
        start_date: startDate,
        end_date: endDate,
        keterangan: formObat.keterangan
      })
      toast.success("Obat berhasil ditambahkan")
      setFormObat({ ...formObat, nama_obat: "", dosis: "", keterangan: "" })
      fetchData()
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menambah obat"
      toast.error(msg)
    } finally {
      setLoadingSubmit(false)
    }
  }

  // --- STOP OBAT (FITUR BARU) ---
  const handleStopObat = async (idObat: string) => {
    if(!confirm("Yakin ingin memberhentikan obat ini per hari ini?")) return
    
    // Format tanggal stop sesuai standar database (Y-m-d)
    const tanggalStop = format(new Date(), "yyyy-MM-dd")
    
    try {
      await api.post(`/obat/${idObat}/stop`, {
        tanggal_stop: tanggalStop
      })
      
      toast.success("Pengobatan berhasil diberhentikan")
      
      // Refresh Data List Obat
      const resObat = await api.get(`/daftar-obat`, { params: { id_user: id } })
      setObatList(resObat.data.data)
      
    } catch (error) {
      console.error("Gagal stop obat:", error)
      toast.error("Gagal memberhentikan obat")
    }
  }

  // --- HAPUS OBAT ---
  const handleDeleteObat = async (idObat: string) => {
    if(!confirm("Yakin ingin menghapus data obat ini?")) return
    try {
      await api.delete(`/obat/${idObat}`)
      toast.success("Obat dihapus")
      
      const resObat = await api.get(`/daftar-obat`, { params: { id_user: id } })
      setObatList(resObat.data.data)
    } catch (error) {
      toast.error("Gagal menghapus obat")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span>Memuat data detail...</span>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <div className="text-slate-500 font-medium">Data pasien tidak ditemukan.</div>
        <Button variant="outline" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
    )
  }

  const { profil, monitoring_terakhir, catatan_harian } = data
  const monitoring = monitoring_terakhir || {}
  const catatan = catatan_harian || []

  // --- LOGIKA HITUNG AKUMULASI (HEADER) ---
  const hitungAkumulasi = () => {
    if (!catatan || catatan.length === 0) return { total: 0, label: "" }
    
    const total = catatan.reduce((acc, curr) => {
      const subTotal = curr.aktivitas_fisik.reduce((sAcc, sCurr) => {
        const val = parseInt(sCurr.durasi.toString().replace(/\D/g, '')) || 0
        return sAcc + val
      }, 0)
      return acc + subTotal
    }, 0)

    let label = format(new Date(), "MMMM yyyy", { locale: localeId }) 
    if (catatan[0]?.tanggal) {
      const parts = catatan[0].tanggal.split("-").map(p => p.trim())
      if (parts.length === 3) {
        const [d, m, y] = parts
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
        label = format(dateObj, "MMMM yyyy", { locale: localeId })
      }
    }

    return { total, label }
  }

  const { total: totalDurasi, label: labelBulan } = hitungAkumulasi()

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        <header className="flex h-16 items-center gap-3 border-b bg-white px-6 sticky top-0 z-10 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{profil?.nama_lengkap || "Tanpa Nama"}</h1>
            <span className="text-xs text-slate-500">NIK: {profil?.nik || "-"}</span>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
          
          <div className="grid gap-4 md:grid-cols-3">
            <StatusCard 
            title="Tekanan Darah" 
            value={monitoring.td || "--"} 
            unit="mmHg" 
            icon={Activity} 
            color="text-blue-600"
            onClick={() => navigate(`/admin/pasien/${id}/riwayat/td`)} 
            />
            
            <StatusCard 
            title="Gula Darah" 
            value={monitoring.gd || "--"} 
            unit="mg/dL" 
            icon={Droplets} 
            color="text-pink-600" 
            onClick={() => navigate(`/admin/pasien/${id}/riwayat/gd`)} 
            />
            
            <StatusCard 
            title="IMT" 
            value={monitoring.imt || "--"} 
            unit="kg/m²" 
            icon={Scale} 
            color="text-orange-600" 
            onClick={() => navigate(`/admin/pasien/${id}/riwayat/imt`)}
            />
          </div>

          <Tabs defaultValue="obat" className="space-y-4">
            <TabsList className="bg-white p-1 border shadow-sm rounded-lg flex flex-wrap h-auto">
              <TabsTrigger value="obat" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Manajemen Obat</TabsTrigger>
              <TabsTrigger value="riwayat_obat" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Riwayat Obat</TabsTrigger>
              <TabsTrigger value="catatan" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Riwayat Catatan</TabsTrigger>
              <TabsTrigger value="profil" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Data Diri</TabsTrigger>
            </TabsList>

            {/* 1. TAB: MANAJEMEN OBAT */}
            <TabsContent value="obat" className="space-y-6">
              
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="border-b pb-4 pt-5">
                  <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                    <Plus className="h-5 w-5" /> Tambah Rencana Pengobatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddObat} className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Nama Obat</Label>
                        <Input required value={formObat.nama_obat} onChange={e => setFormObat({...formObat, nama_obat: e.target.value})} placeholder="Contoh: Metformin" />
                      </div>
                      <div className="space-y-2">
                        <Label>Dosis</Label>
                        <Input required value={formObat.dosis} onChange={e => setFormObat({...formObat, dosis: e.target.value})} placeholder="Contoh: 500 mg (1 tablet)" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Waktu Konsumsi</Label>
                        <Select value={formObat.waktu} onValueChange={v => setFormObat({...formObat, waktu: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pagi">Pagi</SelectItem>
                            <SelectItem value="siang">Siang</SelectItem>
                            <SelectItem value="sore">Sore</SelectItem>
                            <SelectItem value="malam">Malam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Durasi Hari</Label>
                        <Input type="number" required value={formObat.jumlah_hari} onChange={e => setFormObat({...formObat, jumlah_hari: e.target.value})} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Keterangan</Label>
                        <Input value={formObat.keterangan} onChange={e => setFormObat({...formObat, keterangan: e.target.value})} placeholder="Sesudah makan..." />
                      </div>
                    </div>
                    <Button type="submit" disabled={loadingSubmit} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto md:self-end">
                      {loadingSubmit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Obat"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* List Rencana Aktif */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 ml-1 text-lg">Rencana Pengobatan Aktif</h3>
                {(!obatList || obatList.length === 0) ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed text-slate-400">
                    <p className="text-base font-medium">Tidak Ada Obat</p>
                    <p className="text-sm">Belum ada rencana pengobatan yang ditambahkan.</p>
                  </div>
                ) : (
                  obatList.map((obat) => (
                    <div key={obat.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border rounded-xl shadow-sm gap-4 ${!obat.is_active && 'opacity-60 bg-slate-50'}`}>
                      <div className="flex items-start sm:items-center gap-4">
                        <Badge variant="outline" className={`capitalize w-16 justify-center py-1 ${obat.is_active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                          {obat.waktu}
                        </Badge>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-lg">{obat.nama_obat}</h4>
                            {!obat.is_active && <Badge variant="secondary" className="text-xs h-5">Non-Aktif</Badge>}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            <span className="font-medium text-slate-700">{obat.dosis}</span> • {obat.rentang}
                          </div>
                          {obat.keterangan && <div className="text-xs text-slate-400 mt-1 italic">{obat.keterangan}</div>}
                        </div>
                      </div>
                      
                      {/* === TOMBOL AKSI: STOP & HAPUS === */}
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        
                        {/* Tombol Stop (Hanya muncul jika obat aktif) */}
                        {obat.is_active && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleStopObat(obat.id)} 
                            title="Stop / Berhentikan Pengobatan"
                            className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <CircleOff className="h-5 w-5 fill-current" />
                          </Button>
                        )}

                        {/* Tombol Hapus */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteObat(obat.id)} 
                          title="Hapus Data Obat"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ... (TAB LAIN SAMA SEPERTI SEBELUMNYA) ... */}
            <TabsContent value="riwayat_obat">
               {/* Gunakan kode Tab Riwayat Obat dari jawaban sebelumnya yang sudah fix format tanggal */}
               <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="border-b py-4 px-6">
                  <CardTitle className="text-base text-blue-800 font-semibold">Riwayat Konsumsi Harian</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-b">
                          <TableHead className="pl-6 h-10 w-[150px] font-semibold text-slate-700">Tanggal</TableHead>
                          <TableHead className="h-10 font-semibold text-slate-700">Nama Obat</TableHead>
                          <TableHead className="h-10 font-semibold text-slate-700">Dosis</TableHead>
                          <TableHead className="h-10 font-semibold text-slate-700">Waktu</TableHead>
                          <TableHead className="h-10 font-semibold text-slate-700 text-center">Status</TableHead>
                          <TableHead className="h-10 pr-6 text-right font-semibold text-slate-700">Jam Minum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riwayatObat.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">Belum ada riwayat konsumsi.</TableCell></TableRow>
                        ) : (
                          riwayatObat.map((log) => (
                            <TableRow key={log.id} className="hover:bg-slate-50 border-b last:border-0">
                              <TableCell className="pl-6 py-3 font-medium text-slate-600">
                                {format(new Date(log.jadwal_konsumsi), "dd MMM yyyy", { locale: localeId })}
                              </TableCell>
                              <TableCell className="py-3 font-semibold text-slate-700">{log.obat.nama_obat}</TableCell>
                              <TableCell className="py-3">{log.obat.dosis}</TableCell>
                              <TableCell className="py-3"><Badge variant="outline" className="capitalize bg-white">{log.obat.waktu}</Badge></TableCell>
                              <TableCell className="py-3 text-center">
                                {log.status === 'sudah' ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 gap-1 pl-1 pr-2">
                                    <CheckCircle2 className="h-3 w-3" /> Sudah
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-slate-500 border-slate-300 gap-1 pl-1 pr-2 bg-white">
                                    <XCircle className="h-3 w-3" /> Belum
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-3 pr-6 text-right text-slate-500 font-mono text-xs">
                                {log.waktu_aktual_konsumsi ? format(new Date(log.waktu_aktual_konsumsi), "HH:mm") : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="catatan">
               {/* Gunakan kode Tab Catatan dari jawaban sebelumnya */}
               <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="border-b py-4 px-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-blue-800 font-semibold">Riwayat Catatan Pasien</CardTitle>
                  {catatan.length > 0 && (
                    <div className="bg-blue-100 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {labelBulan}: {totalDurasi} menit
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-b">
                          <TableHead className="pl-6 h-10 w-[150px] font-semibold text-slate-700">Tanggal</TableHead>
                          <TableHead className="h-10 font-semibold text-slate-700">Makanan Utama</TableHead>
                          <TableHead className="h-10 font-semibold text-slate-700">Makanan Selingan</TableHead>
                          <TableHead className="h-10 font-semibold text-slate-700">Aktivitas Fisik</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(!catatan || catatan.length === 0) ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-64 text-center">
                              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                                <div className="p-3 bg-slate-100 rounded-full">
                                  <Calendar className="h-8 w-8 text-slate-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-600">Tidak ada Catatan Harian</div>
                                  <div className="text-xs text-slate-400">Pasien belum mengisi log harian.</div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          catatan.map((item) => (
                            <TableRow key={item.id_log_harian} className="hover:bg-slate-50 align-top border-b last:border-0">
                              <TableCell className="pl-6 font-medium py-4 text-slate-700">{item.tanggal}</TableCell>
                              <TableCell className="py-4">
                                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-sm">
                                  {item.makanan_utama?.length > 0 ? item.makanan_utama.map(m => <li key={m.id}>{m.nama}</li>) : "-"}
                                </ul>
                              </TableCell>
                              <TableCell className="py-4">
                                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-sm">
                                  {item.makanan_selingan?.length > 0 ? item.makanan_selingan.map(m => <li key={m.id}>{m.nama}</li>) : "-"}
                                </ul>
                              </TableCell>
                              <TableCell className="py-4 pr-6 w-[300px]">
                                <ul className="space-y-1 text-slate-600 text-sm">
                                  {item.aktivitas_fisik?.length > 0 ? item.aktivitas_fisik.map(a => (
                                    <li key={a.id} className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 mb-1 last:border-0 last:pb-0 last:mb-0">
                                      <span className="truncate pr-2">{a.nama}</span>
                                      <span className="font-semibold text-blue-600 whitespace-nowrap text-xs">
                                        {a.durasi}
                                      </span>
                                    </li>
                                  )) : <span className="text-slate-400 italic">-</span>}
                                </ul>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profil">
               {/* Sama seperti sebelumnya */}
               <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base text-blue-800">Informasi Pribadi</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                  <DetailRow label="Nama Lengkap" value={profil?.nama_lengkap} />
                  <DetailRow label="NIK" value={profil?.nik} />
                  <DetailRow label="Nomor HP" value={profil?.no_hp} />
                  <DetailRow label="Jenis Kelamin" value={profil?.jenis_kelamin} capitalize />
                  <DetailRow label="Tempat, Tanggal Lahir" value={profil?.tanggal_lahir} />
                  <DetailRow label="Alamat" value={profil?.alamat} />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function StatusCard({ title, value, unit, icon: Icon, color, onClick }: any) {
  return (
    <Card 
      onClick={onClick} 
      className="shadow-sm border-0 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
          <Icon className={`h-4 w-4 ${color}`} /> {title}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">
          {value || "--"} <span className="text-sm font-normal text-slate-400">{unit}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({ label, value, capitalize }: any) {
  return (
    <div className="flex flex-col border-b border-dashed pb-2 last:border-0">
      <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{label}</span>
      <span className={`text-base font-medium text-slate-700 mt-1 ${capitalize ? 'capitalize' : ''}`}>{value || "-"}</span>
    </div>
  )
}