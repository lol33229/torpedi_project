import type { TableProps } from './types'
import ReasonGroupSelector from '../../components/ReasonGroupSelector'

interface HourlyByPowerTableProps extends TableProps { }

export default function HourlyByPowerTable({ rows, updateRow, isOperator = false }: HourlyByPowerTableProps) {
  console.log('HourlyByPowerTable: Рендеринг, rows.length:', rows.length, 'isOperator:', isOperator)
  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Нет данных для отображения
      </div>
    )
  }

  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border-2 border-gray-300 text-[12px] text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[150px] align-top text-left">
            </th>
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                План, шт
              </div>
            </th>
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                План накопительный, шт
              </div>
            </th>
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Факт, шт
              </div>
            </th>
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Факт накопительный, шт
              </div>
            </th>
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Отклонение, шт
              </div>
            </th>
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Отклонение накопительный, шт
              </div>
            </th>
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[80px] align-top text-center">
              Простой, мин
            </th>
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[100px] align-top text-center">
              Ответственный за простой
            </th>
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[80px] align-top text-center">
              Группы причин
            </th>
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black min-w-[150px] align-top text-left">
              Причины отклонения, принятые меры
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isBreak = row.isBreak || (row.time && (row.time.includes('Перерыв') || row.time.includes('Обед') || row.time.includes('Уборка')))

            return (
              <tr key={index} className={isBreak ? 'bg-gray-100' : ''}>
                <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-medium text-black align-top">
                  {row.time}
                </td>

                {!isBreak ? (
                  <>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.plan || ''}
                        onChange={(e) => updateRow(index, 'plan', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.planCumulative || 0}</td>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.fact || ''}
                        onChange={(e) => updateRow(index, 'fact', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.factCumulative || 0}</td>
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviation || 0}</td>
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviationCumulative || 0}</td>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.downtime || ''}
                        onChange={(e) => updateRow(index, 'downtime', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.responsible || ''}
                        onChange={(e) => updateRow(index, 'responsible', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0">
                      <ReasonGroupSelector
                        value={row.reasonGroups || ''}
                        onChange={(value) => updateRow(index, 'reasonGroups', value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.reasons || ''}
                        onChange={(e) => updateRow(index, 'reasons', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td colSpan={6} className="border-2 border-gray-300 bg-gray-100"></td>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.downtime || ''}
                        onChange={(e) => updateRow(index, 'downtime', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.responsible || ''}
                        onChange={(e) => updateRow(index, 'responsible', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0">
                      <ReasonGroupSelector
                        value={row.reasonGroups || ''}
                        onChange={(value) => updateRow(index, 'reasonGroups', value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.reasons || ''}
                        onChange={(e) => updateRow(index, 'reasons', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                  </>
                )}
              </tr>
            )
          })}

          {/* СТРОКА ИТОГО */}
          <tr className="bg-gray-100 font-bold">
            <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black">Итого</td>
            <td className="border-2 border-gray-300 text-center text-[12px]">
              {rows.filter(r => !r.isBreak && !r.time?.includes('Перерыв') && !r.time?.includes('Обед') && !r.time?.includes('Уборка')).reduce((sum, r) => sum + (parseFloat(r.plan) || 0), 0).toFixed(0)}
            </td>
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            <td className="border-2 border-gray-300 text-center text-[12px]">
              {rows.filter(r => !r.isBreak && !r.time?.includes('Перерыв') && !r.time?.includes('Обед') && !r.time?.includes('Уборка')).reduce((sum, r) => sum + (parseFloat(r.fact) || 0), 0).toFixed(0)}
            </td>
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            <td className="border-2 border-gray-300 text-center text-[12px]">
              {rows.filter(r => !r.isBreak && !r.isTotal).reduce((sum, r) => sum + (parseFloat(r.downtime) || 0), 0).toFixed(0)}
            </td>
            <td className="border-2 border-gray-300 bg-gray-100" colSpan={3}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
