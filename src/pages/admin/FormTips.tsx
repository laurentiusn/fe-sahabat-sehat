import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Pastikan ada komponen Textarea atau pakai Input biasa
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Save, Image as ImageIcon } from "lucide-react"

// Interface Data
interface TipsImage {
  id: string
  url: string
  path_gambar: string
}

export default function FormTips() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // State Data Form
  const [konten, setKonten] = useState("")
  const [indikatorInfo, setIndikatorInfo] = useState<any>(null)
  
  // State Gambar
  const [existingImages, setExistingImages] = useState<TipsImage[]>([])
  const [newImages, setNewImages] = useState<FileList | null>(null)

  // Fetch Detail Tips
  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const res = await api.get(`/tips/${id}`)
        const data = res.data.data
        
        setKonten(data.konten === "-" ? "" : data.konten) // Handle jika konten masih strip
        setIndikatorInfo(data.indikator)
        setExistingImages(data.gambar_tips || [])
      } catch (error) {
        toast.error("Gagal memuat detail tips")
        navigate("/admin/tips")
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [id, navigate])

  // Submit Update (POST dengan _method: PATCH untuk FormData)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('_method', 'PATCH') // Trik Laravel untuk PUT/PATCH file
    formData.append('konten', konten)
    
    // Append gambar baru jika ada
    if (newImages) {
      for (let i = 0; i < newImages.length; i++) {
        formData.append('gambar_tips[]', newImages[i])
      }
    }

    try {
      // Header Content-Type otomatis dihandle axios saat kirim FormData
      await api.post(`/tips/${id}`, formData) 
      toast.success("Tips berhasil diperbarui!")
      navigate("/admin/tips")
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error("Gagal menyimpan tips. Pastikan input valid.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <div className="flex h-screen items-center justify-center text-slate-500">Memuat form...</div>

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#F8F9FC]">
        <header className="flex h-16 items-center gap-3 border-b bg-white px-6 sticky top-0 z-10 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tips")} className="-ml-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <h1 className="text-lg font-bold text-slate-800">Ubah Tips Kesehatan</h1>
        </header>

        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <CardTitle className="text-base text-blue-800">Formulir Tips</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Info Indikator (Read Only) */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Target Kondisi</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-700">
                    {getTypeLabel(indikatorInfo?.type)}
                  </span>
                  <span className="text-slate-400">/</span>
                  <Badge style={{ backgroundColor: indikatorInfo?.color_hex }} className="border-0">
                    {indikatorInfo?.status}
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-6">
                
                <div className="space-y-2">
                  <Label>Konten Saran / Tips</Label>
                  {/* Gunakan Textarea agar muat teks panjang */}
                  <Textarea 
                    required 
                    rows={5}
                    value={konten} 
                    onChange={e => setKonten(e.target.value)} 
                    placeholder="Tuliskan saran kesehatan di sini..." 
                    className="bg-white"
                  />
                </div>

                {/* Bagian Gambar */}
                <div className="space-y-4">
                  <Label>Galeri Gambar</Label>
                  
                  {/* Preview Gambar Lama */}
                  {existingImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative aspect-video rounded-md overflow-hidden border bg-slate-100">
                          <img src={img.url} alt="Tips" className="object-cover w-full h-full" />
                          {/* Note: Jika ingin fitur hapus gambar per item, perlu API delete gambar terpisah */}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input Gambar Baru */}
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <p className="text-sm"><span className="font-semibold">Klik untuk upload gambar baru</span></p>
                            <p className="text-xs text-slate-400">PNG, JPG (MAX. 10MB)</p>
                        </div>
                        <input 
                          id="dropzone-file" 
                          type="file" 
                          multiple 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => setNewImages(e.target.files)}
                        />
                    </label>
                  </div>
                  {newImages && (
                    <p className="text-xs text-green-600 font-medium">
                      {newImages.length} gambar baru dipilih.
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}
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

function getTypeLabel(type: string) {
  if (type === 'td') return "Tekanan Darah"
  if (type === 'gd') return "Gula Darah"
  if (type === 'imt') return "Indeks Massa Tubuh"
  return type
}