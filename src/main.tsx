import { StrictMode, useState } from 'react'
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

registerSW({ immediate: true })

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('admin')
  const [userInfo, setUserInfo] = useState({ name: 'Иванов И.И.', initials: 'ИИ', role: 'Администратор' })
  const [currentPage, setCurrentPage] = useState<'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users'>('report')
  const [selectedDirectory, setSelectedDirectory] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)

  const handleNavigate = (page: 'report' | 'book' | 'help' | 'pa' | 'deviations' | 'users') => {
    setCurrentPage(page)
    setIsEditing(false)
  }

  const handleLogin = (role: UserRole, info: { name: string; initials: string; role: string }) => {
    setUserRole(role)
    setUserInfo(info)
    setIsAuthenticated(true)
    setCurrentPage('report')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole('admin')
    setUserInfo({ name: 'Иванов И.И.', initials: 'ИИ', role: 'Администратор' })
  }

  const renderContent = () => {
    if (isEditing) {
      return (
        <EditDirectory
          directoryName={selectedDirectory}
          onBack={() => setIsEditing(false)}
        />
      )
    }

    switch (currentPage) {
      case 'book':
        if (userRole === 'admin') {
          return (
            <Book
              onEditDirectory={(directoryName) => {
                setSelectedDirectory(directoryName)
                setIsEditing(true)
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
          ? <Book onEditDirectory={(name) => { setSelectedDirectory(name); setIsEditing(true) }} />
          : <ReportNachalnik />
    }
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
