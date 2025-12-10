import { useState } from 'react'

interface ReportProps {
  onBack: () => void
}

function Report({ onBack }: ReportProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedShift, setSelectedShift] = useState('Ранняя')
  const [selectedPeriod, setSelectedPeriod] = useState('дд.мм.гггг')
  const [selectedProduction, setSelectedProduction] = useState('Изделия')

  const departments = [
    'Участок 1',
    'Участок 2',
    'Участок 3',
    'Все',
  ]

  const shifts = ['Ранняя', 'Поздняя', 'Ночная']
  const periods = ['дд.мм.гггг', 'Неделя', 'Месяц', 'Год']
  const productions = ['Изделия', 'Детали', 'Узлы']

  const handleExportPDF = () => {
    console.log('Экспорт в PDF')
  }

  const handleExportExcel = () => {
    console.log('Экспорт в Excel')
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
          <span className="text-[32px] font-medium text-[#000000] ml-[60px]">
            Отчеты
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-col gap-6 px-4 py-6">
        <div className="mx-auto w-full">
          {/* Фильтры */}
          <div className="mt-6 px-[112px]">
            <div className="flex justify-between items-start">
              {/* Первый ряд - Подразделение и Смена слева */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <label className="text-[32px] font-extrabold text-[#000000] whitespace-nowrap">
                    Подразделение:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-[350px] h-[42px] rounded-[39px] border-[4px] border-[#453FFF] px-4 text-[20px] font-medium text-[#7A7878] bg-white appearance-none focus:outline-none cursor-pointer"
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
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#453FFF]"
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
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-[32px] font-extrabold text-[#000000] whitespace-nowrap">
                    Смена:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedShift}
                      onChange={(e) => setSelectedShift(e.target.value)}
                      className="w-[151px] h-[41px] rounded-[39px] border-[4px] border-[#453FFF] px-4 text-[20px] font-medium text-[#7A7878] bg-white appearance-none focus:outline-none cursor-pointer"
                    >
                      {shifts.map((shift) => (
                        <option key={shift} value={shift}>
                          {shift}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#453FFF]"
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
                  </div>
                </div>
              </div>

              {/* Второй ряд - Период и Продукция справа */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <label className="text-[32px] font-extrabold text-[#000000] whitespace-nowrap">
                    Период:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-[184px] h-[41px] rounded-[39px] border-[4px] border-[#453FFF] px-4 text-[20px] font-medium text-[#7A7878] bg-white appearance-none focus:outline-none cursor-pointer"
                    >
                      {periods.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#453FFF]"
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
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-[32px] font-extrabold text-[#000000] whitespace-nowrap">
                    Продукция:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProduction}
                      onChange={(e) => setSelectedProduction(e.target.value)}
                      className="w-[171px] h-[42px] rounded-[39px] border-[4px] border-[#453FFF] px-4 text-[20px] font-medium text-[#7A7878] bg-white appearance-none focus:outline-none cursor-pointer"
                    >
                      {productions.map((production) => (
                        <option key={production} value={production}>
                          {production}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#453FFF]"
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Распределение причин простоев */}
          <div className="mt-12 px-[298px]">
            <h2 className="text-[32px] font-extrabold text-[#000000] mb-6 text-center">
              Распределение причин простоев
            </h2>
            <div className="flex items-center justify-between">
              {/* Легенда */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FBFF00]"></div>
                  <span className="text-[24px] font-medium text-[#000000]">Группа 1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF0000]"></div>
                  <span className="text-[24px] font-medium text-[#000000]">Группа 2</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#44FF44]"></div>
                  <span className="text-[24px] font-medium text-[#000000]">Группа 3</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4444FF]"></div>
                  <span className="text-[24px] font-medium text-[#000000]">Группа 4</span>
                </div>
              </div>

              {/* Круговая диаграмма */}
              <div className="w-[300px] h-[300px] relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Группа 2 - красный (большой сегмент) */}
                  <path
                    d="M 100,100 L 100,0 A 100,100 0 0,1 170,30 L 100,100 Z"
                    fill="#FF0000"
                  />
                  <path
                    d="M 100,100 L 170,30 A 100,100 0 0,1 170,170 L 100,100 Z"
                    fill="#FF0000"
                  />
                  {/* Группа 1 - желтый */}
                  <path
                    d="M 100,100 L 170,170 A 100,100 0 0,1 30,170 L 100,100 Z"
                    fill="#FBFF00"
                  />
                  {/* Группа 3 - зеленый */}
                  <path
                    d="M 100,100 L 30,170 A 100,100 0 0,1 0,100 L 100,100 Z"
                    fill="#44FF44"
                  />
                  {/* Группа 4 - синий (маленький сегмент) */}
                  <path
                    d="M 100,100 L 0,100 A 100,100 0 0,1 30,30 L 100,100 Z"
                    fill="#4444FF"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Таблица детализации */}
          <div className="mt-12 px-[114px]">
            <h2 className="text-[32px] font-extrabold text-[#000000] mb-6 text-center">
              Детализация по группам причин
            </h2>
            <div className="flex items-end justify-between gap-8">
              <div className="border-[1px] border-black overflow-hidden flex-1">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-extrabold text-[#000000]">Причина</span>
                      </th>
                      <th className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-extrabold text-[#000000]">Отклонение (шт)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">
                          Группа 1, Причина 1
                        </span>
                      </td>
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">-5</span>
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">
                          Группа 2, Причина 2
                        </span>
                      </td>
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">-3</span>
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">
                          Группа 3, Причина 3
                        </span>
                      </td>
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">-2</span>
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">
                          Группа 4, Причина 4
                        </span>
                      </td>
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">-1</span>
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">Общий итог</span>
                      </td>
                      <td className="border-[2px] border-black px-4 py-3 text-center">
                        <span className="text-[24px] font-medium text-[#000000]">-11</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Кнопки экспорта */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleExportPDF}
                  className="w-[158px] h-[41px] bg-[#FF0000] text-white text-[40px] font-semibold rounded-[39px] hover:opacity-90 transition-opacity flex items-center justify-center">
                  PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-[158px] h-[41px] bg-[#00AC14] text-white text-[40px] font-semibold rounded-[39px] hover:opacity-90 transition-opacity flex items-center justify-center">
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Report

