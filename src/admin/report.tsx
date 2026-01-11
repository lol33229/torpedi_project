import { useState } from 'react'

function Report() {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [selectedProduction, setSelectedProduction] = useState('')

  const departments = [
    'Участок 1',
    'Участок 2',
    'Участок 3',
    'Все',
  ]

  const shifts = ['Ранняя', 'Поздняя', 'Ночная']
  const productions = ['Изделия', 'Детали', 'Узлы']

  const handleExportPDF = () => {
    console.log('Экспорт в PDF')
  }

  const handleExportExcel = () => {
    console.log('Экспорт в Excel')
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg  p-6">
        {/* Фильтры */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-[16px] font-semibold text-black whitespace-nowrap">
                Подразделение:
              </label>
              <div className="relative flex-1">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-[268px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
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
                Смена:
              </label>
              <div className="relative flex-1">
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-[268px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
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

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-[16px] font-semibold text-black whitespace-nowrap">
                Период:
              </label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="дд"
                  className="w-[80px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
                />
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="мм"
                  className="w-[80px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
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
                Продукция:
              </label>
              <div className="relative flex-1">
                <select
                  value={selectedProduction}
                  onChange={(e) => setSelectedProduction(e.target.value)}
                  className="w-[258px] h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
                >
                  <option value="" disabled>
                    Выберите изделие
                  </option>
                  {productions.map((production) => (
                    <option key={production} value={production}>
                      {production}
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
        </div>

        {/* Распределение причин простоев */}
        <div className="mb-8">
          <h2 className="text-[20px] font-bold text-black mb-6 text-center">
            Распределение причин простоев
          </h2>
          <div className="flex items-center justify-center gap-12">
            {/* Легенда */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FBFF00]"></div>
                <span className="text-[16px] font-medium text-black">Группа 1</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FF0000]"></div>
                <span className="text-[16px] font-medium text-black">Группа 2</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#44FF44]"></div>
                <span className="text-[16px] font-medium text-black">Группа 3</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#4444FF]"></div>
                <span className="text-[16px] font-medium text-black">Группа 4</span>
              </div>
            </div>

            {/* Круговая диаграмма */}
            <div className="w-[250px] h-[250px] relative">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Group 3 - 50% (top-right quadrant: от верха вправо) */}
                <path d="M 100,100 L 100,0 A 100,100 0 0,1 200,100 L 100,100 Z" fill="#44FF44" />
                {/* Group 3 - продолжение (top-left quadrant: от левой точки вверх) */}
                <path d="M 100,100 L 0,100 A 100,100 0 0,1 100,0 L 100,100 Z" fill="#44FF44" />
                {/* Group 1 - 25% (bottom-left quadrant: от левой точки вниз) */}
                <path d="M 100,100 L 100,0 A 100,100 0 0,1 200,100 L 100,100 Z" fill="#FBFF00" />
                {/* Group 2 - 25% (bottom-right quadrant: от нижней точки вправо) */}
                <path d="M 100,100 L 100,0 A 100,100 0 0,1 200,100 L 100,100 Z" fill="#FF0000" />
              </svg>
            </div>
          </div>
        </div>

        {/* Таблица детализации */}
        <div className="mt-8">
          <h2 className="text-[20px] font-bold text-black mb-6 text-center">
            Детализация по группам причин
          </h2>
          <div className="flex items-end gap-6">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[16px] font-bold text-black">Причина</span>
                    </th>
                    <th className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[16px] font-bold text-black">Отклонения (шт)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">Группа 1, причина 1</span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">-5</span>
                    </td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">Группа 2, причина 2</span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">-3</span>
                    </td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">Группа 3, причина 3</span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">-2</span>
                    </td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">Группа 4, причина 4</span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-medium text-black">-5</span>
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-bold text-black">Общий итог</span>
                    </td>
                    <td className="border-2 border-gray-300 px-4 py-3 text-center">
                      <span className="text-[14px] font-bold text-black">-15</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Кнопки экспорта */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleExportExcel}
                className="w-[120px] h-[40px] bg-[#14AE5C] text-white text-[16px] font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                EXCEL
              </button>
              <button
                onClick={handleExportPDF}
                className="w-[120px] h-[40px] bg-[#EC221F] text-white text-[16px] font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Report

