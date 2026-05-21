import { Menu, Bell, HelpCircle } from 'lucide-react'

interface Props {
  onMenuClick: () => void
}

export default function TopHeader({ onMenuClick }: Props) {
  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <header className="flex items-center justify-between bg-foboh-teal px-4 md:px-6 py-3 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-white/80 hover:text-white p-1 rounded"
        >
          <Menu size={22} />
        </button>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Hello, Varun</p>
          <p className="text-white/60 text-xs">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <Bell size={16} />
        </button>
        <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <HelpCircle size={16} />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
            VG
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-white text-xs font-medium leading-tight">Varun Goel</p>
            <p className="text-white/60 text-xs">Supplier</p>
          </div>
        </div>
      </div>
    </header>
  )
}
