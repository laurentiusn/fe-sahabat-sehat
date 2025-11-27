import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Logo } from "./ui/logo"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [namaLengkap, setNamaLengkap] = useState("")
  const [date, setDate] = useState<Date | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (!namaLengkap || !date) {
        throw new Error("Mohon lengkapi Nama dan Tanggal Lahir.")
      }

      // Format data untuk API (Y-m-d)
      const formattedDate = format(date, "yyyy-MM-dd")

      const response = await api.post("/login", {
        nama_lengkap: namaLengkap,
        tanggal_lahir: formattedDate 
      })

      const { token, role, nama_lengkap: namaUser } = response.data.data

      if (!token || !role) {
        throw new Error("Token atau Role tidak ditemukan dalam respon server.")
      }

      localStorage.setItem("token", token)
      localStorage.setItem("role", role)
      localStorage.setItem("user_nama", namaUser)
      if (role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/dashboard-pasien")
      }

    } catch (error: any) {
      console.error("Login Error:", error)
      const msg = error.response?.data?.message || error.message || "Login gagal."
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-xl border-0">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[500px]">
          
          {/* --- BAGIAN KIRI: GAMBAR --- */}
          <div className="relative hidden md:flex flex-col items-center justify-center p-10 text-white bg-linear-to-bl from-[#1e3a8a] to-[#3b82f6]">
             <div className="relative z-10 text-center space-y-4 max-w-xs">
                <div className="flex justify-center mb-6">
                  <Logo className="h-30 w-30 shadow-lg rounded-full" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Sahabat Sehat</h2>
                <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                  "Sahabatmu dalam setiap langkah menuju kesehatan"
                </p>
             </div>
          </div>

          {/* --- BAGIAN KANAN: FORM --- */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10 flex flex-col justify-center bg-white">
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-blue-700">Selamat Datang</h1>
                <p className="text-muted-foreground text-sm">
                  Masuk dengan data diri Anda
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                <Input
                  id="nama_lengkap"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>

              <div className="grid gap-2">
                <Label>Tanggal Lahir</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-10 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {/* Menampilkan Tanggal yang dipilih (Format Indonesia: 25-12-2000) */}
                      {date ? format(date, "dd-MM-yyyy") : <span>Pilih Tanggal Lahir</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    
                    {/* --- INI BAGIAN UTAMA PERUBAHANNYA --- */}
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      
                      // 1. Aktifkan Dropdown Tahun & Bulan
                      captionLayout="dropdown"
                      
                      // 2. Tentukan Range Tahun (PENTING!)
                      // Mulai dari 1900 sampai Tahun Sekarang
                      fromYear={1900} 
                      toYear={new Date().getFullYear()}
                      
                      classNames={{
                        // Opsional: Perbaikan style dropdown agar rapi
                        caption_dropdowns: "flex justify-center gap-1",
                      }}
                    />
                    {/* -------------------------------------- */}

                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </div>
          </form>

        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-slate-500">
        &copy; 2025 Program Pengelolaan Penyakit Kronis
      </div>
    </div>
  )
}