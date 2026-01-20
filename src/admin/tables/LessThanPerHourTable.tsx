import React, { useEffect } from 'react'
import type { TimeSlot, TableProps } from './types'
import { OPERATION_MAPPING } from './types'
import ReasonGroupSelector from '../../components/ReasonGroupSelector'

interface LessThanPerHourTableProps extends TableProps { }

export default function LessThanPerHourTable({ rows, updateRow, isOperator = false }: LessThanPerHourTableProps) {
  console.log('LessThanPerHourTable: Рендеринг, rows.length:', rows.length, 'isOperator:', isOperator)
  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Нет данных для отображения
      </div>
    )
  }
    const generateTimeOptions = () => {
        const options: string[] = []
        let hour = 8
        let minute = 0
        
        while (hour < 16 || (hour === 16 && minute <= 20)) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            options.push(timeString)
            
            minute += 5
            if (minute >= 60) {
                minute = 0
                hour++
            }
        }
        
        return options
    }
    
    const timeOptions = generateTimeOptions()

    useEffect(() => {
        rows.forEach((row, index) => {
            if (row.operation && OPERATION_MAPPING[row.operation]) {
                updateRow(index, 'operation', OPERATION_MAPPING[row.operation])
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updatedRows = rows.map((row) => {
        if (row.operation && OPERATION_MAPPING[row.operation]) {
            return { ...row, operation: OPERATION_MAPPING[row.operation] }
        }
        return row
    })

    const getRowIndex = (targetRow: TimeSlot) => updatedRows.findIndex(r => r === targetRow)

    const intervalOrder = ['8:00 - 10:00', '10:00 - 12:00', '12:30 - 14:30', '14:30 - 16:20']
    const normalizeTime = (time: string) => time.replace(/\s+/g, '')

    const groupedRows: { [key: string]: TimeSlot[] } = {}
    const allRows = updatedRows.filter(row => !row.isTotal)
    const lunch = allRows.find(row => row.operation === 'Обед 40 мин') || null
    const cleanup = allRows.find(row => row.operation === 'Уборка') || null

    let currentInterval: string | null = null
    allRows.forEach((row) => {
        if (row.operation !== 'Обед 40 мин' && row.operation !== 'Уборка') {
            if (row.time) {
                const normalizedTime = normalizeTime(row.time)
                currentInterval = intervalOrder.find(interval =>
                    normalizeTime(interval) === normalizedTime
                ) || row.time
            }

            if (currentInterval) {
                if (!groupedRows[currentInterval]) {
                    groupedRows[currentInterval] = []
                }
                groupedRows[currentInterval].push(row)
            }
        }
    })

    return (
        <div className="overflow-x-auto mb-6">
            <datalist id="timeOptionsList">
                {timeOptions.map((time) => (
                    <option key={time} value={time} />
                ))}
            </datalist>
            <style>{`
                table tbody tr {
                    height: auto !important;
                    min-height: 0 !important;
                    line-height: 1 !important;
                }
                table tbody td {
                    padding: 0 !important;
                    line-height: 1 !important;
                    vertical-align: middle !important;
                }
                table tbody input {
                    height: 14px !important;
                    line-height: 14px !important;
                    padding-top: 0 !important;
                    padding-bottom: 0 !important;
                }
            `}</style>
            <table className="w-full border-collapse border-2 border-gray-300 text-[12px] text-left" style={{ tableLayout: 'auto' }}>
                <thead>
                    <tr className="bg-gray-100">
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[30px] align-top text-left">
                            Время работы, час
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[200px] align-top text-left">
                            Наименование операции
                        </th>
                        <th colSpan={2} className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
                            Время начала
                        </th>
                        <th colSpan={2} className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
                            Время окончания
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            План, шт
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            Факт, шт
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            План накопительный, шт
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            Факт накопительный, шт
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            Отклонен., шт
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            Отклонение, накопительный
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            Простой, мин
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[60px] align-top text-center">
                            Ответственный за простой
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black w-[40px] align-top text-center">
                            Группы причин
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-300 px-2 py-1 font-normal text-black min-w-[150px] align-top text-left">
                            Причины отклонения, принятые меры
                        </th>
                    </tr>
                    <tr className="bg-gray-100">
                        <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
                            План
                        </th>
                        <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
                            Факт
                        </th>
                        <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
                            План
                        </th>
                        <th className="border-2 border-gray-300 px-2 py-2 font-normal text-black text-center">
                            Факт
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {intervalOrder.map((intervalTime) => {
                        const intervalRows = groupedRows[intervalTime] || []
                        if (intervalRows.length === 0) return null

                        return (
                            <React.Fragment key={intervalTime}>
                                {intervalRows.map((row, rowIndex) => {
                                    const isFirstInInterval = rowIndex === 0
                                    const rowSpan = intervalRows.length
                                    const operationLower = (row.operation || '').toLowerCase()
                                    const isBreak = operationLower.includes('перерыв')

                                    return (
                                        <tr key={`${intervalTime}-${rowIndex}`} className={`${isBreak ? 'bg-blue-50' : ''} leading-none`} style={{ height: 'auto', minHeight: '0' }}>
                                            {isFirstInInterval && (
                                                <td rowSpan={rowSpan} className="border-2 border-gray-300 px-2 py-1 text-[14px] font-normal text-black align-middle text-center bg-gray-50">
                                                    <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center whitespace-nowrap">
                                                        {intervalTime}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                <input
                                                    type="text"
                                                    value={row.operation || ''}
                                                    onChange={(e) => {
                                                        const globalIndex = getRowIndex(row)
                                                        if (globalIndex >= 0) updateRow(globalIndex, 'operation', e.target.value)
                                                    }}
                                                    className="w-full h-[14px] px-2 py-0 border-0 focus:outline-none bg-transparent leading-none text-[12px]"
                                                    style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                                />
                                            </td>
                                            <>
                                                <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                    <input
                                                        type="text"
                                                        list="timeOptionsList"
                                                        value={row.startTimePlan || ''}
                                                        onChange={(e) => {
                                                            const globalIndex = updatedRows.findIndex(r => r === row)
                                                            if (globalIndex >= 0) updateRow(globalIndex, 'startTimePlan', e.target.value)
                                                        }}
                                                        placeholder="--"
                                                        className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-transparent text-[12px]"
                                                        disabled={isBreak}
                                                        style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                    <input
                                                        type="text"
                                                        list="timeOptionsList"
                                                        value={row.startTimeFact || ''}
                                                        onChange={(e) => {
                                                            const globalIndex = getRowIndex(row)
                                                            if (globalIndex >= 0) updateRow(globalIndex, 'startTimeFact', e.target.value)
                                                        }}
                                                        placeholder="--"
                                                        className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-transparent text-[12px]"
                                                        disabled={isBreak}
                                                        style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                    <input
                                                        type="text"
                                                        list="timeOptionsList"
                                                        value={row.endTimePlan || ''}
                                                        onChange={(e) => {
                                                            const globalIndex = getRowIndex(row)
                                                            if (globalIndex >= 0) updateRow(globalIndex, 'endTimePlan', e.target.value)
                                                        }}
                                                        placeholder="--"
                                                        className={`w-full h-[14px] px-1 text-center border-0 focus:outline-none text-[12px] ${isBreak ? 'bg-blue-50/40' : 'bg-transparent'}`}
                                                        style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                    <input
                                                        type="text"
                                                        list="timeOptionsList"
                                                        value={row.endTimeFact || ''}
                                                        onChange={(e) => {
                                                            const globalIndex = getRowIndex(row)
                                                            if (globalIndex >= 0) updateRow(globalIndex, 'endTimeFact', e.target.value)
                                                        }}
                                                        placeholder="--"
                                                        className={`w-full h-[14px] px-1 text-center border-0 focus:outline-none text-[12px] ${isBreak ? 'bg-blue-50/40' : 'bg-transparent'}`}
                                                        style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                                    />
                                                </td>
                                                {!isBreak ? (
                                                    <>
                                                        <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                            <input
                                                                type="text"
                                                                value={row.plan || ''}
                                                                onChange={(e) => {
                                                                    const globalIndex = getRowIndex(row)
                                                                    if (globalIndex >= 0) updateRow(globalIndex, 'plan', e.target.value)
                                                                }}
                                                                className="w-full h-[14px] text-center border-0 focus:outline-none bg-transparent"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                            <input
                                                                type="text"
                                                                value={row.fact || ''}
                                                                onChange={(e) => {
                                                                    const globalIndex = getRowIndex(row)
                                                                    if (globalIndex >= 0) updateRow(globalIndex, 'fact', e.target.value)
                                                                }}
                                                                className="w-full h-[14px] text-center border-0 focus:outline-none bg-transparent"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.planCumulative || 0}</td>
                                                        <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.factCumulative || 0}</td>
                                                        <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviation || 0}</td>
                                                        <td className="border-2 border-gray-300 p-0 text-center bg-gray-50">{row.deviationCumulative || 0}</td>
                                                        <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                            <input
                                                                type="text"
                                                                value={row.downtime || ''}
                                                                onChange={(e) => {
                                                                    const globalIndex = getRowIndex(row)
                                                                    if (globalIndex >= 0) updateRow(globalIndex, 'downtime', e.target.value)
                                                                }}
                                                                className="w-full h-[14px] text-center border-0 focus:outline-none bg-transparent"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                            <input
                                                                type="text"
                                                                value={row.responsible || ''}
                                                                onChange={(e) => {
                                                                    const globalIndex = updatedRows.findIndex(r => r === row)
                                                                    if (globalIndex >= 0) updateRow(globalIndex, 'responsible', e.target.value)
                                                                }}
                                                                className="w-full h-[14px] px-2 border-0 focus:outline-none bg-transparent"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                            <ReasonGroupSelector
                                                                value={row.reasonGroups || ''}
                                                                onChange={(value) => {
                                                                    const globalIndex = getRowIndex(row)
                                                                    if (globalIndex >= 0) updateRow(globalIndex, 'reasonGroups', value)
                                                                }}
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                                            <input
                                                                type="text"
                                                                value={row.reasons || ''}
                                                                onChange={(e) => {
                                                                    const globalIndex = updatedRows.findIndex(r => r === row)
                                                                    if (globalIndex >= 0) updateRow(globalIndex, 'reasons', e.target.value)
                                                                }}
                                                                className="w-full h-[14px] px-2 py-0 border-0 focus:outline-none bg-transparent leading-none text-[12px]"
                                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                                            />
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="border-2 border-gray-300 bg-blue-50/40" colSpan={9}></td>
                                                    </>
                                                )}
                                            </>
                                        </tr>
                                    )
                                })}
                                {intervalTime === '10:00 - 12:00' && lunch && (
                                    <tr key="lunch" className="bg-blue-50">
                                        <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-normal text-black align-top"></td>
                                        <td className="border-2 border-gray-300 p-0 leading-none" style={{ padding: '0', lineHeight: '1' }}>
                                            <input
                                                type="text"
                                                value={lunch.operation || ''}
                                                onChange={(e) => {
                                                    const globalIndex = getRowIndex(lunch)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'operation', e.target.value)
                                                }}
                                                className="w-full h-[14px] px-2 py-0 border-0 focus:outline-none bg-blue-50/40 leading-none text-[12px]"
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={lunch.startTimePlan || ''}
                                                onChange={(e) => {
                                                    const globalIndex = updatedRows.findIndex(r => r === lunch)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'startTimePlan', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                disabled
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={lunch.startTimeFact || ''}
                                                onChange={(e) => {
                                                    const globalIndex = getRowIndex(lunch)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'startTimeFact', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                disabled
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={lunch.endTimePlan || ''}
                                                onChange={(e) => {
                                                    const globalIndex = getRowIndex(lunch)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'endTimePlan', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={lunch.endTimeFact || ''}
                                                onChange={(e) => {
                                                    const globalIndex = getRowIndex(lunch)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'endTimeFact', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 bg-blue-50/40" colSpan={9}></td>
                                    </tr>
                                )}
                                {intervalTime === '14:30 - 16:20' && cleanup && (
                                    <tr key="cleanup" className="bg-blue-50 leading-none" style={{ height: 'auto', minHeight: '0' }}>
                                        <td className="border-2 border-gray-300 px-3 py-2 text-[14px] font-normal text-black align-top"></td>
                                        <td className="border-2 border-gray-300 p-0 leading-none">
                                            <input
                                                type="text"
                                                value={cleanup.operation || ''}
                                                onChange={(e) => {
                                                    const globalIndex = updatedRows.findIndex(r => r === cleanup)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'operation', e.target.value)
                                                }}
                                                className="w-full h-[14px] px-2 py-0 border-0 focus:outline-none bg-blue-50/40 leading-none text-[12px]"
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={cleanup.startTimePlan || ''}
                                                onChange={(e) => {
                                                    const globalIndex = getRowIndex(cleanup)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'startTimePlan', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                disabled
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={cleanup.startTimeFact || ''}
                                                onChange={(e) => {
                                                    const globalIndex = updatedRows.findIndex(r => r === cleanup)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'startTimeFact', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                disabled
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={cleanup.endTimePlan || ''}
                                                onChange={(e) => {
                                                    const globalIndex = updatedRows.findIndex(r => r === cleanup)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'endTimePlan', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 p-0">
                                            <input
                                                type="text"
                                                list="timeOptionsList"
                                                value={cleanup.endTimeFact || ''}
                                                onChange={(e) => {
                                                    const globalIndex = updatedRows.findIndex(r => r === cleanup)
                                                    if (globalIndex >= 0) updateRow(globalIndex, 'endTimeFact', e.target.value)
                                                }}
                                                placeholder="--"
                                                className="w-full h-[14px] px-1 text-center border-0 focus:outline-none bg-blue-50/40 text-[12px]"
                                                style={{ height: '14px', lineHeight: '14px', paddingTop: '0', paddingBottom: '0' }}
                                            />
                                        </td>
                                        <td className="border-2 border-gray-300 bg-blue-50/40" colSpan={9}></td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )
                    })}
                    <tr className="bg-blue-100 font-bold">
                        <td className="border-2 border-gray-300 px-2 py-1 text-[14px] text-black">Итого</td>
                        <td className="border-2 border-gray-300 bg-gray-100"></td>
                        <td className="border-2 border-gray-300 bg-gray-100" colSpan={4}></td>
                        <td className="border-2 border-gray-300 text-center text-[12px]">
                            {updatedRows.filter(r => !r.isBreak && !r.isTotal).reduce((sum, r) => sum + (parseFloat(r.plan) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px]">
                            {updatedRows.filter(r => !r.isBreak && !r.isTotal).reduce((sum, r) => sum + (parseFloat(r.fact) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {[...updatedRows].reverse().find(r => !r.isBreak && !r.isTotal && r.planCumulative)?.planCumulative || 0}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {[...updatedRows].reverse().find(r => !r.isBreak && !r.isTotal && r.factCumulative)?.factCumulative || 0}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {updatedRows.filter(r => !r.isBreak && !r.isTotal).reduce((sum, r) => sum + (parseFloat(String(r.deviation || '0')) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px] bg-gray-100">
                            {[...updatedRows].reverse().find(r => !r.isBreak && !r.isTotal && r.deviationCumulative)?.deviationCumulative || 0}
                        </td>
                        <td className="border-2 border-gray-300 text-center text-[12px]">
                            {updatedRows.filter(r => !r.isBreak && !r.isTotal).reduce((sum, r) => sum + (parseFloat(r.downtime) || 0), 0).toFixed(0)}
                        </td>
                        <td className="border-2 border-gray-300 bg-gray-100" colSpan={3}></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
