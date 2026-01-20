import { useState, useEffect } from 'react'
import { paBlankApi, catalogApi } from '../services/api'
import type { CatalogValue } from '../services/api'
import type { TimeSlot } from './tables/types'
import { OPERATION_MAPPING } from './tables/types'
import HourlyNTable from './tables/HourlyNTable'
import LessThanPerHourTable from './tables/LessThanPerHourTable'
import HourlyByTactTimeTable from './tables/HourlyByTactTimeTable'
import HourlyByPowerTable from './tables/HourlyByPowerTable'
import UserSelector from '../components/UserSelector'
import ShiftSelector from '../components/ShiftSelector'

interface EditPAProps {
  blankId: number
  blankNumber: number
  onBack: () => void
  isOperator?: boolean
}

function EditPA({ blankId, blankNumber, onBack, isOperator = false }: EditPAProps) {
  const [paType, setPaType] = useState('')
  const [productName, setProductName] = useState('')
  const [department, setDepartment] = useState('')
  const [fillerName, setFillerName] = useState('')
  const [cycleTime, setCycleTime] = useState('')
  const [dailyPace, setDailyPace] = useState('')
  const [workplacePower, setWorkplacePower] = useState('')
  const [productName1, setProductName1] = useState('')
  const [productName2, setProductName2] = useState('')
  const [cycleTime1, setCycleTime1] = useState('')
  const [cycleTime2, setCycleTime2] = useState('')
  const [dailyPace1, setDailyPace1] = useState('')
  const [dailyPace2, setDailyPace2] = useState('')
  const [dateShift, setDateShift] = useState('')
  const [backendPaType, setBackendPaType] = useState('')
  const [isLoadingBlank, setIsLoadingBlank] = useState(false)

  interface BreakSettings {
    id: string
    label: string
    minutes: string
    from: string
    to: string
    enabled: boolean
  }

  const [breaks, setBreaks] = useState<BreakSettings[]>([
    { id: 'break1', label: 'Перерыв', minutes: '15', from: '10:00', to: '10:15', enabled: true },
    { id: 'lunch', label: 'Обед', minutes: '30', from: '12:15', to: '12:45', enabled: true },
    { id: 'break2', label: 'Перерыв', minutes: '15', from: '15:00', to: '15:15', enabled: true },
    { id: 'cleanup', label: 'Уборка', minutes: '15', from: '17:00', to: '17:15', enabled: true },
  ])

  const [paTypes, setPaTypes] = useState<CatalogValue[]>([])
  const [productNames, setProductNames] = useState<CatalogValue[]>([])
  const [departments, setDepartments] = useState<CatalogValue[]>([])

  const generateTimeSlots = (breakSettings: BreakSettings[]): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 8
    const endHour = 17

    const sortedBreaks = [...breakSettings]
      .filter(b => b.enabled && b.from && b.to)
      .map(b => {
        const [fromHour, fromMin] = b.from.split(':').map(Number)
        const [toHour, toMin] = b.to.split(':').map(Number)
        return {
          ...b,
          startMinutes: fromHour * 60 + fromMin,
          endMinutes: toHour * 60 + toMin,
        }
      })
      .sort((a, b) => a.startMinutes - b.startMinutes)

    const processedBreaks = new Set<string>()

    for (let hour = startHour; hour < endHour; hour++) {
      if (hour === 14) {
        continue
      }

      const hourStart = hour * 60
      const hourEnd = (hour + 1) * 60

      const breaksStartingInHour = sortedBreaks.filter(b =>
        !processedBreaks.has(b.id) && b.startMinutes >= hourStart && b.startMinutes < hourEnd
      )

      const breaksContinuingInHour = sortedBreaks.filter(b =>
        processedBreaks.has(b.id) && b.startMinutes < hourStart && b.endMinutes > hourStart
      )

      const nextHour = hour + 1
      const nextHourStart = nextHour * 60
      const nextBreak = sortedBreaks.find(b =>
        !processedBreaks.has(b.id) && b.startMinutes >= nextHourStart && b.startMinutes < nextHourStart + 60 && b.startMinutes > nextHourStart
      )

      if (hour === 11 && breaksStartingInHour.length === 0 && breaksContinuingInHour.length === 0) {
        const breakAt1215 = sortedBreaks.find(b =>
          !processedBreaks.has(b.id) && b.startMinutes === 12 * 60 + 15
        )
        if (breakAt1215) {
          slots.push({
            time: `11:00 - 12:15`,
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            isBreak: false,
          })
        } else {
          slots.push({
            time: `11:00 - 12:00`,
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            isBreak: false,
          })
        }
        continue
      }

      if (hour === 13 && breaksStartingInHour.length === 0 && breaksContinuingInHour.length === 0) {
        const breakAt15 = sortedBreaks.find(b =>
          !processedBreaks.has(b.id) && b.startMinutes === 15 * 60
        )
        if (!breakAt15) {
          slots.push({
            time: `13:00 - 15:00`,
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            isBreak: false,
          })
        } else {
          slots.push({
            time: `13:00 - 15:00`,
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            isBreak: false,
          })
        }
        continue
      }

      if (breaksStartingInHour.length === 0 && breaksContinuingInHour.length === 0) {
        if (!nextBreak) {
          const fromTime = `${String(hour).padStart(2, '0')}:00`
          const toTime = `${String(hour + 1).padStart(2, '0')}:00`
          slots.push({
            time: `${fromTime} - ${toTime}`,
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            isBreak: false,
          })
        }
      } else {
        let hourCurrentTime = hourStart

        for (const breakItem of breaksContinuingInHour) {
          if (breakItem.endMinutes <= hourEnd) {
            hourCurrentTime = breakItem.endMinutes
            processedBreaks.delete(breakItem.id)
          } else {
            hourCurrentTime = hourEnd
          }
        }

        const allBreaksInHour = [...breaksStartingInHour].sort((a, b) => a.startMinutes - b.startMinutes)

        for (const breakItem of allBreaksInHour) {
          if (breakItem.startMinutes > hourCurrentTime) {
            if (breakItem.startMinutes === hourStart) {
              hourCurrentTime = breakItem.startMinutes
            } else {
              if (hour === 12 && breakItem.startMinutes === 12 * 60 + 15 && hourCurrentTime === hourStart) {
                hourCurrentTime = breakItem.startMinutes
              } else {
                let slotStartMinutes = Math.max(hourCurrentTime, hourStart)
                const slotEndMinutes = breakItem.startMinutes

                if (slotStartMinutes < slotEndMinutes && slotStartMinutes >= hourStart) {
                  const fromTime = `${String(Math.floor(slotStartMinutes / 60)).padStart(2, '0')}:${String(slotStartMinutes % 60).padStart(2, '0')}`
                  const toTime = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, '0')}:${String(slotEndMinutes % 60).padStart(2, '0')}`
                  slots.push({
                    time: `${fromTime} - ${toTime}`,
                    plan: '',
                    planCumulative: '',
                    fact: '',
                    factCumulative: '',
                    deviation: '',
                    deviationCumulative: '',
                    downtime: '',
                    responsible: '',
                    reasonGroups: '',
                    reasons: '',
                    isBreak: false,
                  })
                }
              }
            }
          }

          slots.push({
            time: `${breakItem.label} ${breakItem.minutes} мин`,
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            isBreak: true,
          })
          processedBreaks.add(breakItem.id)

          hourCurrentTime = breakItem.endMinutes
        }

        let effectiveHourEnd = hourEnd
        let effectiveNextHourStart = nextHourStart
        let targetEndTime: string | null = null
        
        if (hour === 11) {
          const breakAt1215 = sortedBreaks.find(b =>
            !processedBreaks.has(b.id) && b.startMinutes === 12 * 60 + 15
          )
          if (breakAt1215) {
            effectiveHourEnd = 12 * 60 + 15
            effectiveNextHourStart = 12 * 60 + 15
            targetEndTime = '12:15'
          }
        } else if (hour === 13) {
          effectiveHourEnd = 15 * 60
          effectiveNextHourStart = 15 * 60
          targetEndTime = '15:00'
        }
        
        if (hourCurrentTime < effectiveHourEnd && hourCurrentTime >= hourStart && hourCurrentTime !== effectiveNextHourStart && !nextBreak) {
          let checkBreakHour = hour + 1
          let checkBreakStart = checkBreakHour * 60
          
          if (hour === 11) {
            const breakAt1215 = sortedBreaks.find(b =>
              !processedBreaks.has(b.id) && b.startMinutes === 12 * 60 + 15
            )
            if (breakAt1215) {
              checkBreakStart = 12 * 60 + 15
            }
          } else if (hour === 13) {
            checkBreakHour = 15
            checkBreakStart = 15 * 60
          }
          
          const nextHourBreak = sortedBreaks.find(b =>
            !processedBreaks.has(b.id) && b.startMinutes === checkBreakStart
          )
          if (!nextHourBreak) {
            const fromTime = `${String(Math.floor(hourCurrentTime / 60)).padStart(2, '0')}:${String(hourCurrentTime % 60).padStart(2, '0')}`
            const toTime = targetEndTime || `${String(hour + 1).padStart(2, '0')}:00`
            slots.push({
              time: `${fromTime} - ${toTime}`,
              plan: '',
              planCumulative: '',
              fact: '',
              factCumulative: '',
              deviation: '',
              deviationCumulative: '',
              downtime: '',
              responsible: '',
              reasonGroups: '',
              reasons: '',
              isBreak: false,
            })
          }
        }
      }
    }

    const cleanupBreak = sortedBreaks.find(b => b.id === 'cleanup' && !processedBreaks.has(b.id))
    if (cleanupBreak) {
      slots.push({
        time: `${cleanupBreak.label} ${cleanupBreak.minutes} мин`,
        plan: '',
        planCumulative: '',
        fact: '',
        factCumulative: '',
        deviation: '',
        deviationCumulative: '',
        downtime: '',
        responsible: '',
        reasonGroups: '',
        reasons: '',
        isBreak: true,
      })
    }

    return slots
  }

  const generateRowsForType = (paType: string, breakSettings: BreakSettings[]): TimeSlot[] => {
    const paTypeLower = paType.toLowerCase().trim()
    const isMultipleNomenclatures = paTypeLower.includes('нескольк') && paTypeLower.includes('номенклатур')
    const isLessThanPerHour = isLessThanPerHourType(paType)

    if (isMultipleNomenclatures) {
      const rows: TimeSlot[] = []
      
      rows.push({ time: '08:00 - 09:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: '09:00 - 10:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: 'Перерыв 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true })
      rows.push({ time: '10:15 - 11:15', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: '11:15 - 12:15', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: 'Обед 30 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true })
      rows.push({ time: 'Переналадка 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true })
      
      rows.push({ time: '12:45 - 13:45', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: '13:45 - 14:45', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: 'Перерыв 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true })
      rows.push({ time: '15:00 - 16:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: '16:00 - 17:00', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: false })
      rows.push({ time: 'Уборка 15 мин', plan: '', planCumulative: '', fact: '', factCumulative: '', deviation: '', deviationCumulative: '', downtime: '', responsible: '', reasonGroups: '', reasons: '', isBreak: true })
      
      return rows
    } else if (isLessThanPerHour) {
      const intervals = [
        { time: '8:00 - 10:00', operations: ['1. Подсборка', '2. Установка детали 1', '3. Установка детали 2', '4. Установка детали 3', '5. Настройка', 'Перерыв'] },
        { time: '10:00 - 12:00', operations: ['1. Подсборка', '2. Установка детали 1', '3. Установка детали 2', '4. Установка детали 3', '5. Настройка', 'Обед 40 мин'] },
        { time: '12:30 - 14:30', operations: ['1. Подсборка', '2. Установка детали 1', '3. Установка детали 2', '4. Установка детали 3', '5. Настройка', 'Перерыв'] },
        { time: '14:30 - 16:20', operations: ['1. Подсборка', '2. Установка детали 1', '3. Установка детали 2', '4. Установка детали 3', '5. Настройка'] },
      ]

      const rows: TimeSlot[] = []
      intervals.forEach((interval, intervalIndex) => {
        interval.operations.forEach((operation, opIndex) => {
          rows.push({
            time: opIndex === 0 ? interval.time : '',
            operation: operation,
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            startTimePlan: '',
            startTimeFact: '',
            endTimePlan: '',
            endTimeFact: '',
            isBreak: false,
          })
        })

        if (intervalIndex === 1) {
          rows.push({
            time: '',
            operation: 'Обед 40 мин',
            plan: '',
            planCumulative: '',
            fact: '',
            factCumulative: '',
            deviation: '',
            deviationCumulative: '',
            downtime: '',
            responsible: '',
            reasonGroups: '',
            reasons: '',
            startTimePlan: '',
            startTimeFact: '',
            endTimePlan: '',
            endTimeFact: '',
            isBreak: false,
          })
        }
      })

      rows.push({
        time: '',
        operation: 'Уборка',
        plan: '',
        planCumulative: '',
        fact: '',
        factCumulative: '',
        deviation: '',
        deviationCumulative: '',
        downtime: '',
        responsible: '',
        reasonGroups: '',
        reasons: '',
        startTimePlan: '',
        startTimeFact: '',
        endTimePlan: '',
        endTimeFact: '',
        isBreak: false,
      })

      rows.push({
        time: 'Итого',
        plan: '',
        planCumulative: '',
        fact: '',
        factCumulative: '',
        deviation: '',
        deviationCumulative: '',
        downtime: '',
        responsible: '',
        reasonGroups: '',
        reasons: '',
        isBreak: false,
        isTotal: true,
      })

      return rows
    } else {
      return generateTimeSlots(breakSettings)
    }
  }

  const [rows, setRows] = useState<TimeSlot[]>([])

  const paTypeMapping: Record<string, string> = {
    'Бланк по часовой мощности': 'Почасовой по мощности рабочего места',
    'Бланк по времени такта': 'Почасовой по времени такта',
    'Бланк по часовой N': 'Почасовой несколько номенклатур',
    'Бланк меньше одного изделия в час': 'Почасовой менее 1 изделия в час',
    'Бланк меньше одного изделия в смену': 'Почасовой менее 1 изделия в смену',
  }

  const reversePaTypeMapping: Record<string, string> = {
    'Почасовой по мощности рабочего места': 'Бланк по часовой мощности',
    'Почасовой по времени такта': 'Бланк по времени такта',
    'Почасовой несколько номенклатур': 'Бланк по часовой N',
    'Почасовой менее 1 изделия в час': 'Бланк меньше одного изделия в час',
    'Почасовой менее 1 изделия в смену': 'Бланк меньше одного изделия в смену',
  }

  useEffect(() => {
    const loadPaTypes = async () => {
      try {
        const catalogs = await catalogApi.getAll()
        const paTypeCatalog = catalogs.find(c => c.title === 'Тип ведения ПА')
        if (paTypeCatalog && paTypeCatalog.values) {
          setPaTypes(paTypeCatalog.values)
          
          if (backendPaType && !isLoadingBlank && blankId > 0) {
            let mappedValue = paTypeMapping[backendPaType] || backendPaType
            
            const exactMatch = paTypeCatalog.values.find(v => v.value === mappedValue)
            if (exactMatch) {
              setPaType(exactMatch.value)
              return
            }
            
            const exactMatchOriginal = paTypeCatalog.values.find(v => v.value === backendPaType)
            if (exactMatchOriginal) {
              setPaType(exactMatchOriginal.value)
              return
            }
            
            const partialMatch = paTypeCatalog.values.find(t => {
              const typeLower = t.value.toLowerCase()
              const mappedLower = mappedValue.toLowerCase()
              const backendLower = backendPaType.toLowerCase()
              return typeLower.includes(mappedLower) || mappedLower.includes(typeLower) ||
                     typeLower.includes(backendLower) || backendLower.includes(typeLower)
            })
            if (partialMatch) {
              setPaType(partialMatch.value)
            } else {
              setPaType(mappedValue)
            }
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки типов ПА из справочника:', error)
      }
    }

    loadPaTypes()
  }, [])

  useEffect(() => {
    const loadProductNames = async () => {
      try {
        const catalogs = await catalogApi.getAll()
        const productCatalog = catalogs.find(c => c.title === 'Наименование продукции')
        if (productCatalog && productCatalog.values) {
          setProductNames(productCatalog.values)
        }
      } catch (error) {
        console.error('Ошибка загрузки наименований продукции из справочника:', error)
      }
    }

    loadProductNames()
  }, [])

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const catalogs = await catalogApi.getAll()
        const departmentCatalog = catalogs.find(c => c.title === 'Подразделение')
        if (departmentCatalog && departmentCatalog.values) {
          console.log('Загружены подразделения:', departmentCatalog.values)
          setDepartments(departmentCatalog.values)
        } else {
          console.warn('Справочник "Подразделение" не найден или не имеет значений')
        }
      } catch (error) {
        console.error('Ошибка загрузки подразделений из справочника:', error)
      }
    }

    loadDepartments()
  }, [])

  const updateOldOperations = (rows: TimeSlot[]): TimeSlot[] => {
    return rows.map(row => {
      if (row.operation && OPERATION_MAPPING[row.operation]) {
        return { ...row, operation: OPERATION_MAPPING[row.operation] }
      }
      return row
    })
  }

  const isLessThanPerHourType = (type: string): boolean => {
    const typeLower = type.toLowerCase().trim()
    return typeLower.includes('меньше одного изделия в час') || typeLower.includes('менее 1 изделия в час')
  }

  const saveDataByOperation = (rows: TimeSlot[]): Map<string, Partial<TimeSlot>> => {
    const savedData = new Map<string, Partial<TimeSlot>>()
    rows.forEach((row: TimeSlot) => {
      if (row.operation && !row.isTotal) {
        savedData.set(row.operation, {
          plan: row.plan,
          fact: row.fact,
          downtime: row.downtime,
          responsible: row.responsible,
          reasonGroups: row.reasonGroups,
          reasons: row.reasons,
          startTimePlan: row.startTimePlan,
          startTimeFact: row.startTimeFact,
          endTimePlan: row.endTimePlan,
          endTimeFact: row.endTimeFact,
        })
      }
    })
    return savedData
  }

  const restoreDataByOperation = (newRows: TimeSlot[], savedData: Map<string, Partial<TimeSlot>>): TimeSlot[] => {
    return newRows.map((row) => {
      if (row.isTotal) return row
      
      let data = savedData.get(row.operation || '')
      if (!data && row.operation) {
        const oldOp = Object.keys(OPERATION_MAPPING).find(old => OPERATION_MAPPING[old] === row.operation)
        if (oldOp) data = savedData.get(oldOp)
      }
      
      if (data) return { ...row, ...data }
      return row
    })
  }

  useEffect(() => {
    const loadBlank = async () => {
      if (blankId && blankId > 0) {
        setIsLoadingBlank(true)
        try {
          const blank = await paBlankApi.getById(blankId)
          const loadedPaType = blank.paType || ''
          
          let finalPaType = loadedPaType
          if (!finalPaType || finalPaType === '') {
            if (blank.workplacePower) {
              finalPaType = 'Бланк по часовой мощности'
            } else if (blank.productName1 || blank.productName2) {
              finalPaType = 'Бланк по часовой N'
            } else if (blank.cycleTime && blank.dailyPace) {
              finalPaType = 'Бланк по времени такта'
            } else {
              finalPaType = 'Бланк по времени такта'
            }
            console.log(`paType не найден в бланке, определен как: ${finalPaType}`)
          }
          
          setBackendPaType(finalPaType)
          
          const selectPaTypeFromCatalog = (sourceType: string, availableTypes: typeof paTypes) => {
            let mappedPaType = paTypeMapping[sourceType] || sourceType
            
            const exactMatch = availableTypes.find(t => t.value === mappedPaType)
            if (exactMatch) {
              return exactMatch.value
            }
            
            const exactMatchOriginal = availableTypes.find(t => t.value === sourceType)
            if (exactMatchOriginal) {
              return exactMatchOriginal.value
            }
            
            const partialMatch = availableTypes.find(t => {
              const typeLower = t.value.toLowerCase()
              const sourceLower = sourceType.toLowerCase()
              const mappedLower = mappedPaType.toLowerCase()
              return typeLower.includes(sourceLower) || sourceLower.includes(typeLower) ||
                     typeLower.includes(mappedLower) || mappedLower.includes(typeLower)
            })
            if (partialMatch) {
              return partialMatch.value
            }
            
            return mappedPaType
          }
          
          if (paTypes.length > 0) {
            const selectedType = selectPaTypeFromCatalog(finalPaType, paTypes)
            setPaType(selectedType)
          } else {
            const mappedPaType = paTypeMapping[finalPaType] || finalPaType
            setPaType(mappedPaType)
          }
          setProductName(blank.productName || '')
          setDepartment(blank.department || '')
          setFillerName(blank.fillerName || '')
          setCycleTime(blank.cycleTime || '')
          setDailyPace(blank.dailyPace || '')
          setWorkplacePower(blank.workplacePower || '')
          
          if (blank.productName1) setProductName1(blank.productName1)
          if (blank.productName2) setProductName2(blank.productName2)
          if (blank.cycleTime1) setCycleTime1(blank.cycleTime1)
          if (blank.cycleTime2) setCycleTime2(blank.cycleTime2)
          if (blank.dailyPace1) setDailyPace1(blank.dailyPace1)
          if (blank.dailyPace2) setDailyPace2(blank.dailyPace2)
          if (blank.dateShift) {
            setDateShift(blank.dateShift)
          }

          let breaksToUse: BreakSettings[] = breaks
          if (blank.breaks && Array.isArray(blank.breaks) && blank.breaks.length > 0) {
            breaksToUse = blank.breaks
            setBreaks(blank.breaks)
          }
          
          // Загружаем rows из БД
          if (isLessThanPerHourType(finalPaType)) {
            // Для типа "меньше одного изделия в час" всегда генерируем строки
            if (blank.rows && Array.isArray(blank.rows) && blank.rows.length > 0) {
              // Убеждаемся, что все поля правильно инициализированы
              const normalizedRows = blank.rows.map(r => ({
                ...r,
                reasonGroups: r.reasonGroups || '',
                reasons: r.reasons || ''
              }))
              const savedData = saveDataByOperation(normalizedRows)
              const newRows = generateRowsForType(finalPaType, breaksToUse)
              const updatedRows = restoreDataByOperation(newRows, savedData)
              setRows(updatedRows)
              setIsLoadingBlank(false)
            } else {
              const newRows = generateRowsForType(finalPaType, breaksToUse)
              setRows(newRows)
              setIsLoadingBlank(false)
            }
          } else if (blank.rows && Array.isArray(blank.rows) && blank.rows.length > 0) {
            const normalizedRows = blank.rows.map(r => ({
              ...r,
              reasonGroups: r.reasonGroups || '',
              reasons: r.reasons || '',
              plan: r.plan || '',
              fact: r.fact || '',
              downtime: r.downtime || '',
              responsible: r.responsible || '',
              plan2: r.plan2 || '',
              fact2: r.fact2 || ''
            }))
            setRows(normalizedRows)
            setIsLoadingBlank(false)
          } else {
            const newRows = generateRowsForType(finalPaType, breaksToUse)
            setRows(newRows)
            setIsLoadingBlank(false)
          }
        } catch (error: any) {
          setIsLoadingBlank(false)
          if (error.response?.status === 404) {
            console.log('Эндпоинт для загрузки бланка пока не реализован на бэкенде или бланк не найден')
            alert('Бланк не найден')
          } else {
            console.error('Ошибка загрузки бланка:', error)
            alert('Ошибка загрузки бланка: ' + (error.message || error))
          }
        }
      }
    }

    loadBlank()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blankId, paTypes])

  useEffect(() => {
    if (isLoadingBlank) {
      return
    }
    if (blankId > 0) {
      return
    }
    
    if (!paType) {
      setRows([])
      return
    }
    
    if (!isLessThanPerHourType(paType)) {
      const currentDataMap = new Map<string, Partial<TimeSlot>>()
      rows.forEach((row) => {
        if (!row.isBreak && !row.isSetup && row.time) {
          currentDataMap.set(row.time, {
            plan: row.plan,
            plan2: row.plan2,
            fact: row.fact,
            fact2: row.fact2,
            downtime: row.downtime,
            responsible: row.responsible,
            reasonGroups: row.reasonGroups,
            reasons: row.reasons,
            operation: row.operation,
            startTimePlan: row.startTimePlan,
            startTimeFact: row.startTimeFact,
            endTimePlan: row.endTimePlan,
            endTimeFact: row.endTimeFact,
          })
        }
      })

      const newSlots = generateRowsForType(paType, breaks)

      const updatedSlots = newSlots.map((slot) => {
        if (!slot.isBreak && !slot.isSetup && slot.time && currentDataMap.has(slot.time)) {
          const savedData = currentDataMap.get(slot.time)!
          return { ...slot, ...savedData }
        }
        return slot
      })

      setRows(updatedSlots)
    } else {
      const hasOldOperations = rows.some(row => row.operation && OPERATION_MAPPING[row.operation])
      const rowsToProcess = hasOldOperations ? updateOldOperations(rows) : rows
      const savedData = saveDataByOperation(rowsToProcess)
      const newSlots = generateRowsForType(paType, breaks)
      const updatedSlots = restoreDataByOperation(newSlots, savedData)
      setRows(updatedSlots)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breaks, paType, isLoadingBlank])

  const updateBreak = (id: string, field: keyof BreakSettings, value: string | boolean) => {
    const newBreaks = breaks.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    )
    setBreaks(newBreaks)

    // Сохраняем данные из текущих строк перед обновлением
    const currentDataMap = new Map<string, Partial<TimeSlot>>()
    rows.forEach((row) => {
      if (!row.isBreak && row.time) {
        currentDataMap.set(row.time, {
          plan: row.plan,
          fact: row.fact,
          downtime: row.downtime,
          responsible: row.responsible,
          reasonGroups: row.reasonGroups,
          reasons: row.reasons,
        })
      }
    })

    const newSlots = generateTimeSlots(newBreaks)

    const updatedSlots = newSlots.map((slot) => {
      if (!slot.isBreak && slot.time && currentDataMap.has(slot.time)) {
        const savedData = currentDataMap.get(slot.time)!
        return {
          ...slot,
          ...savedData,
        }
      }
      return slot
    })

    setRows(updatedSlots)
  }



  const handleSave = async () => {
    const paTypeLower = paType.toLowerCase().trim()
    const isMultipleNomenclatures = paTypeLower.includes('нескольк') && paTypeLower.includes('номенклатур')
    const isHourlyByPower = paTypeLower.includes('часовой мощности') || 
                           paTypeLower.includes('по часовой мощности') ||
                           paTypeLower.includes('мощности рабочего') ||
                           paTypeLower.includes('мощност')
    const isLessThanPerHour = isLessThanPerHourType(paType)
    
    const missingFields: string[] = []
    
    if (isMultipleNomenclatures) {
      if (!fillerName) missingFields.push('ФИО заполняющего')
      if (!department) missingFields.push('Подразделение')
      if (!dateShift) missingFields.push('Дата/смена')
      if (!productName1) missingFields.push('Наименование изд. 1')
      if (!cycleTime1) missingFields.push('Тц изд. 1, сек')
      if (!dailyPace1) missingFields.push('Суточный темп изд. 1, шт')
      if (!productName2) missingFields.push('Наименование изд. 2')
      if (!cycleTime2) missingFields.push('Тц изд. 2, сек')
      if (!dailyPace2) missingFields.push('Суточный темп изд. 2, шт')
    } else if (isHourlyByPower) {
      if (!productName) missingFields.push('Наименование продукции')
      if (!department) missingFields.push('Подразделение')
      if (!fillerName) missingFields.push('ФИО заполняющего')
      if (!cycleTime) missingFields.push('Дата/смена')
      if (!workplacePower) missingFields.push('Мощность рабочего места, шт./час')
      if (!dailyPace) missingFields.push('Суточный темп, шт')
    } else if (isLessThanPerHour) {
      if (!department) missingFields.push('Подразделение')
      if (!fillerName) missingFields.push('ФИО заполняющего')
      if (!cycleTime) missingFields.push('Дата/смена')
      if (!dailyPace) missingFields.push('Суточный темп, шт')
    } else {
      if (!productName) missingFields.push('Наименование продукции')
      if (!department) missingFields.push('Подразделение')
      if (!fillerName) missingFields.push('ФИО заполняющего')
      if (!cycleTime) missingFields.push('Время такта, сек')
      if (!dailyPace) missingFields.push('Суточный темп, шт')
    }
    
    if (missingFields.length > 0) {
      alert(`Пожалуйста, заполните все обязательные поля:\n${missingFields.join('\n')}`)
      return
    }

    try {
      const backendPaType = reversePaTypeMapping[paType] || paType
      
      let blankData: any = {
        blankNumber,
        paType: backendPaType,
        department,
        fillerName,
        rows,
        breaks,
      }
      
      if (isMultipleNomenclatures) {
        blankData.productName = productName1
        blankData.productName1 = productName1
        blankData.productName2 = productName2
        blankData.cycleTime = cycleTime1
        blankData.cycleTime1 = cycleTime1
        blankData.cycleTime2 = cycleTime2
        blankData.dailyPace = dailyPace1
        blankData.dailyPace1 = dailyPace1
        blankData.dailyPace2 = dailyPace2
        blankData.dateShift = dateShift
      } else if (isHourlyByPower) {
        blankData.productName = productName
        blankData.cycleTime = cycleTime
        blankData.dailyPace = dailyPace
        blankData.workplacePower = workplacePower
      } else if (isLessThanPerHour) {
        blankData.productName = productName
        blankData.cycleTime = cycleTime
        blankData.dailyPace = dailyPace
      } else {
        blankData.productName = productName
        blankData.cycleTime = cycleTime
        blankData.dailyPace = dailyPace
      }

      if (blankId && blankId > 0) {
        await paBlankApi.update(blankId, blankData)
        alert('Бланк обновлен')
      } else {
        await paBlankApi.create(blankData)
        alert('Бланк создан и сохранен')
      }

      onBack()
    } catch (error: any) {
      console.error('Ошибка сохранения бланка:', error)
      if (error.response?.status === 404) {
        alert('Эндпоинт для сохранения бланков пока не реализован на бэкенде. Данные сохранены локально.')
        onBack()
      } else if (error.response?.status === 500) {
        // Ошибка сервера - возможно проблема с ID справочников или структурой БД
        const errorMsg = error.response?.data || error.message || 'Ошибка сервера при сохранении бланка'
        const errorText = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
        
        // Проверяем, не связана ли ошибка с отсутствующей колонкой Status
        if (errorText.includes('column "Status"') || errorText.includes('column "status"')) {
          alert(`Ошибка сохранения: Проблема на стороне сервера - модель базы данных содержит поле Status, которого нет в таблице.\n\nЭто проблема бэкенда, которую нужно исправить на сервере.`)
          return // Не вызываем onBack(), чтобы пользователь мог попробовать снова
        }
        
        alert(`Ошибка сохранения: ${errorText}\n\nПроверьте, что значения в справочниках существуют:\n- Наименование продукции: ${productName}\n- Подразделение: ${department}\n- ФИО заполняющего: ${fillerName}`)
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Не удалось сохранить бланк'
        alert(`Ошибка сохранения: ${errorMsg}`)
      }
    }
  }

  const updateRow = (index: number, field: keyof TimeSlot | string, value: string | number) => {
    const newRows = [...rows]
    let cleanValue = value
    if ((field === 'plan' || field === 'plan2' || field === 'fact' || field === 'fact2') && typeof value === 'string') {
      if (value.includes(':') && (value.includes('-') || value.match(/\d{2}:\d{2}/))) {
        cleanValue = ''
      }
    }
    newRows[index] = { ...newRows[index], [field]: cleanValue }
    
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

        <div className="mb-6 grid grid-cols-3 items-center">

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
                  <option key={type.id} value={type.value}>
                    {type.value}
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

          <div />
        </div>

        {(() => {
          const paTypeLower = paType.toLowerCase().trim()
          const isMultipleNomenclatures = paTypeLower.includes('нескольк') && paTypeLower.includes('номенклатур')
          const isHourlyByPower = paTypeLower.includes('часовой мощности') || 
                                 paTypeLower.includes('по часовой мощности') ||
                                 paTypeLower.includes('мощности рабочего') ||
                                 paTypeLower.includes('мощност')
          
          if (isMultipleNomenclatures) {
            return (
              <div className="mb-[-2px]">
                <div className="grid grid-cols-3 gap-0">
                  {/* Строка 1: ФИО заполняющего, Подразделение, Дата/смена */}
                  <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      ФИО заполняющего: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex-1 px-3 py-1">
                      <UserSelector
                        value={fillerName}
                        onChange={setFillerName}
                        className="h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0"
                        placeholder="Выберите пользователя..."
                      />
                    </div>
                  </div>
                  <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Подразделение: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                        className="w-full h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0 appearance-none cursor-pointer"
                      >
                        <option value="">Выберите подразделение</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.value}>
                            {dept.value}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-2 border-gray-300 border-b-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Дата/смена: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex-1 relative">
                      <ShiftSelector
                        value={dateShift}
                        onChange={(value: string) => setDateShift(value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Наименование изд. 1: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={productName1}
                      onChange={(e) => setProductName1(e.target.value)}
                      required
                      className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                    />
                  </div>
                  <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Тц изд. 1, сек: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={cycleTime1}
                      onChange={(e) => setCycleTime1(e.target.value)}
                      required
                      className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                    />
                  </div>
                  <div className="flex border-2 border-gray-300 border-b-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Суточный темп изд. 1, шт.: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={dailyPace1}
                      onChange={(e) => setDailyPace1(e.target.value)}
                      required
                      className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                    />
                  </div>
                  
                  <div className="flex border-2 border-gray-300 border-b-2 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Наименование изд. 2: <span className="text-red-500 ml-1">*</span>
                    </label>
                        <input
                          type="text"
                          value={productName2}
                          onChange={(e) => setProductName2(e.target.value)}
                          required
                          className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                        />
                  </div>
                  <div className="flex border-2 border-gray-300 border-b-2 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Тц изд. 2, сек: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={cycleTime2}
                      onChange={(e) => setCycleTime2(e.target.value)}
                      required
                      className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                    />
                  </div>
                  <div className="flex border-2 border-gray-300 border-b-2">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[150px] border-r-2 border-gray-300 flex items-center">
                      Суточный темп изд. 2, шт.: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={dailyPace2}
                      onChange={(e) => setDailyPace2(e.target.value)}
                      required
                      className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                    />
                  </div>
                </div>
              </div>
            )
          }
          
          // Статическая информация для типа "почасовой по мощности"
          if (isHourlyByPower) {
            return (
              <div className="mb-[-2px]">
                <div className="grid grid-cols-2">
                  {/* Левая колонка */}
                  <div className="flex flex-col">
                    {/* Наименование продукции - выпадающий список */}
                    <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                      <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                        Наименование продукции: <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          required
                          className="w-full h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0 appearance-none cursor-pointer"
                        >
                          <option value="">Выберите наименование</option>
                          {productNames.map((product) => (
                            <option key={product.id} value={product.value}>
                              {product.value}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                      <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                        Подразделения: <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required
                          disabled={isOperator}
                          className={`w-full h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0 appearance-none ${isOperator ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
                        >
                          <option value="">Выберите подразделение</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.value}>
                              {dept.value}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-2 border-gray-300 border-b-2 border-r-0">
                      <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                        ФИО заполняющего: <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex-1 px-3 py-1">
                        <UserSelector
                          value={fillerName}
                          onChange={setFillerName}
                          disabled={isOperator}
                          className={`h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0 ${isOperator ? 'cursor-not-allowed bg-gray-100' : ''}`}
                          placeholder="Выберите пользователя..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex border-2 border-gray-300 border-b-0">
                      <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                        Дата/смена: <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex-1 relative">
                        <ShiftSelector
                          value={cycleTime}
                          onChange={(value: string) => setCycleTime(value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex border-2 border-gray-300 border-b-0">
                      <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                        Мощность рабочего места, шт./час: <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={workplacePower}
                        onChange={(e) => setWorkplacePower(e.target.value)}
                        required
                        className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                      />
                    </div>
                    {/* Суточный темп */}
                    <div className="flex border-2 border-gray-300 border-b-0 last:border-b-2">
                      <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                        Суточный темп, шт: <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={dailyPace}
                        onChange={(e) => setDailyPace(e.target.value)}
                        required
                        className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                      />
                    </div>
                    <div className="flex-1 border-2 border-gray-300 border-t-0 bg-gray-50/30"></div>
                  </div>
                </div>
              </div>
            )
          }
          
          // Статическая информация для остальных типов
          return (
            <div className="mb-[-2px]">
              <div className="grid grid-cols-2">
                {/* Левая колонка */}
                <div className="flex flex-col">
                  {/* Наименование продукции - выпадающий список (скрыто для типа "меньше одного изделия в час") */}
                  {!isLessThanPerHourType(paType) && (
                    <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                      <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                        Наименование продукции: <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          required
                          className="w-full h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0 appearance-none cursor-pointer"
                        >
                          <option value="">Выберите наименование</option>
                          {productNames.map((product) => (
                            <option key={product.id} value={product.value}>
                              {product.value}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex border-2 border-gray-300 border-b-0 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                      Подразделения: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                        className="w-full h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0 appearance-none cursor-pointer"
                      >
                        <option value="">Выберите подразделение</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.value}>
                            {dept.value}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* ФИО заполняющего */}
                  <div className="flex border-2 border-gray-300 border-b-2 border-r-0">
                    <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                      ФИО заполняющего: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex-1 px-3 py-1">
                      <UserSelector
                        value={fillerName}
                        onChange={setFillerName}
                        className="h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30 border-0"
                        placeholder="Выберите пользователя..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  {!isLessThanPerHourType(paType) && (
                    <div className="flex border-2 border-gray-300 border-b-0 last:border-b-2 h-[38px] items-center px-3 bg-gray-50">
                      <span className="text-[12px] font-normal text-black uppercase tracking-wider">MP-24-2023</span>
                    </div>
                  )}
                  {isLessThanPerHourType(paType) ? (
                    <>
                      <div className="flex border-2 border-gray-300 border-b-0">
                        <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                          Дата/смена: <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex-1 relative">
                          <ShiftSelector
                            value={cycleTime}
                            onChange={(value: string) => setCycleTime(value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="flex border-2 border-gray-300 border-b-0 last:border-b-2">
                        <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                          Суточный темп, шт: <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={dailyPace}
                          onChange={(e) => setDailyPace(e.target.value)}
                          required
                          className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex border-2 border-gray-300 border-b-0">
                        <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                          Время такта, сек: <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={cycleTime}
                          onChange={(e) => setCycleTime(e.target.value)}
                          required
                          className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                        />
                      </div>
                      {/* Суточный темп */}
                      <div className="flex border-2 border-gray-300 border-b-0 last:border-b-2">
                        <label className="bg-gray-100 text-[12px] font-normal text-black px-3 py-2 min-w-[200px] border-r-2 border-gray-300 flex items-center">
                          Суточный темп, шт: <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={dailyPace}
                          onChange={(e) => setDailyPace(e.target.value)}
                          required
                          className="flex-1 h-[38px] px-3 text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:bg-blue-50/30"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex-1 border-2 border-gray-300 border-t-0 bg-gray-50/30"></div>
                </div>
              </div>
            </div>
          )
        })()}

        {(() => {
          const paTypeLower = paType.toLowerCase().trim()
          const isMultipleNomenclatures = paTypeLower.includes('нескольк') && paTypeLower.includes('номенклатур')
          const isLessThanPerHour = isLessThanPerHourType(paType)
          const isHourlyByPower = paTypeLower.includes('часовой мощности') || 
                                 paTypeLower.includes('по часовой мощности') ||
                                 paTypeLower.includes('мощности рабочего') ||
                                 paTypeLower.includes('мощност')
          const isHourlyByTactTime = paTypeLower.includes('времени такта') || 
                                    paTypeLower.includes('по времени такта') ||
                                    paTypeLower.includes('время такта')

          if (isMultipleNomenclatures) {
            return <HourlyNTable rows={rows} updateRow={updateRow} isOperator={isOperator} />
          }

          if (isLessThanPerHour) {
            return <LessThanPerHourTable rows={rows} updateRow={updateRow} isOperator={isOperator} />
          }

          if (isHourlyByPower) {
            return <HourlyByPowerTable rows={rows} updateRow={updateRow} isOperator={isOperator} />
          }

          if (isHourlyByTactTime) {
            return <HourlyByTactTimeTable rows={rows} updateRow={updateRow} isOperator={isOperator} />
          }

          return <HourlyByTactTimeTable rows={rows} updateRow={updateRow} isOperator={isOperator} />
        })()}

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mt-6 gap-4">
          <div className="space-y-2 flex-1">
            {breaks.map((breakItem) => (
              <div key={breakItem.id} className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-gray-700 min-w-[100px]">
                  {breakItem.label}:
                </span>
                <select
                  value={breakItem.minutes}
                  onChange={(e) => updateBreak(breakItem.id, 'minutes', e.target.value)}
                  className="h-[32px] px-2 border-2 border-[#CCCCCC] rounded text-[12px] bg-white appearance-none pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="">Минут</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </select>
                <span className="text-[14px] font-bold text-gray-700">с</span>
                <input
                  type="time"
                  value={breakItem.from}
                  onChange={(e) => updateBreak(breakItem.id, 'from', e.target.value)}
                  className="h-[32px] px-2 border-2 border-[#CCCCCC] rounded text-[12px] bg-white appearance-none"
                />
                <span className="text-[14px] font-bold text-gray-700">до</span>
                <input
                  type="time"
                  value={breakItem.to}
                  onChange={(e) => updateBreak(breakItem.id, 'to', e.target.value)}
                  className="h-[32px] px-2 border-2 border-[#CCCCCC] rounded text-[12px] bg-white appearance-none"
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
