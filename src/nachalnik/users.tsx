interface UsersProps {
  onBack: () => void
}

function Users({ onBack }: UsersProps) {
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
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-[32px] font-extrabold text-[#000000] mb-6">
            Список пользователей
          </h1>

          <div className="border-[1px] border-black overflow-hidden">
            <table className="w-full border-collapse ">
              <thead>
                <tr className="bg-white">
                  <th className="border-[2px] border-black px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-medium text-[#000000]">ФИО</span>
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
                    </div>
                  </th>
                  <th className="border-[2px] border-black px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-medium text-[#000000]">Роль</span>
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
                    </div>
                  </th>
                  <th className="border-[2px] border-black px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-medium text-[#000000]">Подразделение</span>
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
                    </div>
                  </th>
                  <th className="border-[2px] border-black px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-medium text-[#000000]">Статус</span>
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
                    </div>
                  </th>
                  <th className="border-[2px] border-black px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-medium text-[#000000]">Логин</span>
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
                    </div>
                  </th>
                  <th className="border-[2px] border-black px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-medium text-[#000000]">Пароль</span>
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
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-white">
                    <td className="border-[2px] border-black px-4 py-3">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.name}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.role}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.department}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.status}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3">
                      <span className="text-[24px] font-medium text-[#000000]">
                        {user.login}
                      </span>
                    </td>
                    <td className="border-[2px] border-black px-4 py-3">
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

