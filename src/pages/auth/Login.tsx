import { LoginForm } from "@/components/login-form"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (token && role) {
      // Redirect jika sudah login
      if (role === 'admin') navigate("/admin/dashboard", { replace: true })
      else navigate("/dashboard-pasien", { replace: true })
    }
  }, [navigate])
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
