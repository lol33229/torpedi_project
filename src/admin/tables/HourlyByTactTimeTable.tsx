import type { TableProps } from './types'
import ReasonGroupSelector from '../../components/ReasonGroupSelector'

interface HourlyByTactTimeTableProps extends TableProps { }

export default function HourlyByTactTimeTable({ rows, updateRow, isOperator = false }: HourlyByTactTimeTableProps) {
    console.log('HourlyByTactTimeTable: Рендеринг, rows.length:', rows.length, 'isOperator:', isOperator)
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
                                                    <span className="font-normal text-black whitespace-nowrap mb-2">
                                                        {parts[0]}
                                                    </span>
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
                            <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-normal text-black align-top">
                                {row.time}
                            </td>

                            {!row.isBreak ? (
                                <>
                                    <td className="border-2 border-gray-300 p-0">
                                        <input
                                            type="text"
                                            value={row.plan || ''}
                                            onChange={(e) => updateRow(index, 'plan', e.target.value)}
                                            className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                                        />
                                    </td>
                                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.planCumulative || ''}</td>
                                    <td className="border-2 border-gray-300 p-0">
                                        <input
                                            type="text"
                                            value={row.fact || ''}
                                            onChange={(e) => updateRow(index, 'fact', e.target.value)}
                                            className="w-full h-[38px] text-center border-0 focus:outline-none bg-transparent"
                                        />
                                    </td>
                                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.factCumulative || ''}</td>
                                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviationCumulative || ''}</td>
                                    <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviation || ''}</td>
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
                                            onChange={(value: string) => updateRow(index, 'reasonGroups', value)}
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
                                <td colSpan={10} className="border-2 border-gray-300 bg-blue-50/40"></td>
                            )}
                        </tr>
                    ))}

                    <tr className="bg-blue-100 font-bold">
                        <td className="border-2 border-gray-300 px-3 py-2 text-[14px] text-black">Итого</td>
                        <td className="border-2 border-gray-300 text-center text-[12px]">
                            {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.plan) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {[...rows].reverse().find(r => !r.isBreak && r.planCumulative)?.planCumulative || 0}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px]">
                            {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.fact) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {[...rows].reverse().find(r => !r.isBreak && r.factCumulative)?.factCumulative || 0}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {[...rows].reverse().find(r => !r.isBreak && r.deviationCumulative)?.deviationCumulative || 0}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.deviation) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px]">
                            {rows.filter(r => !r.isBreak).reduce((sum, r) => sum + (parseFloat(r.downtime) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 bg-gray-100" colSpan={3}></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
