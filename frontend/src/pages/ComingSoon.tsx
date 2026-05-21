import { useLocation } from 'react-router-dom'

export default function ComingSoon() {
  const { pathname } = useLocation()
  const name = pathname.replace('/', '').replace(/^./, (c) => c.toUpperCase())

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
        <h1 className="text-base font-semibold text-gray-800">{name}</h1>
        <p className="text-xs text-gray-400 mt-0.5">This section is coming soon</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400">Coming soon</p>
      </div>
    </div>
  )
}
