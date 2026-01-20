import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Layout from './components/Layout.tsx'
import Login, { type UserRole } from './components/Login.tsx'
import Book from './admin/book.tsx'
import EditDirectory from './admin/editDirectory.tsx'
import Users from './admin/users.tsx'
import Help from './admin/help.tsx'
import ReportAdmin from './admin/report.tsx'
import ReportNachalnik from './nachalnik/report.tsx'
import PAAdmin from './admin/pa.tsx'
import PANachalnik from './nachalnik/pa.tsx'
import Operator from './operator/operator.tsx'
import { registerSW } from 'virtual:pwa-register'
import { authApi } from './services/api'

registerSW({ immediate: true })

// Ключи для localStorage
const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'isAuthenticated',
  USER_ROLE: 'userRole',
  USER_INFO: 'userInfo',
  CURRENT_PAGE: 'currentPage'
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('admin')
  const [userInfo, setUserInfo] = useState({ name: 'Иванов И.И.', initials: 'ИИ', role: 'Администратор' })
  const [currentPage, setCurrentPage] = useState<'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users'>('report')
  const [selectedDirectory, setSelectedDirectory] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  // Вспомогательные функции для работы с ролями (вынесены до useEffect)
  const mapRoleToUserRole = (roles: string[]): UserRole => {
    const rolesLower = roles.map(r => r?.toLowerCase() || '')

    if (rolesLower.some(r => r.includes('admin') || r.includes('администратор'))) {
      return 'admin'
    }
    if (rolesLower.some(r => r.includes('nachalnik') || r.includes('начальник') || r.includes('manager'))) {
      return 'nachalnik'
    }
    if (rolesLower.some(r => r.includes('operator') || r.includes('оператор'))) {
      return 'operator'
    }

    return 'nachalnik'
  }

  const getInitials = (userName: string): string => {
    const parts = userName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return userName.substring(0, 2).toUpperCase()
  }

  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'nachalnik':
        return 'Начальник'
      case 'operator':
        return 'Оператор'
      default:
        return 'Пользователь'
    }
  }

  // Восстановление сессии при загрузке
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED)

        if (savedAuth === 'true') {
          // Пытаемся получить информацию о пользователе из API
          try {
            const userInfoFromApi = await authApi.getUserInfo()

            // Проверяем статус пользователя (если есть доступ к списку пользователей)
            try {
              const { authApi: authApiModule } = await import('./services/api')
              const userStatus = await authApiModule.getCurrentUserStatus()

              // Если удалось получить статус и пользователь заблокирован - очищаем сессию
              if (userStatus !== null && userStatus.toLowerCase() === 'inactive') {
                localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED)
                localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
                localStorage.removeItem(STORAGE_KEYS.USER_INFO)
                localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE)
                localStorage.removeItem('authToken')
                setIsLoadingSession(false)
                return
              }
            } catch (statusCheckError: any) {
              // Если не удалось проверить статус (403 - нет прав), продолжаем
              // Это нормально для обычных пользователей
            }

            const savedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole
            const savedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
            const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE) as typeof currentPage

            if (savedRole && savedUserInfo) {
              const parsedUserInfo = JSON.parse(savedUserInfo)
              setUserRole(savedRole)
              setUserInfo(parsedUserInfo)
              setIsAuthenticated(true)
              if (savedPage) {
                setCurrentPage(savedPage)
              }
            } else {
              // Если нет сохраненных данных, но API работает - восстанавливаем из API
              const userRole = mapRoleToUserRole(userInfoFromApi.roles || [])
              const initials = getInitials(userInfoFromApi.userName)
              const roleName = getRoleName(userRole)

              setUserRole(userRole)
              setUserInfo({
                name: userInfoFromApi.userName,
                initials: initials,
                role: roleName
              })
              setIsAuthenticated(true)
            }
          } catch (error) {
            // Если API не отвечает, очищаем сессию
            console.error('Ошибка восстановления сессии:', error)
            localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED)
            localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
            localStorage.removeItem(STORAGE_KEYS.USER_INFO)
            localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE)
            localStorage.removeItem('authToken')
            setIsAuthenticated(false)
          }
        } else {
          // Нет сохраненной сессии - просто показываем форму входа
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Ошибка при восстановлении сессии:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoadingSession(false)
      }
    }

    restoreSession()
  }, [])


  const handleNavigate = (page: 'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users') => {
    setCurrentPage(page)
    setIsEditing(false)
  }

  const handleLogin = (role: UserRole, info: { name: string; initials: string; role: string }) => {
    setUserRole(role)
    setUserInfo(info)
    setIsAuthenticated(true)
    setCurrentPage('report')

    // Сохраняем сессию в localStorage
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true')
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role)
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(info))
    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, 'report')
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      setIsAuthenticated(false)
      setUserRole('admin')
      setUserInfo({ name: 'Иванов И.И.', initials: 'ИИ', role: 'Администратор' })

      // Очищаем сессию из localStorage
      localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED)
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE)
      localStorage.removeItem('authToken') // Удаляем токен
    }
  }

  // Сохраняем текущую страницу при изменении
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage)
    }
  }, [currentPage, isAuthenticated])

  const renderContent = () => {
    if (isEditing) {
      return (
        <EditDirectory
          directoryName={selectedDirectory}
          onBack={() => {
            setIsEditing(false)
            localStorage.removeItem('editingCatalogId')
          }}
        />
      )
    }

    switch (currentPage) {
      case 'book':
        if (userRole === 'admin') {
          return (
            <Book
              onEditDirectory={(directoryName, catalogId) => {
                setSelectedDirectory(directoryName)
                setIsEditing(true)
                // Сохраняем catalogId для EditDirectory
                localStorage.setItem('editingCatalogId', catalogId.toString())
              }}
            />
          )
        }
        return <ReportNachalnik />
      case 'users':
        if (userRole === 'admin') {
          return <Users />
        }
        return <ReportNachalnik />
      case 'help':
        return <Help />
      case 'report':
        return userRole === 'admin' ? <ReportAdmin /> : <ReportNachalnik />
      case 'pa':
        return userRole === 'admin' ? <PAAdmin /> : <PANachalnik />
      case 'deviations':
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-[24px] text-gray-600">Страница "БД отклонений" в разработке</p>
          </div>
        )
      default:
        return userRole === 'admin'
          ? <Book onEditDirectory={(name, catalogId) => {
            setSelectedDirectory(name)
            setIsEditing(true)
            localStorage.setItem('editingCatalogId', catalogId.toString())
          }} />
          : <ReportNachalnik />
    }
  }

  // Показываем загрузку при восстановлении сессии
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[16px] text-gray-600">Загрузка...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // Если роль оператора, показываем специальную страницу без Layout
  if (userRole === 'operator') {
    return <Operator userInfo={userInfo} onLogout={handleLogout} />
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userRole={userRole}
      userInfo={userInfo}
    >
      {renderContent()}
    </Layout>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
