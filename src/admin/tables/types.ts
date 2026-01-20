export interface TimeSlot {
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
  // Поля для второй номенклатуры (Бланк по часовой N)
  plan2?: string
  planCumulative2?: string | number
  fact2?: string
  factCumulative2?: string | number
  deviation2?: string | number
  deviationCumulative2?: string | number
  // Поля для операций (Бланк меньше одного изделия в час)
  operation?: string
  startTimePlan?: string
  startTimeFact?: string
  endTimePlan?: string
  endTimeFact?: string
  // Поля для переналадок
  isSetup?: boolean
  setupNumber?: number
  isTotal?: boolean
}

export interface TableProps {
  rows: TimeSlot[]
  updateRow: (index: number, field: keyof TimeSlot, value: string | number) => void
  isOperator?: boolean // Флаг для режима оператора
}

export const OPERATION_MAPPING: { [key: string]: string } = {
  '1. Операция': '1. Подсборка',
  '2. Операция деталь 1': '2. Установка детали 1',
  '3. Операция деталь 2': '3. Установка детали 2',
  '4. Операция деталь 3': '4. Установка детали 3',
  '5. Операция': '5. Настройка',
}
