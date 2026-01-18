import { useState } from 'react'

interface EditPAProps {
  blankId: number
  blankNumber: number
  onBack: () => void
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
  isBreak: boolean
}

function EditPA({ blankId, blankNumber, onBack }: EditPAProps) {
  const [paType, setPaType] = useState('')
  const [productName, setProductName] = useState('')
  const [department, setDepartment] = useState('')
  const [fillerName, setFillerName] = useState('')
  const [workingHours, /*setWorkingHours*/] = useState('')
  const [cycleTime, setCycleTime] = useState('')
  const [dailyPace, setDailyPace] = useState('')

  // Настройки времени
  const [breakMinutes, setBreakMinutes] = useState('15')
  const [breakFrom, setBreakFrom] = useState('10:00')
  const [breakTo, setBreakTo] = useState('10:15')

  const [lunchMinutes, setLunchMinutes] = useState('30')
  const [lunchFrom, setLunchFrom] = useState('12:15')
  const [lunchTo, setLunchTo] = useState('12:45')

  const [cleanupMinutes, setCleanupMinutes] = useState('15')
  const [cleanupFrom, setCleanupFrom] = useState('17:00')
  const [cleanupTo, setCleanupTo] = useState('17:15')

  const [setupMinutes, setSetupMinutes] = useState('')
  const [setupFrom, setSetupFrom] = useState('')
  const [setupTo, setSetupTo] = useState('')

  const paTypes = ['Тип 1', 'Тип 2', 'Тип 3']

  const initialTimeSlots: TimeSlot[] = [
    { time: '08:00 - 09:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: '09:00 - 10:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: 'Перерыв 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true },
    { time: '10:15 - 11:15', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: '11:15 - 12:15', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: 'Обед 30 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true },
    { time: '12:45 - 13:45', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: '13:45 - 14:45', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: 'Перерыв 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true },
    { time: '15:00 - 16:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: '16:00 - 17:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false },
    { time: 'Уборка 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true },
  ]

  const [rows, setRows] = useState<TimeSlot[]>(initialTimeSlots)

  const handleSave = () => {
    console.log('Сохранение бланка ПА:', {
      blankId,
      blankNumber,
      paType,
      productName,
      department,
      fillerName,
      workingHours,
      cycleTime,
      dailyPace,
      rows,
      breakSettings: { minutes: breakMinutes, from: breakFrom, to: breakTo },
      lunchSettings: { minutes: lunchMinutes, from: lunchFrom, to: lunchTo },
      cleanupSettings: { minutes: cleanupMinutes, from: cleanupFrom, to: cleanupTo },
      setupSettings: { minutes: setupMinutes, from: setupFrom, to: setupTo },
    })
    alert('Изменения сохранены')
    onBack()
  }

  const updateRow = (index: number, field: keyof TimeSlot, value: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }

    // Автоматический расчет накопительных значений и отклонений
    if (field === 'plan' || field === 'fact') {
      let planSum = 0
      let factSum = 0
      for (let i = 0; i <= index; i++) {
        if (!newRows[i].isBreak) {
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
    <div className="w-full">
      <div className="bg-white min-w-[550px] rounded-lg">

        {/* Верхняя навигация и выбор типа ПА */}
        <div className="mb-6 grid grid-cols-3 items-center">

          {/* Кнопка назад */}
          <div className="flex justify-start">
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
          </div>

          <div className="flex items-center justify-center gap-3">
            <label className="text-[16px] font-semibold text-black whitespace-nowrap">
              Тип ПА:
            </label>
            <div className="relative min-w-[200px]">
              <select
                value={paType}
                onChange={(e) => setPaType(e.target.value)}
                className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
              >
                <option value="" disabled>
                  Выберите тип ПА
                </option>
                {paTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
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

          {/* Пустой блок справа */}
          <div />
        </div>

        {/* Статическая информация */}
        <div className="mb-[-2px]">
          <div className="grid grid-cols-2">
            {/* Левая колонка */}
            <div className="flex flex-col">
              {[
                { label: "Наименование продукции:", value: productName, setter: setProductName },
                { label: "Подразделения:", value: department, setter: setDepartment },
                { label: "ФИО заполняющего:", value: fillerName, setter: setFillerName },
              ].map((item, idx) => (
                <div key={idx} className="flex border-2 border-gray-300 border-b-0 border-r-0 last:border-b-2">
                  <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                    {item.label}
                  </label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => item.setter(e.target.value)}
                    className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                  />
                </div>
              ))}
            </div>

            {/* Правая колонка */}
            <div className="flex flex-col">
              <div className="flex border-2 border-gray-300 border-b-0 last:border-b-2 h-[38px] items-center px-3 bg-gray-50">
                <span className="text-[12px] font-normal text-black uppercase tracking-wider">MP-24-2023</span>
              </div>
              {[
                { label: "Время такта, сек:", value: cycleTime, setter: setCycleTime },
                { label: "Суточный темп, шт:", value: dailyPace, setter: setDailyPace }
              ].map((item, idx) => (
                <div key={idx} className="flex border-2 border-gray-300 border-b-0 last:border-b-2">
                  <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                    {item.label}
                  </label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => item.setter(e.target.value)}
                    className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                  />
                </div>
              ))}
              <div className="flex-1 border-2 border-gray-300 border-t-0 bg-gray-50/30"></div>
            </div>
          </div>
        </div>

        {/* Таблица с данными */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border-2 border-gray-300 text-[12px] text-left">
            <thead>
              <tr className="bg-gray-100 ">
                <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[150px] align-top text-left">
                  Время работы, час
                </th>
                {[
                  { title: "План, шт", width: "w-[35px]" },
                  { title: "План / накопительный, шт", width: "w-[35px]" },
                  { title: "Факт, шт", width: "w-[35px]" },
                  { title: "Факт / накопительный, шт", width: "w-[35px]" },
                  { title: "Отклонение / накопительный, шт", width: "w-[35px]" },
                  { title: "Отклонение, шт", width: "w-[35px]" },
                  { title: "Простой, мин", width: "w-[35px]" },
                  { title: "Ответственный / за простой", width: "w-[100px]" },
                  { title: "Группы причин", width: "w-[35px]" }
                ].map((col, idx) => {
                  const parts = col.title.split('/').map(s => s.trim());
                  return (
                    <th key={idx} className={`border-2 border-gray-300 p-0 h-[130px] ${col.width} relative`}>
                      <div className="absolute inset-0 flex flex-col items-center justify-end">
                        <div className="[writing-mode:vertical-rl] rotate-180 flex flex-col items-start leading-none">
                          {parts.length > 1 ? (
                            <>
                              {/* Верхняя строка */}
                              <span className="font-normal text-black whitespace-nowrap mb-2">
                                {parts[0]}
                              </span>
                              {/* Нижняя строка */}
                              <span className="font-normal text-black whitespace-nowrap leading-[1] mb-[-1px]">
                                {parts[1]}
                              </span>
                            </>
                          ) : (
                            <span className="font-normal text-black whitespace-nowrap leading-[1] mb-[-1px]">
                              {col.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </th>
                  )
                })}
                <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black min-w-[150px] align-top text-left">
                  Причины отклонения, принятые меры
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className={row.isBreak ? 'bg-blue-50' : ''}>
                  {/* Время работы  */}
                  <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-normal text-black align-top">
                    {row.time}
                  </td>

                  {!row.isBreak ? (
                    <>
                      <td className="border-2 border-gray-300 p-0">
                        <input
                          type="text"
                          value={row.plan}
                          onChange={(e) => updateRow(index, 'plan', e.target.value)}
                          className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.planCumulative}</td>
                      <td className="border-2 border-gray-300 p-0">
                        <input
                          type="text"
                          value={row.fact}
                          onChange={(e) => updateRow(index, 'fact', e.target.value)}
                          className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.factCumulative}</td>
                      <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviationCumulative}</td>
                      <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviation}</td>
                      <td className="border-2 border-gray-300 p-0">
                        <input
                          type="text"
                          value={row.downtime}
                          onChange={(e) => updateRow(index, 'downtime', e.target.value)}
                          className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-0">
                        <input
                          type="text"
                          value={row.responsible}
                          onChange={(e) => updateRow(index, 'responsible', e.target.value)}
                          className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-0">
                        <input
                          type="text"
                          value={row.reasonGroups}
                          onChange={(e) => updateRow(index, 'reasonGroups', e.target.value)}
                          className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="border-2 border-gray-300 p-0">
                        <input
                          type="text"
                          value={row.reasons}
                          onChange={(e) => updateRow(index, 'reasons', e.target.value)}
                          className="w-full h-[38px] px-2 font-normal border-0 focus:outline-none bg-transparent"
                        />
                      </td>
                    </>
                  ) : (
                    <td colSpan={10} className="border-2 border-gray-300 bg-blue-50/40"></td>
                  )}
                </tr>
              ))}

              {/* СТРОКА ИТОГО */}
              <tr className="bg-blue-100 font-bold">
                <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black">Итого</td>

                {/* План, шт */}
                <td className="border-2 border-gray-300 text-center text-[12px]">
                  {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.plan) || 0), 0).toFixed(0)}
                </td>

                {/* План накопительный (берем последнее значение) */}
                <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                  {[...rows].reverse().find(r => !r.isBreak && r.planCumulative)?.planCumulative || 0}
                </td>

                {/* Факт, шт */}
                <td className="border-2 border-gray-300 text-center text-[12px]">
                  {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.fact) || 0), 0).toFixed(0)}
                </td>

                {/* Факт накопительный (берем последнее значение) */}
                <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                  {[...rows].reverse().find(r => !r.isBreak && r.factCumulative)?.factCumulative || 0}
                </td>

                {/* Отклонение накопительное (последнее значение) */}
                <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                  {[...rows].reverse().find(r => !r.isBreak && r.deviationCumulative)?.deviationCumulative || 0}
                </td>

                {/* Отклонение (сумма разниц) */}
                <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                  {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.deviation) || 0), 0).toFixed(0)}
                </td>

                {/* Простой, мин */}
                <td className="border-2 border-gray-300 text-center text-[12px]">
                  {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.downtime) || 0), 0).toFixed(0)}
                </td>

                {/* Остальные пустые ячейки */}
                <td className="border-2 border-gray-300 bg-gray-100" colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Настройки времени и кнопка сохранения */}
        <div className="flex items-end justify-between mt-6">
          {/* Настройки времени */}
          <div className="space-y-2">
            {[
              { label: "Перерыв:", mins: breakMinutes, setMins: setBreakMinutes, from: breakFrom, setFrom: setBreakFrom, to: breakTo, setTo: setBreakTo },
              { label: "Обед:", mins: lunchMinutes, setMins: setLunchMinutes, from: lunchFrom, setFrom: setLunchFrom, to: lunchTo, setTo: setLunchTo },
              { label: "Уборка:", mins: cleanupMinutes, setMins: setCleanupMinutes, from: cleanupFrom, setFrom: setCleanupFrom, to: cleanupTo, setTo: setCleanupTo },
              { label: "Переналадка:", mins: setupMinutes, setMins: setSetupMinutes, from: setupFrom, setFrom: setSetupFrom, to: setupTo, setTo: setSetupTo },
            ].map((item, idx) => (
              <div key={idx} className="grid grid-cols-[110px_70px_50px_20px_80px_20px_80px] items-center gap-2">
                <label className="text-[14px] font-medium text-black">{item.label}</label>

                <select
                  value={item.mins}
                  onChange={(e) => item.setMins(e.target.value)}
                  className="h-[32px] px-2 border-2 border-[#CCCCCC] rounded text-[12px] bg-white"
                >
                  <option value="">-</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </select>

                <span className="text-[14px] font-medium text-black">Минут</span>

                <span className="text-[14px] font-medium text-black text-center">с</span>

                <input
                  type="text"
                  value={item.from}
                  onChange={(e) => item.setFrom(e.target.value)}
                  className="h-[32px] w-full px-2 border-2 border-[#CCCCCC] rounded text-[12px] text-center"
                  placeholder="--:--"
                />

                <span className="text-[14px] font-medium text-black text-center">до</span>

                <input
                  type="text"
                  value={item.to}
                  onChange={(e) => item.setTo(e.target.value)}
                  className="h-[32px] w-full px-2 border-2 border-[#CCCCCC] rounded text-[12px] text-center"
                  placeholder="--:--"
                />
              </div>
            ))}
          </div>

          {/* Кнопка сохранения снизу справа */}
          <button
            onClick={handleSave}
            className="max-h-[45px] max-w-[250px] px-8 bg-[#2C2C2C] text-white text-[16px] font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditPA