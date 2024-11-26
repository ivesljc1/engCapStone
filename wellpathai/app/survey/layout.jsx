export default function SurveyLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* If you need any persistent UI elements for all survey pages */}
      <main className="h-full">
        {children}
      </main>
    </div>
  )
}
