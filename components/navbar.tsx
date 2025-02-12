import { FileText } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-pink-500" />
          <span>Resumate</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
            Contact Us
          </Button>
        </nav>
      </div>
    </header>
  )
}

