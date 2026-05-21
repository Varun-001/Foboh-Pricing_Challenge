import PriceChecker from '../components/PriceChecker'

export default function PriceCheckerPage() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
        <h1 className="text-base font-semibold text-gray-800">Price Checker</h1>
        <p className="text-xs text-gray-400 mt-0.5">Resolve the winning price for any customer + product combination</p>
      </div>
      <div className="px-4 md:px-6 py-6 max-w-2xl">
        <PriceChecker />
      </div>
    </div>
  )
}
