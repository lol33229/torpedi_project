import { useState } from 'react'
import { authApi } from '../services/api'
import type { UserInfo } from '../services/api'

export type UserRole = 'admin' | 'nachalnik' | 'operator'

interface LoginProps {
  onLogin: (role: UserRole, userInfo: { name: string; initials: string; role: string }) => void
}

// Функция для преобразования ролей из бэкенда в UserRole
function mapRoleToUserRole(roles: string[]): UserRole {
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

  // По умолчанию - начальник
  return 'nachalnik'
}

// Функция для получения инициалов из имени
function getInitials(userName: string): string {
  const parts = userName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return userName.substring(0, 2).toUpperCase()
}

// Функция для получения названия роли на русском
function getRoleName(role: UserRole): string {
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

function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Выполняем вход через API
      const loginResponse = await authApi.login(login, password)

      // Сохраняем токен, если он есть в ответе
      const token = loginResponse?.accessToken || loginResponse?.token
      if (token) {
        localStorage.setItem('authToken', token)
      } else {
        console.warn('Токен не получен от сервера')
      }

      // Получаем информацию о пользователе
      const userInfo: UserInfo = await authApi.getUserInfo()

      // Проверяем статус пользователя
      // Проблема: обычные пользователи не могут получить список пользователей (403)
      // Решение: проверяем статус, если есть права (админы), иначе полагаемся на бэкенд
      let userStatus: string | null = null
      let statusChecked = false

      try {
        // Пытаемся получить статус через новый метод
        const { authApi: authApiModule } = await import('../services/api')
        userStatus = await authApiModule.getCurrentUserStatus()
        if (userStatus !== null) {
          statusChecked = true
        }
      } catch (statusCheckError: any) {
        // Если не удалось проверить статус (403 - нет прав)
        if (statusCheckError.response?.status === 403) {
          // Обычный пользователь не может получить список пользователей
          // ВАЖНО: Бэкенд должен сам блокировать вход для заблокированных пользователей!
          // Если бэкенд не блокирует - это проблема бэкенда
          console.log('Не удалось проверить статус (нет прав доступа к списку пользователей)')
        } else {
          console.warn('Не удалось проверить статус пользователя:', statusCheckError)
        }
      }

      // Если удалось проверить статус и он Inactive - блокируем вход
      if (statusChecked && userStatus && userStatus.toLowerCase() === 'inactive') {
        localStorage.removeItem('authToken')
        setError('Учетная запись заблокирована')
        setLoading(false)
        return
      }

      // Если не удалось проверить статус (обычный пользователь), продолжаем вход
      // ВАЖНО: Бэкенд должен сам блокировать вход для заблокированных пользователей!
      // На фронтенде мы можем проверить статус только для админов

      const userRole = mapRoleToUserRole(userInfo.roles || [])
      const initials = getInitials(userInfo.userName)
      const roleName = getRoleName(userRole)

      onLogin(userRole, {
        name: userInfo.userName,
        initials: initials,
        role: roleName
      })
    } catch (err: any) {
      console.error('Ошибка входа:', err)

      // Обработка ошибок
      if (err.response) {
        const status = err.response.status
        const errorData = err.response.data

        if (status === 401) {
          const errorMessage = errorData?.message || errorData?.title || 'Неверный логин или пароль'
          setError(`Неверный логин или пароль. ${errorMessage}`)
        } else if (status === 400) {
          const errorMessage = errorData?.message || errorData?.title || 'Неверный формат данных'
          setError(errorMessage)
        } else if (status >= 500) {
          setError('Ошибка сервера. Попробуйте позже')
        } else {
          setError(errorData?.message || errorData?.title || 'Ошибка при входе')
        }
      } else if (err.request) {
        setError('Не удалось подключиться к серверу. Проверьте, что бэкенд запущен')
      } else {
        setError('Произошла ошибка при входе')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <h1 className="text-[48px] font-bold text-[#2C2C2C] text-center mb-8" style={{ lineHeight: '120%', letterSpacing: '-3%' }}>
          Вход в систему
        </h1>

        <div className="bg-gray-100 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[16px] font-medium text-[#2C2C2C] mb-2">
                Логин
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full h-[48px] px-4 rounded-lg border-2 border-gray-300 bg-white text-[16px] text-[#2C2C2C] focus:outline-none focus:border-gray-400"
                placeholder="Введите логин"
              />
            </div>

            <div>
              <label className="block text-[16px] font-medium text-[#2C2C2C] mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[48px] px-4 rounded-lg border-2 border-gray-300 bg-white text-[16px] text-[#2C2C2C] focus:outline-none focus:border-gray-400"
                placeholder="Введите пароль"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-[14px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !login.trim() || !password.trim()}
              className="w-full h-[48px] bg-[#2C2C2C] text-white text-[16px] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

