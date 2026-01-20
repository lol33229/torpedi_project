import { useState, useEffect } from 'react'
import UserSelector from '../components/UserSelector'
import ReasonGroupSelector from '../components/ReasonGroupSelector'
import { paBlankApi } from '../services/api'

interface DataEntryProps {
  userInfo: { name: string; initials: string; role: string }
  onBack: () => void
  onLogout: () => void
  blankId?: number
}

interface TimeSlot {
  time: string
  plan: string
  planCumulative: string
  fact: string
  factCumulative: string
  deviation: string
  deviationCumulative: string
  downtime: string
  responsible: string
  reasonGroups: string
  reasons: string
}

function DataEntry({ userInfo, onBack, onLogout, blankId }: DataEntryProps) {
  const [productName, setProductName] = useState('')
  const [department, setDepartment] = useState('')
  const [fillerName, setFillerName] = useState('')
  const [workingHours, setWorkingHours] = useState('')
  const [cycleTime, setCycleTime] = useState('')
  const [dailyPace, setDailyPace] = useState('')

  const timeSlots: TimeSlot[] = [
    { time: '08:00 - 09:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: '09:00 - 10:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: 'Перерыв 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: '10:15 - 11:15', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: '11:15 - 12:15', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: 'Обед 30 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: '12:45 - 13:45', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: '13:45 - 14:45', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: 'Перерыв 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: '15:00 - 16:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: '16:00 - 17:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
    { time: 'Уборка 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '' },
  ]

  const [rows, setRows] = useState<TimeSlot[]>(timeSlots)
  const [loading, setLoading] = useState(false)

  // Загрузка данных бланка при открытии
  useEffect(() => {
    const loadBlank = async () => {
      if (blankId && blankId > 0) {
        try {
          setLoading(true)
          const blank = await paBlankApi.getById(blankId)
          
          // Заполняем поля формы
          if (blank.productName) setProductName(blank.productName)
          if (blank.department) setDepartment(blank.department)
          if (blank.fillerName) setFillerName(blank.fillerName)
          if (blank.cycleTime) setCycleTime(blank.cycleTime)
          if (blank.dailyPace) setDailyPace(blank.dailyPace)
          
          // Загружаем строки данных, если они есть
          if (blank.rows && Array.isArray(blank.rows) && blank.rows.length > 0) {
            // Преобразуем данные бланка в формат TimeSlot
            const loadedRows: TimeSlot[] = blank.rows.map((row: any) => ({
              time: row.time || '',
              plan: row.plan?.toString() || '',
              planCumulative: row.planCumulative?.toString() || '',
              fact: row.fact?.toString() || '',
              factCumulative: row.factCumulative?.toString() || '',
              deviation: row.deviation?.toString() || '',
              deviationCumulative: row.deviationCumulative?.toString() || '',
              downtime: row.downtime?.toString() || '',
              responsible: row.responsible || '',
              reasonGroups: row.reasonGroups || '',
              reasons: row.reasons || ''
            }))
            
            // Если загруженных строк меньше, чем стандартных, дополняем стандартными
            if (loadedRows.length < timeSlots.length) {
              const mergedRows = [...loadedRows]
              timeSlots.forEach((slot, index) => {
                if (index >= loadedRows.length) {
                  mergedRows.push(slot)
                }
              })
              setRows(mergedRows)
            } else {
              setRows(loadedRows)
            }
          }
        } catch (error: any) {
          console.error('Ошибка загрузки бланка:', error)
          if (error.response?.status === 404) {
            alert('Бланк не найден')
          } else {
            alert('Ошибка загрузки бланка: ' + (error.message || error))
          }
        } finally {
          setLoading(false)
        }
      }
    }

    loadBlank()
  }, [blankId])

  const handleSave = () => {
    // Здесь будет логика сохранения данных
    console.log('Сохранение данных:', {
      productName,
      department,
      fillerName,
      workingHours,
      cycleTime,
      dailyPace,
      rows
    })
    alert('Данные сохранены')
  }

  const updateRow = (index: number, field: keyof TimeSlot, value: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }

    // Автоматический расчет накопительных значений и отклонений
    if (field === 'plan' || field === 'fact') {
      // Пересчитываем накопительные значения
      let planSum = 0
      let factSum = 0
      for (let i = 0; i <= index; i++) {
        if (newRows[i].time && !newRows[i].time.includes('Перерыв') && !newRows[i].time.includes('Обед') && !newRows[i].time.includes('Уборка')) {
          planSum += parseFloat(newRows[i].plan) || 0
          factSum += parseFloat(newRows[i].fact) || 0
        }
        newRows[i].planCumulative = planSum > 0 ? planSum.toString() : ''
        newRows[i].factCumulative = factSum > 0 ? factSum.toString() : ''
        newRows[i].deviation = (parseFloat(newRows[i].fact) - parseFloat(newRows[i].plan) || 0).toString() || ''
        const deviationSum = factSum - planSum
        newRows[i].deviationCumulative = deviationSum !== 0 ? deviationSum.toString() : ''
      }
    }

    setRows(newRows)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Верхний заголовок - фиксированный */}
      <header className="fixed top-0 right-0 left-0 bg-white px-6 py-4 z-50 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-black text-[14px] font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Назад
          </button>

          <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Основной контент */}
      <main className="pt-[80px] p-6">
        <div className="bg-white rounded-lg border-2 border-gray-300 p-6 max-w-[1600px] mx-auto overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Загрузка бланка...</div>
          ) : (
            <>
          {/* Статическая информация */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-[14px] font-semibold text-black whitespace-nowrap min-w-[200px]">
                  Наименование продукции:
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="flex-1 h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#7B79E6]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[14px] font-semibold text-black whitespace-nowrap min-w-[200px]">
                  Подразделения:
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex-1 h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#7B79E6]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[14px] font-semibold text-black whitespace-nowrap min-w-[200px]">
                  ФИО заполняющего:
                </label>
                <div className="flex-1">
                  <UserSelector
                    value={fillerName}
                    onChange={setFillerName}
                    className="h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#7B79E6]"
                    placeholder="Выберите пользователя..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[14px] font-semibold text-black whitespace-nowrap min-w-[200px]">
                  Время работы, час:
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="flex-1 h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#7B79E6]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-black">MP-24-2023</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[14px] font-semibold text-black whitespace-nowrap min-w-[200px]">
                  Время такта, сек:
                </label>
                <input
                  type="text"
                  value={cycleTime}
                  onChange={(e) => setCycleTime(e.target.value)}
                  className="flex-1 h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#7B79E6]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[14px] font-semibold text-black whitespace-nowrap min-w-[200px]">
                  Суточный темп, шт:
                </label>
                <input
                  type="text"
                  value={dailyPace}
                  onChange={(e) => setDailyPace(e.target.value)}
                  className="flex-1 h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white focus:outline-none focus:border-[#7B79E6]"
                />
              </div>
            </div>
          </div>

          {/* Таблица с данными */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-gray-300 text-[12px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-2 border-gray-300 px-3 py-2 text-left font-semibold text-black min-w-[150px]">
                    Время работы, час
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[80px]">
                    План, шт
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[120px]">
                    План накопительный, шт
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[80px]">
                    Факт, шт
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[120px]">
                    Факт накопительный, шт
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[100px]">
                    Отклонение, шт
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[140px]">
                    Отклонение накопительный, шт
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[100px]">
                    Простой, мин
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[150px]">
                    Ответственный за простой
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[120px]">
                    Группы причин
                  </th>
                  <th className="border-2 border-gray-300 px-2 py-2 text-center font-semibold text-black min-w-[200px]">
                    Причины отклонения, принятые меры
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-medium text-black">
                      {row.time}
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={row.plan}
                        onChange={(e) => updateRow(index, 'plan', e.target.value)}
                        className="w-full h-[32px] px-2 text-center text-[12px] border-0 focus:outline-none focus:bg-gray-50"
                      />
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1 text-center text-[12px] bg-gray-50">
                      {row.planCumulative}
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={row.fact}
                        onChange={(e) => updateRow(index, 'fact', e.target.value)}
                        className="w-full h-[32px] px-2 text-center text-[12px] border-0 focus:outline-none focus:bg-gray-50"
                      />
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1 text-center text-[12px] bg-gray-50">
                      {row.factCumulative}
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1 text-center text-[12px] bg-gray-50">
                      {row.deviation}
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1 text-center text-[12px] bg-gray-50">
                      {row.deviationCumulative}
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={row.downtime}
                        onChange={(e) => updateRow(index, 'downtime', e.target.value)}
                        className="w-full h-[32px] px-2 text-center text-[12px] border-0 focus:outline-none focus:bg-gray-50"
                      />
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={row.responsible}
                        onChange={(e) => updateRow(index, 'responsible', e.target.value)}
                        className="w-full h-[32px] px-2 text-center text-[12px] border-0 focus:outline-none focus:bg-gray-50"
                      />
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1">
                      <ReasonGroupSelector
                        value={row.reasonGroups || ''}
                        onChange={(value) => updateRow(index, 'reasonGroups', value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border-2 border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={row.reasons}
                        onChange={(e) => updateRow(index, 'reasons', e.target.value)}
                        className="w-full h-[32px] px-2 text-left text-[12px] border-0 focus:outline-none focus:bg-gray-50"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-semibold text-black">
                    Итого
                  </td>
                  <td className="border-2 border-gray-300 px-2 py-2 text-center text-[12px]">
                    {rows.reduce((sum, row) => sum + (parseFloat(row.plan) || 0), 0).toFixed(0)}
                  </td>
                  <td className="border-2 border-gray-300 px-2 py-2 text-center text-[12px]"></td>
                  <td className="border-2 border-gray-300 px-2 py-2 text-center text-[12px]">
                    {rows.reduce((sum, row) => sum + (parseFloat(row.fact) || 0), 0).toFixed(0)}
                  </td>
                  <td className="border-2 border-gray-300 px-2 py-2 text-center text-[12px]"></td>
                  <td className="border-2 border-gray-300 px-2 py-2 text-center text-[12px]"></td>
                  <td className="border-2 border-gray-300 px-2 py-2 text-center text-[12px]"></td>
                  <td className="border-2 border-gray-300 px-2 py-2 text-center text-[12px]">
                    {rows.reduce((sum, row) => sum + (parseFloat(row.downtime) || 0), 0).toFixed(0)}
                  </td>
                  <td className="border-2 border-gray-300 px-2 py-2"></td>
                  <td className="border-2 border-gray-300 px-2 py-2"></td>
                  <td className="border-2 border-gray-300 px-2 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Кнопка сохранения */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="h-[48px] px-8 bg-[#2C2C2C] text-white text-[16px] font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Сохранить изменения
            </button>
          </div>
          </>
          )}
        </div>
      </main>
    </div>
  )
}

export default DataEntry
