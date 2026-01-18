import { useState } from 'react'
import DataEntry from './dataEntry'

interface OperatorProps {
  userInfo: { name: string; initials: string; role: string }
  onLogout: () => void
}

function Operator({ userInfo, onLogout }: OperatorProps) {
  const [showDataEntry, setShowDataEntry] = useState(false)
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

  const handleApply = () => {
    // Здесь будет логика применения фильтров
    console.log('Применение фильтров:', { selectedDepartment, selectedShift, day, month, year })
  }

  const handleStartDataEntry = () => {
    setShowDataEntry(true)
  }

  if (showDataEntry) {
    return <DataEntry userInfo={userInfo} onBack={() => setShowDataEntry(false)} onLogout={onLogout} />
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Верхний заголовок - фиксированный справа */}
      <header className="fixed top-0 right-0 left-0 bg-white px-6 py-4 z-50 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <span className="text-[14px] font-bold text-black">{userInfo.initials}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-black">{userInfo.name}</span>
              <span className="text-[14px] text-gray-600">{userInfo.role}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Выйти из учётной записи"
          >
            <svg
              width="24"
              height="24"
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
      </header>

      {/* Основной контент */}
      <main className="pt-[80px] p-6">
        <div className="bg-white rounded-lg p-6 max-w-5xl mx-auto">
          {/* Секция фильтров */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <label className="text-[16px] font-semibold text-black whitespace-nowrap">
                  Подразделение:
                </label>
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
                  >
                    <option value="" disabled>
                      Выберите подразделение
                    </option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#9B98FF]">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[16px] font-semibold text-black whitespace-nowrap">
                  Смена:
                </label>
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
                  >
                    <option value="" disabled>
                      Выберите смену
                    </option>
                    {shifts.map((shift) => (
                      <option key={shift} value={shift}>
                        {shift}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#9B98FF]">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
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

              <button
                onClick={handleApply}
                className="h-[40px] px-6 bg-[#2C2C2C] text-white text-[14px] font-medium rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                Применить
              </button>
            </div>
          </div>

          {/* Карточки с показателями */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-[18px] font-bold text-black mb-2">План</h3>
              <p className="text-[16px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-[18px] font-bold text-black mb-2">Факт</h3>
              <p className="text-[16px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-[18px] font-bold text-black mb-2">Отклонения</h3>
              <p className="text-[16px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-[18px] font-bold text-black mb-2">Простой</h3>
              <p className="text-[16px] font-medium text-gray-600">ххх штук</p>
            </div>
          </div>

          {/* Кнопка начала ввода данных */}
          <div className="flex justify-center">
            <button
              onClick={handleStartDataEntry}
              className="h-[48px] px-8 bg-[#2C2C2C] text-white text-[16px] font-semibold rounded-lg hover:bg-gray-700 transition-colors"
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