import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "@/lib/axios"
import { toast } from "sonner"
import Markdown from "react-markdown" // <--- 1. IMPORT INI

import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Save, Image as ImageIcon, X, Trash2, Eye, PenLine } from "lucide-react"

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
  const [newImages, setNewImages] = useState<File[]>([]) 
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])

  // State untuk Tab Mode (Edit / Preview)
  const [mode, setMode] = useState<"edit" | "preview">("edit") // <--- 2. STATE BARU

  // Fetch Detail Tips
  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const res = await api.get(`/tips/${id}`)
        const data = res.data.data
        
        setKonten(data.konten === "-" ? "" : data.konten)
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

  // ... (Code Handle Gambar handleFileChange, removeNewImage, removeExistingImage TETAP SAMA) ...
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setNewImages(prev => [...prev, ...filesArray])
    }
  }

  const removeNewImage = (indexToRemove: number) => {
    setNewImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const removeExistingImage = (idToRemove: string) => {
    setDeletedImageIds(prev => [...prev, idToRemove])
    setExistingImages(prev => prev.filter(img => img.id !== idToRemove))
  }

  // ... (Code handleSubmit TETAP SAMA) ...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('_method', 'PATCH') 
    formData.append('konten', konten)
    
    newImages.forEach((file) => {
      formData.append('new_images[]', file)
    })

    deletedImageIds.forEach((deletedId) => {
      formData.append('deleted_image_ids[]', deletedId)
    })

    try {
      await api.post(`/tips/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }) 
      toast.success("Tips berhasil diperbarui!")
      navigate("/admin/tips")
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error("Gagal menyimpan tips. Periksa inputan.")
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
              
              {/* Indikator Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Target Kondisi</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-700">
                    {indikatorInfo?.type === 'td' ? "Tekanan Darah" : indikatorInfo?.type === 'gd' ? "Gula Darah" : "IMT"}
                  </span>
                  <span className="text-slate-400">/</span>
                  <Badge style={{ backgroundColor: indikatorInfo?.color_hex }} className="border-0">
                    {indikatorInfo?.status}
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-6">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Konten Saran / Tips</Label>
                    
                    {/* 3. TOMBOL TOGGLE EDIT / PREVIEW */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setMode("edit")}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                mode === "edit" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <PenLine className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("preview")}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                mode === "preview" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                    </div>
                  </div>

                  {/* 4. LOGIC TAMPILAN SESUAI MODE */}
                  {mode === 'edit' ? (
                      <div className="space-y-2">
                        <Textarea 
                            required 
                            rows={8}
                            value={konten} 
                            onChange={e => setKonten(e.target.value)} 
                            placeholder="Gunakan Markdown: **teks tebal**, - list point, dll." 
                            className="bg-white font-mono text-sm"
                        />
                        <p className="text-xs text-slate-400">
                            Support Markdown: <strong>**Tebal**</strong>, <em>*Miring*</em>, - List item.
                        </p>
                      </div>
                  ) : (
                      <div className="min-h-[200px] w-full rounded-md border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-600 leading-relaxed space-y-2">
                        {/* 5. RENDER MARKDOWN (Copy settingan dari Halaman Pasien) */}
                        {konten ? (
                            <Markdown 
                                components={{
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                    strong: ({node, ...props}) => <span className="font-bold text-slate-800" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                }}
                            >
                                {konten}
                            </Markdown>
                        ) : (
                            <p className="text-slate-400 italic">Belum ada konten untuk ditampilkan...</p>
                        )}
                      </div>
                  )}
                </div>

                {/* --- AREA GAMBAR (TETAP SAMA) --- */}
                <div className="space-y-4">
                  <Label>Galeri Gambar</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* ... (Kode gambar sama persis seperti sebelumnya) ... */}
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border bg-slate-100 group">
                        <img src={img.url} alt="Existing" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {newImages.map((file, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border bg-blue-50 group ring-2 ring-blue-100">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-slate-800 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <p className="text-xs font-semibold">Tambah</p>
                        </div>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} value="" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
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