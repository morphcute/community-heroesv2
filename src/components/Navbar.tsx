import Link from "next/link";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <nav className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
       <Link href="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl">CH TOURNAMENT</span>
       </Link>
       <div className="flex gap-4">
          <Link href="/login" className="btn-esports px-4 py-2 text-sm">Login</Link>
       </div>
    </nav>
  )
}
