import { useState } from 'react'

type SortField = 'name' | 'role' | 'department' | 'status' | 'login' | 'password' | null
type SortDirection = 'asc' | 'desc' | null

function Users() {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const users = [
    {
      id: 1,
      name: 'Иванов Иван Иванович',
      role: 'Оператор',
      department: 'Участок*',
      status: 'Активен',
      login: '',
      password: '',
    },
    {
      id: 2,
      name: 'Петров Петр Петрович',
      role: 'Администратор',
      department: 'Все',
      status: 'Активен',
      login: '',
      password: '',
    },
    {
      id: 3,
      name: 'Мрова Мария Ивановна',
      role: 'Оператор',
      department: 'Участок*',
      status: 'Заблокирован',
      login: '',
      password: '',
    },
  ]

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

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg border-2 border-[#9B98FF] p-6">
        <h1 className="text-[24px] font-bold text-black mb-6">
          Список пользователей
        </h1>

        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-gray-300 text-center py-3">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                  >
                    <span className="text-[16px] font-semibold text-black">ФИО</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="border-2 border-gray-300 text-center py-3">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                  >
                    <span className="text-[16px] font-semibold text-black">Роль</span>
                    {getSortIcon('role')}
                  </button>
                </th>
                <th className="border-2 border-gray-300 text-center py-3">
                  <button
                    onClick={() => handleSort('department')}
                    className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                  >
                    <span className="text-[16px] font-semibold text-black">Подразделение</span>
                    {getSortIcon('department')}
                  </button>
                </th>
                <th className="border-2 border-gray-300 text-center py-3">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                  >
                    <span className="text-[16px] font-semibold text-black">Статус</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="border-2 border-gray-300 text-center py-3">
                  <button
                    onClick={() => handleSort('login')}
                    className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                  >
                    <span className="text-[16px] font-semibold text-black">Логин</span>
                    {getSortIcon('login')}
                  </button>
                </th>
                <th className="border-2 border-gray-300 text-center py-3">
                  <button
                    onClick={() => handleSort('password')}
                    className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                  >
                    <span className="text-[16px] font-semibold text-black">Пароль</span>
                    {getSortIcon('password')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="border-2 border-gray-300 px-4 py-3 text-center">
                    <span className="text-[16px] font-medium text-black">
                      {user.name}
                    </span>
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 text-center">
                    <span className="text-[16px] font-medium text-black">
                      {user.role}
                    </span>
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 text-center">
                    <span className="text-[16px] font-medium text-black">
                      {user.department}
                    </span>
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 text-center">
                    <span className={`text-[16px] font-medium ${
                      user.status === 'Активен' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 text-center">
                    <span className="text-[16px] font-medium text-black">
                      {user.login || '-'}
                    </span>
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 text-center">
                    <span className="text-[16px] font-medium text-black">
                      {user.password || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users

