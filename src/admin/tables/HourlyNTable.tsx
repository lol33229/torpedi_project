import type { TimeSlot, TableProps } from './types'
import ReasonGroupSelector from '../../components/ReasonGroupSelector'

interface HourlyNTableProps extends TableProps { }

export default function HourlyNTable({ rows, updateRow, isOperator = false }: HourlyNTableProps) {
  console.log('HourlyNTable: Рендеринг, rows.length:', rows.length, 'isOperator:', isOperator)
  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Нет данных для отображения
      </div>
    )
  }

  const product1Rows: TimeSlot[] = []
  const product2Rows: TimeSlot[] = []
  let foundChangeover = false

  rows.forEach((row) => {
    if (row.isTotal) return

    if (row.time && row.time.includes('Переналадка')) {
      foundChangeover = true
      product1Rows.push(row)
    } else if (foundChangeover) {
      product2Rows.push(row)
    } else {
      product1Rows.push(row)
    }
  })

  if (!foundChangeover && product2Rows.length === 0) {
    const midPoint = Math.ceil(product1Rows.length / 2)
    product2Rows.push(...product1Rows.splice(midPoint))
  }

  const product1RowSpan = product1Rows.length
  const product2RowSpan = product2Rows.length

  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border-2 border-gray-300 text-[12px] text-left">
        <thead>
          <tr className="bg-gray-100">
            {/* Колонка 1: Пустая для "Изделие 1/2" */}
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[150px] align-top text-left"></th>
            {/* Колонка 2: Время работы, час */}
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              Время работы, час
            </th>
            {/* Колонка 3: План, шт */}
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 h-[50px] flex items-center justify-center whitespace-nowrap">
                План, шт
              </div>
            </th>
            {/* Колонка 4: План накопительный, шт */}
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                План накопительный, шт
              </div>
            </th>
            {/* Колонка 5: Факт, шт */}
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Факт, шт
              </div>
            </th>
            {/* Колонка 6: Факт накопительный, шт */}
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Факт накопительный, шт
              </div>
            </th>
            {/* Колонка 7: Отклонение, шт */}
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Отклонение, шт
              </div>
            </th>
            {/* Колонка 8: Отклонение накопительный, шт */}
            <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
              <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                Отклонение накопительный, шт
              </div>
            </th>
            {/* Колонка 9: Простой, мин */}
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[80px] align-top text-center">
              Простой, мин
            </th>
            {/* Колонка 10: Ответственный за простой */}
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[100px] align-top text-center">
              Ответственный за простой
            </th>
            {/* Колонка 11: Группы причин */}
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black w-[80px] align-top text-center">
              Группы причин
            </th>
            {/* Колонка 12: Причины отклонения, принятые меры */}
            <th className="border-2 border-gray-300 px-3 py-2 font-normal text-black min-w-[150px] align-top text-left">
              Причины отклонения, принятые меры
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Строки для Изделия 1 */}
          {product1Rows.map((row, index) => {
            const globalIndex = rows.findIndex(r => r === row)
            const isBreak = row.isBreak || (row.time && (row.time.includes('Перерыв') || row.time.includes('Обед') || row.time.includes('Уборка')))
            const isChangeover = row.time && row.time.includes('Переналадка')
            const isFirst = index === 0

            return (
              <tr key={`product1-${index}`} className={(isBreak || isChangeover) ? 'bg-gray-100' : ''}>
                {/* Колонка 1: "Изделие 1" (rowSpan только в первой строке) */}
                {isFirst && (
                  <td rowSpan={product1RowSpan} className="border-2 border-gray-300 px-3 py-2 text-[14px] font-normal text-black align-middle text-center bg-gray-50">
                    <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                      Изделие 1
                    </div>
                  </td>
                )}
                {/* Колонка 2: Время работы, час */}
                <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-medium text-black align-top">
                  {row.time || (row.plan && row.plan.includes(':') ? row.plan : '')}
                </td>

                {!isBreak && !isChangeover ? (
                  <>
                    {/* Колонка 3: План, шт (input) */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.plan && !row.plan.includes(':') ? row.plan : ''}
                        onChange={(e) => updateRow(globalIndex, 'plan', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 4: План накопительный, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.planCumulative || 0}</td>
                    {/* Колонка 5: Факт, шт */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.fact || ''}
                        onChange={(e) => updateRow(globalIndex, 'fact', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 6: Факт накопительный, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.factCumulative || 0}</td>
                    {/* Колонка 7: Отклонение, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviation || 0}</td>
                    {/* Колонка 8: Отклонение накопительный, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviationCumulative || 0}</td>
                    {/* Колонка 9: Простой, мин */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.downtime || ''}
                        onChange={(e) => updateRow(globalIndex, 'downtime', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 10: Ответственный за простой */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.responsible || ''}
                        onChange={(e) => updateRow(globalIndex, 'responsible', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 11: Группы причин */}
                    <td className="border-2 border-gray-300 p-0">
                      <ReasonGroupSelector
                        value={row.reasonGroups || ''}
                        onChange={(value) => updateRow(globalIndex, 'reasonGroups', value)}
                        className="w-full"
                      />
                    </td>
                    {/* Колонка 12: Причины отклонения, принятые меры */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.reasons || ''}
                        onChange={(e) => updateRow(globalIndex, 'reasons', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    {/* Колонка 3: План, шт (пустая для break/changeover) */}
                    <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-medium text-black align-top bg-gray-100"></td>
                    {/* Колонки 4-8: colSpan={5} покрывает План накопительный, Факт, Факт накопительный, Отклонение, Отклонение накопительный */}
                    <td colSpan={5} className="border-2 border-gray-300 bg-gray-100"></td>
                    {/* Колонка 9: Простой, мин */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.downtime || ''}
                        onChange={(e) => updateRow(globalIndex, 'downtime', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 10: Ответственный за простой */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.responsible || ''}
                        onChange={(e) => updateRow(globalIndex, 'responsible', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 11: Группы причин */}
                    <td className="border-2 border-gray-300 p-0">
                      <ReasonGroupSelector
                        value={row.reasonGroups || ''}
                        onChange={(value) => updateRow(globalIndex, 'reasonGroups', value)}
                        className="w-full"
                      />
                    </td>
                    {/* Колонка 12: Причины отклонения, принятые меры */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.reasons || ''}
                        onChange={(e) => updateRow(globalIndex, 'reasons', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                  </>
                )}
              </tr>
            )
          })}

          {/* Строки для Изделия 2 */}
          {product2Rows.map((row, index) => {
            const globalIndex = rows.findIndex(r => r === row)
            const isBreak = row.isBreak || (row.time && (row.time.includes('Перерыв') || row.time.includes('Обед') || row.time.includes('Уборка')))
            const isFirst = index === 0

            return (
              <tr key={`product2-${index}`} className={isBreak ? 'bg-gray-100' : ''}>
                {/* Колонка 1: "Изделие 2" (rowSpan только в первой строке) */}
                {isFirst && (
                  <td rowSpan={product2RowSpan} className="border-2 border-gray-300 px-3 py-2 text-[14px] font-normal text-black align-middle text-center bg-gray-50">
                    <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                      Изделие 2
                    </div>
                  </td>
                )}
                {/* Колонка 2: Время работы, час */}
                <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-medium text-black align-top">
                  {row.time || (row.plan2 && row.plan2.includes(':') ? row.plan2 : '')}
                </td>

                {!isBreak ? (
                  <>
                    {/* Колонка 3: План, шт (input) */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.plan2 && !row.plan2.includes(':') ? row.plan2 : ''}
                        onChange={(e) => updateRow(globalIndex, 'plan2', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 4: План накопительный, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.planCumulative2 || 0}</td>
                    {/* Колонка 5: Факт, шт */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.fact2 || ''}
                        onChange={(e) => updateRow(globalIndex, 'fact2', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 6: Факт накопительный, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.factCumulative2 || 0}</td>
                    {/* Колонка 7: Отклонение, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviation2 || 0}</td>
                    {/* Колонка 8: Отклонение накопительный, шт */}
                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviationCumulative2 || 0}</td>
                    {/* Колонка 9: Простой, мин */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.downtime || ''}
                        onChange={(e) => updateRow(globalIndex, 'downtime', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 10: Ответственный за простой */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.responsible || ''}
                        onChange={(e) => updateRow(globalIndex, 'responsible', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 11: Группы причин */}
                    <td className="border-2 border-gray-300 p-0">
                      <ReasonGroupSelector
                        value={row.reasonGroups || ''}
                        onChange={(value) => updateRow(globalIndex, 'reasonGroups', value)}
                        className="w-full"
                      />
                    </td>
                    {/* Колонка 12: Причины отклонения, принятые меры */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.reasons || ''}
                        onChange={(e) => updateRow(globalIndex, 'reasons', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    {/* Колонка 3: План, шт (пустая для break) */}
                    <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-medium text-black align-top bg-gray-100"></td>
                    {/* Колонки 4-8: colSpan={5} покрывает План накопительный, Факт, Факт накопительный, Отклонение, Отклонение накопительный */}
                    <td colSpan={5} className="border-2 border-gray-300 bg-gray-100"></td>
                    {/* Колонка 9: Простой, мин */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.downtime || ''}
                        onChange={(e) => updateRow(globalIndex, 'downtime', e.target.value)}
                        className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 10: Ответственный за простой */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.responsible || ''}
                        onChange={(e) => updateRow(globalIndex, 'responsible', e.target.value)}
                        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    {/* Колонка 11: Группы причин */}
                    <td className="border-2 border-gray-300 p-0">
                      <ReasonGroupSelector
                        value={row.reasonGroups || ''}
                        onChange={(value) => updateRow(globalIndex, 'reasonGroups', value)}
                        className="w-full"
                      />
                    </td>
                    {/* Колонка 12: Причины отклонения, принятые меры */}
                    <td className="border-2 border-gray-300 p-0">
                      <input
                        type="text"
                        value={row.reasons || ''}
                        onChange={(e) => updateRow(globalIndex, 'reasons', e.target.value)}
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
            {/* Колонка 1: Итого */}
            <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black">Итого</td>
            {/* Колонка 2: Время работы, час (пустая) */}
            <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black"></td>
            {/* Колонка 3: План, шт */}
            <td className="border-2 border-gray-300 text-center text-[12px]">
              {product1Rows.filter(r => !r.isBreak && !r.time?.includes('Перерыв') && !r.time?.includes('Обед') && !r.time?.includes('Уборка') && !r.time?.includes('Переналадка')).reduce((sum, r) => {
                const planValue = r.plan && !r.plan.includes(':') ? r.plan : ''
                return sum + (parseFloat(planValue) || 0)
              }, 0).toFixed(0)}
            </td>
            {/* Колонка 4: План накопительный, шт (пустая) */}
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            {/* Колонка 5: Факт, шт */}
            <td className="border-2 border-gray-300 text-center text-[12px]">
              {product1Rows.filter(r => !r.isBreak && !r.time?.includes('Перерыв') && !r.time?.includes('Обед') && !r.time?.includes('Уборка') && !r.time?.includes('Переналадка')).reduce((sum, r) => sum + (parseFloat(r.fact) || 0), 0).toFixed(0)}
            </td>
            {/* Колонка 6: Факт накопительный, шт (пустая) */}
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            {/* Колонка 7: Отклонение, шт (пустая) */}
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            {/* Колонка 8: Отклонение накопительный, шт (пустая) */}
            <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100"></td>
            {/* Колонка 9: Простой, мин */}
            <td className="border-2 border-gray-300 text-center text-[12px]">
              {rows.filter(r => !r.isBreak && !r.isTotal).reduce((sum, r) => sum + (parseFloat(r.downtime) || 0), 0).toFixed(0)}
            </td>
            {/* Колонка 10: Ответственный за простой (пустая) */}
            <td className="border-2 border-gray-300 bg-gray-100"></td>
            {/* Колонка 11: Группы причин (пустая) */}
            <td className="border-2 border-gray-300 bg-gray-100"></td>
            {/* Колонка 12: Причины отклонения, принятые меры (пустая) */}
            <td className="border-2 border-gray-300 bg-gray-100"></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
