import { useState } from 'react'

function Report() {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const departments = [
    'Участок 1',
    'Участок 2',
    'Участок 3',
    'Все',
  ]

  const shifts = ['Ранняя', 'Поздняя', 'Ночная']

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg p-6">
        {/* Фильтры */}
        <div className="flex flex-col gap-4 mb-8 grid grid-cols-2">
          <div className="flex items-center gap-4">
            <label className="text-[16px] font-semibold text-black whitespace-nowrap">
              Подразделение:
            </label>
            <div className="relative flex-1 max-w-[300px]">
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

          <div className="flex items-center gap-4">
            <label className="text-[16px] font-semibold text-black whitespace-nowrap">
              Дата:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="дд"
                className="w-[60px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
              />
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="мм"
                className="w-[60px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
              />
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="гггг"
                className="w-[80px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-[16px] font-semibold text-black whitespace-nowrap">
              Смена:
            </label>
            <div className="relative flex-1 max-w-[300px]">
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
        </div>

        {/* Ключевые показатели смены */}
        <div className="mb-8 ">
          <h2 className=" text-[20px] font-bold text-black mb-6 text-center ">
            Ключевые показатели смены
          </h2>
          <div className="grid grid-cols-2 gap-10 w-[648px] h-[294px] items-center mx-auto">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-[16px] font-bold text-black mb-2">План</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-[16px] font-bold text-black mb-2">Факт</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-[16px] font-bold text-black mb-2">Отклонения</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-[16px] font-bold text-black mb-2">Простой</h3>
              <p className="text-[14px] font-medium text-gray-600">ххх штук</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Report

