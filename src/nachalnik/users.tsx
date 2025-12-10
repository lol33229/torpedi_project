import { useState } from 'react'

interface UsersProps {
  onBack: () => void
}

type SortField = 'name' | 'role' | 'department' | 'status' | 'login' | 'password' | null
type SortDirection = 'asc' | 'desc' | null

function Users({ onBack }: UsersProps) {
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
    <div className="min-h-screen bg-white text-slate-900">
      <header className="bg-[#9B98FF] px-4 py-3 mb-[55px]">
        <div className="mx-auto flex w-full items-center justify-start gap-4">
          <div className="flex items-center gap-4 ml-[110px]">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[32px] font-semibold text-[#000000]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Назад
            </button>
          </div>
          <span className="text-[32px] font-medium text-[#000000] ml-[70px]">
            Пользователи
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-col gap-6 px-4 py-6">
        <div className="mx-auto w-full ">
          <h1 className="text-[32px] font-extrabold text-[#000000] mb-6 ml-[114px] ">
            Список пользователей
          </h1>

          <div className="border-[1px] border-black overflow-hidden mx-[84px]">
            <table className="w-full border-collapse ">
              <thead>
                <tr className="bg-white">
                  <th className="border-[2px] border-black text-center py-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[24px] font-medium text-[#000000]">ФИО</span>
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="border-[2px] border-black text-center">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[24px] font-medium text-[#000000]">Роль</span>
                      {getSortIcon('role')}
                    </button>
                  </th>
                  <th className="border-[2px] border-black text-center">
                    <button
                      onClick={() => handleSort('department')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[24px] font-medium text-[#000000]">Подразделение</span>
                      {getSortIcon('department')}
                    </button>
                  </th>
                  <th className="border-[2px] border-black text-center">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[24px] font-medium text-[#000000]">Статус</span>
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="border-[2px] border-black text-center">
                    <button
                      onClick={() => handleSort('login')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[24px] font-medium text-[#000000]">Логин</span>
                      {getSortIcon('login')}
                    </button>
                  </th>
                  <th className="border-[2px] border-black text-center">
                    <button
                      onClick={() => handleSort('password')}
                      className="flex items-center justify-center gap-2 w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[24px] font-medium text-[#000000]">Пароль</span>
                      {getSortIcon('password')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="bg-white">
                    <td className="border-[2px] border-black px-4 py-3 text-center">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.name}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3 text-center">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.role}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3 text-center">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.department}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3 text-center">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.status}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3 text-center">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.login}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3 text-center">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.password}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Users

