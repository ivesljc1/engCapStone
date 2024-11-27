import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <div className="flex flex-col items-start gap-12 rounded-[32px] bg-primary/25 p-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-[32px] font-semibold text-gray-900">
            Precision insights, tailored for your health.
          </h1>
          <p className="text-gray-600">
            Use our AI-powered tool to identify potential health concerns and receive
            tailored recommendations in minutes.
          </p>
        </div>
        <Link 
          href="/survey"
          className="rounded-full bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
        >
          Start
        </Link>
      </div>
    </div>
  )
}
