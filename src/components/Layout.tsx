import type { ReactNode } from 'react'
import type { UserRole } from './Login'
import { useState, useEffect } from 'react'

interface LayoutProps {
  children: ReactNode
  currentPage: 'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users'
  onNavigate: (page: 'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users') => void
  onLogout: () => void
  userRole: UserRole
  userInfo: { name: string; initials: string; role: string }
}

function Layout({ children, currentPage, onNavigate, onLogout, userRole, userInfo }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false)
  const [menuAnimationClass, setMenuAnimationClass] = useState('')

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

  const handleNavigate = (pageId: 'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users') => {
    onNavigate(pageId)
    closeMenu()
  }

  const openMenu = () => {
    setShouldRenderMenu(true)
    // Небольшая задержка чтобы DOM успел отрендерить элемент перед анимацией
    setTimeout(() => {
      setMenuAnimationClass('opacity-100 translate-y-0')
      setIsMenuOpen(true)
    }, 10)
  }

  const closeMenu = () => {
    setMenuAnimationClass('opacity-0 -translate-y-4')
    setIsMenuOpen(false)
    // Ждем завершения анимации перед удалением из DOM
    setTimeout(() => {
      setShouldRenderMenu(false)
    }, 300)
  }


  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen &&
        !(event.target as Element).closest('.burger-menu-container') &&
        !(event.target as Element).closest('.burger-button')) {
        closeMenu()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Верхний заголовок */}
      <header className="fixed top-0 right-0 left-0 bg-white px-6 py-4 z-50 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <span className="text-[14px] font-bold text-gray opacity-90">{userInfo.initials}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-gray opacity-70 ">{userInfo.name}</span>
                <span className="text-[14px] font-light opacity-50 text-gray-600">{userInfo.role}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-3 hover:bg-gray-100 rounded transition-colors"
              title="Выйти из учётной записи"
            >
              <svg
                width="28"
                height="28"
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
        </div>
      </header>

      {/* Кнопка бургер-меню */}
      {!isMenuOpen && (
        <button
          onClick={openMenu}
          className="lg:hidden fixed top-[90px] left-7 md:left-9  burger-button p-3 hover:bg-gray-50 transition-all duration-300 z-40"
          aria-label="Открыть меню"
        >
          {/* Контейнер для полосок */}
          <div className="w-6 flex flex-col gap-[5px]">
            <span className="block h-0.5 w-6 bg-black rounded-sm"></span>
            <span className="block h-0.5 w-6 bg-black rounded-sm"></span>
            <span className="block h-0.5 w-6 bg-black rounded-sm"></span>
          </div>
        </button>
      )}

      {/* Меню для планшетов */}
      {/* Рендерится только когда shouldRenderMenu = true */}
      {shouldRenderMenu && (
        <div className="lg:hidden fixed z-30 burger-menu-container">
          <aside className={`
            absolute w-[200px] border-[3px] border-gray-300 bg-white top-[70px] left-10 md:left-12 rounded-lg z-40 shadow-lg
            transition-all duration-300 ease-out
            opacity-0 -translate-y-4
            ${menuAnimationClass}
          `}>
            <div className="p-2  border-gray-300 flex items-center justify-between">
              <h2 className="text-[16px] pt-[3px] pl-[3px] font-bold text-black">Меню</h2>
              {/* Кнопка закрытия меню */}
              <button
                onClick={closeMenu}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Закрыть меню"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-600"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="h-[1px] bg-gray-300 w-[170px] mx-auto"></div>
            <nav className="flex flex-col">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full text-left px-3 pr-2 py-2 text-[16px] font-normal transition-colors ${currentPage === item.id
                    ? 'bg-[#D9D9D9] text-black'
                    : 'text-black hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Десктопное меню */}
      <aside className="hidden lg:block w-[296px] border border-gray-300 bg-white fixed top-[55px] left-0 rounded mt-[55px] ml-[50px]">
        <div className="p-2">
          <h2 className="text-[24px] font-bold pt-2 pl-2 text-black">Меню</h2>
        </div>
        <div className="h-[1px] bg-gray-300 w-[250px] mx-auto"></div>
        <nav className="flex flex-col">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-4 py-3 text-[20px] font-medium transition-colors ${currentPage === item.id
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
      <main className="lg:ml-[396px] pt-[80px] mt-10 p-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}

export default Layout