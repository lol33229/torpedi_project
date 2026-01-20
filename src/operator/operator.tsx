import { useState, useEffect } from 'react'
import EditPA from '../admin/editPA'
import { paBlankApi } from '../services/api'
import type { PABlank } from '../services/api'

interface OperatorProps {
  userInfo: { name: string; initials: string; role: string }
  onLogout: () => void
}

function Operator({ userInfo, onLogout }: OperatorProps) {
  const [showDataEntry, setShowDataEntry] = useState(false)
  const [selectedBlankId, setSelectedBlankId] = useState<number | undefined>(undefined)
  const [blanks, setBlanks] = useState<PABlank[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const departments = [
    'Участок 1',
    'Участок 2',
    'Участок 3',
  ]

  const shifts = ['Ранняя', 'Поздняя', 'Ночная']

  // Загрузка бланков для текущего оператора (фильтрация по ФИО)
  const loadBlanks = async () => {
    try {
      setLoading(true)
      const allBlanks = await paBlankApi.getAll()
      // Фильтруем бланки по ФИО заполняющего (должно совпадать с именем оператора)
      const operatorBlanks = allBlanks.filter(blank =>
        blank.fillerName && blank.fillerName.trim() === userInfo.name.trim()
      )
      setBlanks(operatorBlanks)
    } catch (error) {
      console.error('Ошибка загрузки бланков:', error)
      setBlanks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlanks()
  }, [userInfo.name])

  const handleApply = () => {
    // Здесь будет логика применения фильтров
    console.log('Применение фильтров:', { selectedDepartment, selectedShift, day, month, year })
  }

  const handleStartDataEntry = (blankId?: number) => {
    // Если есть бланки, используем первый, иначе открываем пустой
    if (blankId) {
      setSelectedBlankId(blankId)
    } else if (blanks.length > 0) {
      // Используем первый доступный бланк
      setSelectedBlankId(blanks[0].id)
    } else {
      setSelectedBlankId(undefined)
    }
    setShowDataEntry(true)
  }

  if (showDataEntry) {
    // Если есть selectedBlankId, используем его, иначе берем первый бланк
    const targetBlankId = selectedBlankId || (blanks.length > 0 ? blanks[0].id : undefined)
    console.log('Operator: showDataEntry=true, selectedBlankId:', selectedBlankId, 'targetBlankId:', targetBlankId, 'blanks:', blanks.map(b => ({ id: b.id, blankNumber: b.blankNumber })))
    const blank = blanks.find(b => b.id === targetBlankId)
    
    if (!targetBlankId || targetBlankId === 0) {
      console.log('Operator: targetBlankId невалиден:', targetBlankId)
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Бланк не выбран</p>
            <button
              onClick={() => {
                setShowDataEntry(false)
                setSelectedBlankId(undefined)
              }}
              className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
            >
              Назад
            </button>
          </div>
        </div>
      )
    }
    
    if (!blank && targetBlankId) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Бланк не найден в списке</p>
            <button
              onClick={() => {
                setShowDataEntry(false)
                setSelectedBlankId(undefined)
              }}
              className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
            >
              Назад
            </button>
          </div>
        </div>
      )
    }
    
    // Убеждаемся, что targetBlankId - это число
    const validBlankId = typeof targetBlankId === 'number' && targetBlankId > 0 ? targetBlankId : 0
    console.log('Operator: Передаем в EditPA, validBlankId:', validBlankId, 'blankNumber:', blank?.blankNumber)
    
    return (
      <EditPA
        blankId={validBlankId}
        blankNumber={blank?.blankNumber || 1}
        onBack={() => {
          setShowDataEntry(false)
          setSelectedBlankId(undefined)
          loadBlanks() // Обновляем список после возврата
        }}
        isOperator={true}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Верхний заголовок - фиксированный справа */}
      <header className="fixed top-0 right-0 left-0 bg-white px-6 py-4 z-50 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <span className="text-[14px] font-bold text-gray opacity-90">{userInfo.initials}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-gray opacity-70 ">{userInfo.name}</span>
                <span className="text-[14px] font-light opacity-50 text-gray-600">{userInfo.role}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-3 hover:bg-gray-100 rounded transition-colors"
              title="Выйти из учётной записи"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="pt-[80px] p-6">
        <div className="bg-white rounded-lg p-6 max-w-5xl mx-auto">
          {/* Секция фильтров */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start gap-8 mb-4">
              {/* Группа: Подразделение и Смена — теперь занимает 50% ширины */}
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center w-full md:w-1/2">

                {/* Подразделение */}
                <label className="text-[16px] font-semibold text-black whitespace-nowrap justify-self-end">
                  Подразделение:
                </label>
                <div className="relative w-full">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
                  >
                    <option value="" disabled>Выберите подразделение</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#9B98FF]">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Смена */}
                <label className="text-[16px] font-semibold text-black whitespace-nowrap justify-self-end">
                  Смена:
                </label>
                <div className="relative w-full">
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
                  >
                    <option value="" disabled>Выберите смену</option>
                    {shifts.map((shift) => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#9B98FF]">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Дата (теперь будет располагаться справа от блока 50%) */}
              <div className="flex items-center gap-3 mt-1">
                <label className="text-[16px] font-semibold text-black whitespace-nowrap">
                  Дата:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    placeholder="дд"
                    maxLength={2}
                    className="w-[60px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
                  />
                  <input
                    type="text"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="мм"
                    maxLength={2}
                    className="w-[60px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
                  />
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="гггг"
                    maxLength={4}
                    className="w-[80px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
                  />
                </div>
              </div>
            </div>

            {/* Контейнер для кнопки справа внизу */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleApply}
                className="h-[30px] px-4 pt-[1px] bg-[#2C2C2C] text-white text-[14px] font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                Применить
              </button>
            </div>
          </div>
          {/* Заголовок показателей */}
          <div className="max-w-[500px] mx-auto mb-4">
            <h2 className="text-[18px] font-bold text-black text-center">
              Ключевые показатели смены
            </h2>
          </div>
          {/* Карточки с показателями */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-[500px] mx-auto">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
              <h3 className="text-[16px] font-bold text-black mb-1">План</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
              <h3 className="text-[16px] font-bold text-black mb-1">Факт</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
              <h3 className="text-[16px] font-bold text-black mb-1">Отклонения</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
              <h3 className="text-[16px] font-bold text-black mb-1">Простой</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
          </div>

          {/* Таблица с бланками оператора */}
          <div className="mb-8">
            <h2 className="text-[18px] font-bold text-black mb-4">
              Бланки ПА
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-600">Загрузка бланков...</div>
            ) : blanks.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Нет бланков для вашего ФИО ({userInfo.name})
              </div>
            ) : (
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border-2 border-gray-300 text-[12px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border-2 border-gray-300 px-3 py-2 text-left font-semibold text-black">
                        № бланка
                      </th>
                      <th className="border-2 border-gray-300 px-3 py-2 text-left font-semibold text-black">
                        Тип ПА
                      </th>
                      <th className="border-2 border-gray-300 px-3 py-2 text-left font-semibold text-black">
                        Наименование продукции
                      </th>
                      <th className="border-2 border-gray-300 px-3 py-2 text-left font-semibold text-black">
                        Подразделение
                      </th>
                      <th className="border-2 border-gray-300 px-3 py-2 text-center font-semibold text-black">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {blanks.map((blank) => {
                      // Безопасное извлечение строк из объектов
                      const getStringValue = (value: any): string => {
                        if (typeof value === 'string') return value
                        if (value && typeof value === 'object' && 'value' in value) return value.value || ''
                        return ''
                      }
                      
                      return (
                      <tr key={blank.id} className="hover:bg-gray-50">
                        <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-medium text-black">
                          {blank.blankNumber || blank.id}
                        </td>
                        <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black">
                          {getStringValue(blank.paType) || '-'}
                        </td>
                        <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black">
                          {getStringValue(blank.productName) || '-'}
                        </td>
                        <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black">
                          {getStringValue(blank.department) || '-'}
                        </td>
                        <td className="border-2 border-gray-300 px-3 py-2 text-center">
                          <button
                            onClick={() => {
                              const blankId = blank.id
                              console.log('Operator: Открытие бланка, blank.id:', blankId, 'тип:', typeof blankId, 'blank:', blank)
                              if (blankId && typeof blankId === 'number' && blankId > 0) {
                                handleStartDataEntry(blankId)
                              } else {
                                console.error('Operator: blank.id невалиден:', blankId)
                                alert('Ошибка: ID бланка невалиден')
                              }
                            }}
                            className="px-4 py-1 bg-[#2C2C2C] text-white text-[14px] font-medium rounded hover:bg-gray-700 transition-colors"
                          >
                            Открыть
                          </button>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Кнопка начала ввода данных */}
          <div className="flex justify-center">
            <button
              onClick={() => handleStartDataEntry()}
              className="h-[40px] pt-[1px] px-8 bg-[#2C2C2C] text-white text-[20px] leading-[0] font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Начать ввод данных
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Operator