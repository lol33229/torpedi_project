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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-4 sm:p-6">
        {/* Заголовок с кнопками для планшетов и ПК */}
        <div className="hidden md:flex justify-end items-center mb-6 gap-4">
          {/* Иконка редактирования */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
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
          <button className="bg-white text-black px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
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
          <button className="bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
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
                      <span className="text-[14px] sm:text-[16px] font-medium text-black">
                        {user.role}
                      </span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] sm:text-[16px] font-medium text-black">
                        {user.department}
                      </span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className={`text-[14px] sm:text-[16px] font-medium ${user.status === 'Активен' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] sm:text-[16px] font-medium text-black">
                        {user.login || '-'}
                      </span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] sm:text-[16px] font-medium text-black">
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
    </div>
  )
}

export default Users