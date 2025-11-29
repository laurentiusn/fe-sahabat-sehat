import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export default function FormIndikator() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // FIX 1: Pastikan ID valid (bukan string "undefined" yang mungkin terkirim dari navigasi error)
  const isEdit = !!id && id !== 'undefined'
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)

  const [type, setType] = useState("td")
  const [statusName, setStatusName] = useState("")
  const [color, setColor] = useState("#000000")
  const [range, setRange] = useState<any>({
    min: "", max: "", sys_min: "", sys_max: "", dia_min: "", dia_max: "", operator: "AND"
  })

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          // FIX 2: Panggil API hanya jika ID valid
          const res = await api.get(`/indikator/${id}`)
          const data = res.data.data
          
          setType(data.type)
          setStatusName(data.status)
          setColor(data.color_hex)
          setRange({ ...range, ...data.range }) 
        } catch (error) {
          toast.error("Gagal memuat data indikator")
          navigate("/admin/indikator")
        } finally {
          setLoadingData(false)
        }
      }
      fetchData()
    } else {
      // Jika bukan edit, matikan loading data
      setLoadingData(false)
    }
  }, [id, isEdit])

  useEffect(() => {
    if (!isEdit) {
      setRange({ min: "", max: "", sys_min: "", sys_max: "", dia_min: "", dia_max: "", operator: "AND" })
    }
  }, [type, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let rangePayload = {}
    if (type === 'td') {
      rangePayload = {
        sys_min: range.sys_min || null,
        sys_max: range.sys_max || null,
        dia_min: range.dia_min || null,
        dia_max: range.dia_max || null,
        operator: range.operator
      }
    } else {
      rangePayload = {
        min: range.min || null,
        max: range.max || null
      }
    }

    const payload = {
      type,
      status: statusName,
      color_hex: color,
      range: rangePayload
    }

    try {
      if (isEdit) {
        await api.post(`/indikator/${id}`, payload)
        toast.success("Indikator berhasil diperbarui")
      } else {
        await api.post("/indikator", payload)
        toast.success("Indikator berhasil dibuat")
      }
      navigate("/admin/indikator")
    } catch (error: any) {
      toast.error("Gagal menyimpan indikator. Periksa inputan Anda.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Memuat form...</div>

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        <header className="flex h-16 items-center gap-3 border-b bg-white px-6 sticky top-0 z-10 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/indikator")} className="-ml-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <h1 className="text-lg font-bold text-slate-800">
            {isEdit ? "Ubah Indikator" : "Tambah Indikator Baru"}
          </h1>
        </header>

        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <CardTitle className="text-base text-blue-800">Formulir Data Indikator</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="grid gap-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tipe Indikator</Label>
                    <Select value={type} onValueChange={setType} disabled={isEdit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="td">Tekanan Darah</SelectItem>
                        <SelectItem value="gd">Gula Darah</SelectItem>
                        <SelectItem value="imt">Indeks Massa Tubuh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Status (Label)</Label>
                    <Input required value={statusName} onChange={e => setStatusName(e.target.value)} placeholder="Contoh: Waspada / Normal" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Warna Label (Hex Color)</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="color" 
                      className="w-16 h-10 p-1 cursor-pointer" 
                      value={color} 
                      onChange={e => setColor(e.target.value)} 
                    />
                    <Input 
                      value={color} 
                      onChange={e => setColor(e.target.value)} 
                      className="uppercase font-mono w-32"
                      maxLength={7}
                    />
                    <div className="text-sm text-slate-500">Pilih warna untuk badge status</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
                  <h3 className="font-semibold text-slate-700">Pengaturan Nilai (Range)</h3>
                  
                  {type === 'td' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sistolik Min</Label>
                          <Input type="number" value={range.sys_min || ""} onChange={e => setRange({...range, sys_min: e.target.value})} placeholder="Min" />
                        </div>
                        <div className="space-y-2">
                          <Label>Sistolik Max</Label>
                          <Input type="number" value={range.sys_max || ""} onChange={e => setRange({...range, sys_max: e.target.value})} placeholder="Max" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Diastolik Min</Label>
                          <Input type="number" value={range.dia_min || ""} onChange={e => setRange({...range, dia_min: e.target.value})} placeholder="Min" />
                        </div>
                        <div className="space-y-2">
                          <Label>Diastolik Max</Label>
                          <Input type="number" value={range.dia_max || ""} onChange={e => setRange({...range, dia_max: e.target.value})} placeholder="Max" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Operator Logika</Label>
                        <Select value={range.operator} onValueChange={v => setRange({...range, operator: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND (Harus memenuhi kedua syarat)</SelectItem>
                            <SelectItem value="OR">OR (Salah satu terpenuhi)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nilai Minimum</Label>
                        <Input type="number" step="0.01" value={range.min || ""} onChange={e => setRange({...range, min: e.target.value})} placeholder="Min" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nilai Maksimum</Label>
                        <Input type="number" step="0.01" value={range.max || ""} onChange={e => setRange({...range, max: e.target.value})} placeholder="Max" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Simpan</>}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}