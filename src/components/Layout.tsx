import type { ReactNode } from 'react'
import type { UserRole } from './Login'

interface LayoutProps {
  children: ReactNode
  currentPage: 'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users'
  onNavigate: (page: 'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users') => void
  onLogout: () => void
  userRole: UserRole
  userInfo: { name: string; initials: string; role: string }
}

function Layout({ children, currentPage, onNavigate, onLogout, userRole, userInfo }: LayoutProps) {
  const adminMenuItems = [
    { id: 'report' as const, label: 'Отчёты' },
    { id: 'book' as const, label: 'Справочники' },
    { id: 'help' as const, label: 'Цепочки помощи' },
    { id: 'pa' as const, label: 'Бланк ПА' },
    { id: 'deviations' as const, label: 'БД отклонений' },
    { id: 'users' as const, label: 'Пользователи' },
  ]

  const nachalnikMenuItems = [
    { id: 'report' as const, label: 'Отчёты' },
    { id: 'deviations' as const, label: 'БД отклонений' },
    { id: 'help' as const, label: 'Цепочки помощи' },
    { id: 'pa' as const, label: 'Бланк ПА' },
  ]

  const menuItems = userRole === 'admin' ? adminMenuItems : nachalnikMenuItems

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Верхний заголовок - фиксированный справа */}
      <header className="fixed top-0 right-0 left-0 bg-white px-6 py-4 z-50 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <span className="text-[14px] font-bold text-black">{userInfo.initials}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-black">{userInfo.name}</span>
              <span className="text-[14px] text-gray-600">{userInfo.role}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Выйти из учётной записи"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Боковое меню */}
      <aside className="w-[296px] h-[400px] ml-[50px] border border-gray-300 bg-white fixed top-[55px] left-0 rounded mt-[55px]">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-[24px] font-bold text-black">Меню</h2>
        </div>
        <nav className="flex flex-col">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-4 py-3 text-[20px] font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-[#9B98FF] text-black'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Основной контент */}
      <main className="ml-[396px] pt-[80px] p-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}

export default Layout

