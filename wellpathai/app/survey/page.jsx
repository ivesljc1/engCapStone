export default function Page() {
  return (
    <div className="min-h-screen bg-white p-6">
      {/* Logo */}
      <div className="mb-12">
        <img
          src="/logo_no_text.svg"
          alt="WellPathAI"
          className="h-8 w-auto"
        />
      </div>

      {/* Question Section */}
      <div className="max-w-2xl space-y-12">
        {/* Question Text */}
        <h1 className="text-[40px] font-light text-gray-900 leading-[1.2]">
          Have you ever been diagnosed with high blood pressure?
        </h1>

        {/* Options */}
        <div className="flex flex-col gap-4">
          <button className="w-fit px-6 py-3 text-primary hover:text-primary-hover border border-primary hover:border-primary-hover rounded-full transition-colors">
            Yes
          </button>
          <button className="w-fit px-6 py-3 text-primary hover:text-primary-hover border border-primary hover:border-primary-hover rounded-full transition-colors">
            No
          </button>
          <button className="w-fit px-6 py-3 text-primary hover:text-primary-hover border border-primary hover:border-primary-hover rounded-full transition-colors">
            I'm not sure
          </button>
        </div>
      </div>
    </div>
  )
}
