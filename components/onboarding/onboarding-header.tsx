export default function OnboardingHeader() {
  return (
    <header className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-6 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            NexAcademy
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              AI-Powered Learning Platform
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
