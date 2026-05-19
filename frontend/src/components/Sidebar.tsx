import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Tag,
  Truck,
  Plug,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, active: false },
  { label: 'Orders',       icon: ShoppingCart,    active: false },
  { label: 'Customers',    icon: Users,           active: false },
  { label: 'Products',     icon: Package,         active: false },
  { label: 'Pricing',      icon: Tag,             active: true  },
  { label: 'Freight',      icon: Truck,           active: false, badge: 'NEW' },
  { label: 'Integrations', icon: Plug,            active: false },
  { label: 'Settings',     icon: Settings,        active: false },
]

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-56 min-h-screen bg-foboh-teal-dark flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-foboh-teal/30">
        <span className="text-white font-bold text-xl tracking-tight">FOBOH</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
        {navItems.map(({ label, icon: Icon, active, badge }) => (
          <button
            key={label}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${active
                ? 'bg-foboh-teal text-white'
                : 'text-teal-100/80 hover:bg-foboh-teal/40 hover:text-white'
              }
            `}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
              <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom user avatar placeholder */}
      <div className="px-5 py-4 border-t border-foboh-teal/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foboh-teal-light flex items-center justify-center text-white text-xs font-bold">
            VG
          </div>
          <div className="text-teal-100/80 text-xs">
            <p className="font-medium text-white">Varun Goel</p>
            <p>Supplier</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
