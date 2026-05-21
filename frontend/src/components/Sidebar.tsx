import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Tag,
  Truck,
  Plug,
  Settings,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Orders',       icon: ShoppingCart,    to: '/orders' },
  { label: 'Customers',    icon: Users,           to: '/customers' },
  { label: 'Products',     icon: Package,         to: '/products' },
  { label: 'Pricing',      icon: Tag,             to: '/pricing' },
  { label: 'Freight',      icon: Truck,           to: '/freight', badge: 'NEW' },
  { label: 'Integrations', icon: Plug,            to: '/integrations' },
  { label: 'Settings',     icon: Settings,        to: '/settings' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          flex flex-col w-56 h-full bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 md:hidden">
          <span className="font-bold text-foboh-teal text-lg">FOBOH</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to, badge }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                border-l-[3px] pl-[calc(0.75rem-3px)]
                ${isActive
                  ? 'border-foboh-teal text-foboh-teal bg-foboh-teal-bg'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }
              `}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOBOH logo — bottom left, matching Figma */}
        <div className="px-4 py-5 border-t border-gray-100 text-center">
          <span className="text-foboh-teal font-black text-2xl tracking-tight">FOBOH</span>
        </div>
      </aside>
    </>
  )
}
