import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Link 
        href="/login" 
        className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
      >
        Sign In
      </Link>
    </div>
  )
}
