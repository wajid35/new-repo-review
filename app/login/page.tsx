import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-white flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-y-hidden">
      <div className="w-full max-w-sm md:max-w-3xl border border-[#FF5F1F] rounded-xl p-6 shadow-lg">
        <LoginForm />
      </div>
    </div>
  )
}
