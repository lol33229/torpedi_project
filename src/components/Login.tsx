import { useState } from 'react'

export type UserRole = 'admin' | 'nachalnik'

interface LoginProps {
  onLogin: (role: UserRole, userInfo: { name: string; initials: string; role: string }) => void
}

function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Проверка логина и пароля
    // Администратор: Ivanov222 / любой пароль
    if (login.toLowerCase() === 'ivanov222' || login.toLowerCase() === 'иванов222') {
      onLogin('admin', {
        name: 'Иванов И.И.',
        initials: 'ИИ',
        role: 'Администратор'
      })
      return
    }
    
    // Начальник: Petrov / любой пароль или другие данные
    if (login.toLowerCase() === 'petrov' || login.toLowerCase() === 'петров') {
      onLogin('nachalnik', {
        name: 'Петров П.П',
        initials: 'ПП',
        role: 'Начальник'
      })
      return
    }
    
    // По умолчанию - начальник
    onLogin('nachalnik', {
      name: 'Петров П.П',
      initials: 'ПП',
      role: 'Начальник'
    })
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

            <button
              type="submit"
              className="w-full h-[48px] bg-[#2C2C2C] text-white text-[16px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

