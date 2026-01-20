import { useState, useEffect, useRef } from 'react'
import { userApi, catalogApi, type UserResponse, type CatalogValue } from '../services/api'

interface UserSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

const roleNames: Record<string, string> = {
  'Admin': 'Администратор',
  'Nachalnik': 'Начальник',
  'Operator': 'Оператор',
  'Master': 'Мастер'
}

export default function UserSelector({ 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  placeholder = 'Выберите пользователя...'
}: UserSelectorProps) {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Загрузка пользователей
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        let allUsers: UserResponse[] = []
        
        // Сначала пробуем загрузить из API
        try {
          allUsers = await userApi.getAll()
          console.log('UserSelector: Загружено пользователей из API:', allUsers.length)
        } catch (apiError: any) {
          // Если 403 - нет прав (например, для начальника)
          if (apiError.response?.status === 403) {
            console.log('UserSelector: Нет прав на API (403), будет использован справочник')
            allUsers = [] // Устанавливаем пустой массив, чтобы перейти к загрузке из справочника
          } else {
            // Для других ошибок пробрасываем дальше
            throw apiError
          }
        }
        
        // Если API вернул пустой массив (нет прав или нет пользователей), загружаем из справочника
        if (allUsers.length === 0) {
          console.log('UserSelector: API вернул пустой список, загружаем из справочника "ФИО заполняющего"')
          try {
            const catalogs = await catalogApi.getAll()
            console.log('UserSelector: Загружено справочников:', catalogs.length)
            console.log('UserSelector: Названия справочников:', catalogs.map(c => c.title))
            
            const fillerCatalog = catalogs.find(c => 
              c.title === 'ФИО заполняющего' || 
              c.title?.toLowerCase().includes('фио') ||
              c.title?.toLowerCase().includes('заполняющего')
            )
            
            if (fillerCatalog) {
              console.log('UserSelector: Найден справочник "ФИО заполняющего", значений:', fillerCatalog.values?.length || 0)
              
              if (fillerCatalog.values && fillerCatalog.values.length > 0) {
                // Преобразуем значения справочника в формат UserResponse
                allUsers = fillerCatalog.values.map((value: CatalogValue) => ({
                  userName: value.value || '',
                  email: '',
                  roles: [],
                  status: 'Active'
                }))
                console.log('UserSelector: Загружено пользователей из справочника:', allUsers.length)
                console.log('UserSelector: Пользователи из справочника:', allUsers.map(u => u.userName))
              } else {
                console.warn('UserSelector: Справочник "ФИО заполняющего" найден, но пуст')
              }
            } else {
              console.warn('UserSelector: Справочник "ФИО заполняющего" не найден. Доступные справочники:', catalogs.map(c => c.title))
            }
          } catch (catalogError: any) {
            console.error('UserSelector: Ошибка загрузки из справочника:', catalogError)
            console.error('UserSelector: Детали ошибки:', {
              message: catalogError.message,
              status: catalogError.response?.status,
              data: catalogError.response?.data
            })
          }
        }
        
        // Фильтруем только пользователей с userName
        const activeUsers = allUsers.filter(u => {
          const hasUserName = !!u.userName && u.userName.trim() !== ''
          return hasUserName
        })
        
        console.log('UserSelector: Активных пользователей после фильтрации:', activeUsers.length)
        console.log('UserSelector: Пользователи:', activeUsers.map(u => ({ name: u.userName, status: u.status, roles: u.roles })))
        
        setUsers(activeUsers)
        setFilteredUsers(activeUsers)
      } catch (error) {
        console.error('UserSelector: Ошибка загрузки пользователей:', error)
        setUsers([])
        setFilteredUsers([])
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  // Фильтрация пользователей по поисковому запросу и роли
  useEffect(() => {
    let filtered = users

    // Фильтр по роли
    if (selectedRole) {
      filtered = filtered.filter(user => 
        user.roles?.some(role => role === selectedRole)
      )
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(user => 
        user.userName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      )
    }

    console.log('UserSelector: Фильтрация пользователей', {
      totalUsers: users.length,
      selectedRole,
      searchQuery,
      filteredCount: filtered.length
    })
    
    setFilteredUsers(filtered)
  }, [searchQuery, selectedRole, users])

  // Установка значения при открытии
  useEffect(() => {
    if (isOpen && value) {
      setSearchQuery(value)
    } else if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen, value])

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (user: UserResponse) => {
    onChange(user.userName || '')
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    setIsOpen(true)
    
    // Если значение очищено, сбрасываем выбор
    if (!newValue.trim()) {
      onChange('')
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' && filteredUsers.length === 1) {
      handleSelect(filteredUsers[0])
    }
  }

  const availableRoles = Array.from(
    new Set(
      users.flatMap(user => user.roles?.filter((r): r is string => r !== null) || [])
    )
  ).sort()

  const getUserRoleDisplay = (user: UserResponse): string => {
    const roles = user.roles?.filter((r): r is string => r !== null) || []
    if (roles.length === 0) return ''
    return roles.map(r => roleNames[r] || r).join(', ')
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Поле ввода с выпадающим списком */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={`w-full ${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
            Загрузка...
          </div>
        )}

        {/* Выпадающий список */}
        {isOpen && !disabled && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
            {/* Фильтр по роли в выпадающем списке */}
            {availableRoles.length > 0 && (
              <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-2">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value)
                    inputRef.current?.focus()
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                  title="Фильтр по роли"
                >
                  <option value="">Все роли</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {roleNames[role] || role}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {filteredUsers.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {loading ? (
                  'Загрузка пользователей...'
                ) : searchQuery ? (
                  'Пользователи не найдены'
                ) : users.length === 0 ? (
                  'Нет доступных пользователей'
                ) : selectedRole ? (
                  `Нет пользователей с ролью "${roleNames[selectedRole] || selectedRole}"`
                ) : (
                  'Нет доступных пользователей'
                )}
              </div>
            ) : (
              filteredUsers.map((user) => {
                const userName = user.userName || ''
                const roleDisplay = getUserRoleDisplay(user)
                return (
                  <div
                    key={user.email || userName}
                    onClick={() => handleSelect(user)}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                      value === userName ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{userName}</div>
                    {roleDisplay && (
                      <div className="text-xs text-gray-500">{roleDisplay}</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
