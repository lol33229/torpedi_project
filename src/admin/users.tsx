import { useState, useEffect } from 'react'
import { userApi, type UserResponse } from '../services/api'

type SortField = 'name' | 'role' | 'department' | 'status' | 'login' | 'password' | null
type SortDirection = 'asc' | 'desc' | null

interface User {
  id: string
  name: string
  role: string
  department: string
  status: string
  login: string
  password: string
}

function Users() {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Загрузка пользователей
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userApi.getAll()
      
      // Преобразуем данные из API в формат для отображения
      const formattedUsers: User[] = data.map((user: UserResponse) => {
        // Преобразуем роли в строку
        const roles = user.roles?.filter(r => r) || []
        const roleNames: Record<string, string> = {
          'Admin': 'Администратор',
          'Nachalnik': 'Начальник',
          'Operator': 'Оператор',
          'Master': 'Мастер'
        }
        const roleStr = roles.map(r => roleNames[r || ''] || r).join(', ') || '-'
        
        // Преобразуем статус
        // API возвращает "Inactive" по умолчанию для новых пользователей
        // Это нормально - пользователи создаются неактивными и их нужно активировать
        const statusValue = (user.status || '').toLowerCase()
        const status = statusValue === 'active' ? 'Активен' : 'Заблокирован'
        
        return {
          id: user.email || '', // Используем email как id
          name: user.userName || '-',
          role: roleStr,
          department: '-', // Подразделение не приходит из API
          status: status,
          login: user.email || '-',
          password: 'Скрыт', // Пароль не показываем по соображениям безопасности
        }
      })
      
      setUsers(formattedUsers)
    } catch (err: any) {
      console.error('Ошибка загрузки пользователей:', err)
      setError('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }

  // Преобразование роли из русского в английский
  const mapRoleToEnglish = (role: string): string => {
    const roleMap: Record<string, string> = {
      'Администратор': 'Admin',
      'Начальник': 'Nachalnik',
      'Оператор': 'Operator',
      'Мастер': 'Master'
    }
    return roleMap[role] || role
  }

  // Изменение роли пользователя
  const handleChangeRole = async (userEmail: string, newRole: string) => {
    try {
      const englishRole = mapRoleToEnglish(newRole)
      console.log('Changing role:', { userEmail, newRole, englishRole })
      await userApi.changeRole(userEmail, englishRole)
      console.log('Role changed successfully')
      await loadUsers() // Перезагружаем список
    } catch (err: any) {
      console.error('Ошибка изменения роли:', err)
      let errorMsg = 'Не удалось изменить роль пользователя'
      
      if (err.response) {
        const status = err.response.status
        if (status === 403) {
          errorMsg = 'Недостаточно прав для изменения роли. Убедитесь, что вы вошли как администратор.'
        } else if (status === 404) {
          errorMsg = 'Пользователь не найден'
        } else if (status === 400) {
          errorMsg = err.response.data?.message || 'Неверный запрос'
        } else {
          errorMsg = err.response.data?.message || err.response.data?.title || errorMsg
        }
      } else if (err.message) {
        errorMsg = err.message
      }
      
      alert(errorMsg)
    }
  }

  // Изменение статуса пользователя
  const handleChangeStatus = async (userEmail: string, currentStatus: string) => {
    try {
      // Проверяем, не пытаемся ли заблокировать админа
      const user = users.find(u => u.login === userEmail)
      if (user && user.role.includes('Администратор') && currentStatus === 'Активен') {
        alert('Нельзя заблокировать администратора')
        return
      }
      
      // API ожидает statusId: 1 = Active, 2 = Inactive (или наоборот)
      // Если текущий статус "Активен", меняем на Inactive (2), иначе на Active (1)
      const newStatusId = currentStatus === 'Активен' ? 2 : 1
      await userApi.changeStatus(userEmail, newStatusId)
      await loadUsers() // Перезагружаем список
    } catch (err: any) {
      console.error('Ошибка изменения статуса:', err)
      let errorMsg = err.response?.data?.message || err.message || 'Не удалось изменить статус пользователя'
      
      // Проверяем, не заблокировали ли админа
      if (err.response?.status === 400) {
        const responseText = JSON.stringify(err.response?.data || '')
        if (responseText.includes('admin') || responseText.includes('админ') || responseText.includes('Admin')) {
          errorMsg = 'Нельзя заблокировать администратора'
        }
      }
      
      alert(errorMsg)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedUsers = sortField && sortDirection
    ? [...users].sort((a, b) => {
      const aValue = String(a[sortField] || '')
      const bValue = String(b[sortField] || '')

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue, 'ru')
      } else {
        return bValue.localeCompare(aValue, 'ru')
      }
    })
    : users

  // Обработка добавления пользователя
  const handleAddUser = () => {
    setShowAddModal(true)
  }

  // Обработка регистрации нового пользователя
  const handleRegisterUser = async (userName: string, email: string, password: string) => {
    try {
      const { authApi, catalogApi } = await import('../services/api')
      await authApi.register(userName, email, password)
      
      // Добавляем пользователя в справочник "ФИО заполняющего"
      try {
        const catalogs = await catalogApi.getAll()
        const fillerCatalog = catalogs.find(c => 
          c.title === 'ФИО заполняющего' || 
          c.title?.toLowerCase().includes('фио') ||
          c.title?.toLowerCase().includes('заполняющего')
        )
        
        if (fillerCatalog && fillerCatalog.id) {
          // Проверяем, нет ли уже такого значения в справочнике
          const existingValue = fillerCatalog.values?.find(v => v.value === userName)
          if (!existingValue) {
            await catalogApi.addValue(fillerCatalog.id, userName)
            console.log(`Пользователь "${userName}" добавлен в справочник "ФИО заполняющего"`)
          } else {
            console.log(`Пользователь "${userName}" уже есть в справочнике "ФИО заполняющего"`)
          }
        } else {
          console.warn('Справочник "ФИО заполняющего" не найден, пользователь не добавлен в справочник')
        }
      } catch (catalogError: any) {
        console.error('Ошибка добавления пользователя в справочник:', catalogError)
        // Не прерываем процесс, если не удалось добавить в справочник
      }
      
      setShowAddModal(false)
      await loadUsers() // Перезагружаем список
    } catch (err: any) {
      console.error('Ошибка регистрации:', err)
      alert('Не удалось зарегистрировать пользователя')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-black opacity-30"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
    if (sortDirection === 'asc') {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-black"
        >
          <path
            d="M18 15L12 9L6 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    } else {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-black"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6">
          <div className="text-center py-8">
            <span className="text-[16px] text-gray-600">Загрузка...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6">
          <div className="text-center py-8">
            <span className="text-[16px] text-red-600">{error}</span>
            <button
              onClick={loadUsers}
              className="mt-4 bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-4 sm:p-6">
        {/* Заголовок с кнопками для планшетов и ПК */}
        <div className="hidden md:flex justify-end items-center mb-6 gap-4">
          {/* Иконка редактирования */}
          <button
            onClick={() => setEditingUser(editingUser ? null : 'all')}
            className={`p-2 rounded-lg transition-colors border ${
              editingUser ? 'bg-gray-200 border-gray-400' : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black"
            >
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Кнопка Добавить */}
          <button
            onClick={handleAddUser}
            className="bg-white text-black px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold">Добавить</span>
          </button>
        </div>

        {/* Мобильный заголовок */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black"
              >
                <path
                  d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={handleAddUser}
            className="bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold text-sm">Добавить</span>
          </button>
        </div>

        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-2 border-gray-300 text-center py-3">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[14px] sm:text-[16px] font-semibold text-black">ФИО</span>
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="border-2 border-gray-300 text-center py-3">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[14px] sm:text-[16px] font-semibold text-black">Роль</span>
                      {getSortIcon('role')}
                    </button>
                  </th>
                  <th className="border-2 border-gray-300 text-center py-3">
                    <button
                      onClick={() => handleSort('department')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[14px] sm:text-[16px] font-semibold text-black">Подразделение</span>
                      {getSortIcon('department')}
                    </button>
                  </th>
                  <th className="border-2 border-gray-300 text-center py-3">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[14px] sm:text-[16px] font-semibold text-black">Статус</span>
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="border-2 border-gray-300 text-center py-3">
                    <button
                      onClick={() => handleSort('login')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[14px] sm:text-[16px] font-semibold text-black">Логин</span>
                      {getSortIcon('login')}
                    </button>
                  </th>
                  <th className="border-2 border-gray-300 text-center py-3">
                    <button
                      onClick={() => handleSort('password')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[14px] sm:text-[16px] font-semibold text-black">Пароль</span>
                      {getSortIcon('password')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] sm:text-[16px] font-medium text-black">
                        {user.name}
                      </span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      {editingUser === user.id || editingUser === 'all' ? (
                        <select
                          value={user.role.split(', ')[0] || user.role}
                          onChange={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const newRole = e.target.value
                            console.log('Role select changed:', { userEmail: user.login, currentRole: user.role, newRole })
                            await handleChangeRole(user.login, newRole)
                          }}
                          className="text-[14px] sm:text-[16px] font-medium text-black border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="Администратор">Администратор</option>
                          <option value="Начальник">Начальник</option>
                          <option value="Оператор">Оператор</option>
                          <option value="Мастер">Мастер</option>
                        </select>
                      ) : (
                        <span className="text-[14px] sm:text-[16px] font-medium text-black">
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] sm:text-[16px] font-medium text-black">
                        {user.department}
                      </span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      {editingUser === user.id || editingUser === 'all' ? (
                        // Запрещаем блокировку админа
                        user.role.includes('Администратор') && user.status === 'Активен' ? (
                          <button
                            disabled
                            className="text-[14px] sm:text-[16px] font-medium px-3 py-1 rounded bg-gray-200 text-gray-500 cursor-not-allowed"
                            title="Нельзя заблокировать администратора"
                          >
                            Заблокировать
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeStatus(user.login, user.status)}
                            className={`text-[14px] sm:text-[16px] font-medium px-3 py-1 rounded ${
                              user.status === 'Активен'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {user.status === 'Активен' ? 'Заблокировать' : 'Активировать'}
                          </button>
                        )
                      ) : (
                        <span className={`text-[14px] sm:text-[16px] font-medium ${user.status === 'Активен' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {user.status}
                        </span>
                      )}
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] sm:text-[16px] font-medium text-black">
                        {user.login || '-'}
                      </span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] sm:text-[16px] font-medium text-gray-500 italic">
                        {user.password || 'Скрыт'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальное окно добавления пользователя */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onRegister={handleRegisterUser}
        />
      )}
    </div>
  )
}

// Компонент модального окна для добавления пользователя
function AddUserModal({
  onClose,
  onRegister,
}: {
  onClose: () => void
  onRegister: (userName: string, email: string, password: string) => void
}) {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName || !email || !password) {
      alert('Заполните все поля')
      return
    }
    setLoading(true)
    try {
      await onRegister(userName, email, password)
      setUserName('')
      setEmail('')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Добавить пользователя</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ФИО (без пробелов)</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="ИвановИИ"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Минимум 8 символов, спецсимвол, буквы и цифры"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Минимум 8 символов, спецсимвол, строчные и заглавные буквы, цифры
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Users