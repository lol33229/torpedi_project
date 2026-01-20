// Временный моковый файл для тестирования отчетов
// Можно удалить после отладки

export interface MockRawData {
  id: number
  date: string
  fact: number
  dailyRate: number
  departmentId?: number
  shiftId?: number
  nameOfProductId?: number
  productionDocumentId?: number
  productionDocument?: {
    id: number
  }
  department?: {
    id: number
    value: string
  }
  shift?: {
    id: number
    value: string
  }
  nameOfProduct?: {
    id: number
    value: string
  }
}

export interface MockDownTimeData {
  id: number
  documentId: number
  reasonGroupId: number
  reasonGroup: {
    id: number
    value: string
  }
  reasonId?: number
  reason?: {
    id: number
    value: string
  }
  downTime: number
  actionTake?: string
}

export interface MockPABlank {
  id: number
  blankNumber: number
  paType: string
  productName: string
  department: string
  fillerName: string
  cycleTime: string
  dailyPace: string
  rows: any[]
  breaks: any[]
}

// Моковые данные для бланков ПА (по подразделениям и сменам)
export const mockPABlanks: MockPABlank[] = [
  // Участок 1, Ранняя смена
  {
    id: 1,
    blankNumber: 1,
    paType: 'Бланк по времени такта',
    productName: 'Изделие А',
    department: 'Участок 1',
    fillerName: 'Иванов И.И.',
    cycleTime: '120',
    dailyPace: '100',
    rows: [],
    breaks: []
  },
  {
    id: 3,
    blankNumber: 3,
    paType: 'Бланк по времени такта',
    productName: 'Изделие В',
    department: 'Участок 1',
    fillerName: 'Сидоров С.С.',
    cycleTime: '110',
    dailyPace: '120',
    rows: [],
    breaks: []
  },
  // Участок 1, Поздняя смена
  {
    id: 4,
    blankNumber: 4,
    paType: 'Бланк по часовой мощности',
    productName: 'Изделие А',
    department: 'Участок 1',
    fillerName: 'Кузнецов К.К.',
    cycleTime: '115',
    dailyPace: '110',
    rows: [],
    breaks: []
  },
  // Участок 2, Поздняя смена
  {
    id: 2,
    blankNumber: 2,
    paType: 'Бланк по часовой мощности',
    productName: 'Изделие Б',
    department: 'Участок 2',
    fillerName: 'Петров П.П.',
    cycleTime: '90',
    dailyPace: '150',
    rows: [],
    breaks: []
  },
  // Участок 2, Ночная смена
  {
    id: 5,
    blankNumber: 5,
    paType: 'Бланк по времени такта',
    productName: 'Изделие Б',
    department: 'Участок 2',
    fillerName: 'Смирнов С.С.',
    cycleTime: '95',
    dailyPace: '140',
    rows: [],
    breaks: []
  },
  // Участок 3, Ранняя смена
  {
    id: 6,
    blankNumber: 6,
    paType: 'Бланк по часовой мощности',
    productName: 'Изделие В',
    department: 'Участок 3',
    fillerName: 'Васильев В.В.',
    cycleTime: '100',
    dailyPace: '130',
    rows: [],
    breaks: []
  }
]

// Моковые исходные данные из API (по подразделениям и сменам)
export const mockRawData: MockRawData[] = [
  // Участок 1, Ранняя смена
  {
    id: 1,
    date: '2024-01-15',
    fact: 95,
    dailyRate: 100,
    departmentId: 1,
    shiftId: 1,
    nameOfProductId: 1,
    productionDocumentId: 101,
    productionDocument: { id: 101 },
    department: { id: 1, value: 'Участок 1' },
    shift: { id: 1, value: 'Ранняя' },
    nameOfProduct: { id: 1, value: 'Изделие А' }
  },
  {
    id: 3,
    date: '2024-01-15',
    fact: 115,
    dailyRate: 120,
    departmentId: 1,
    shiftId: 1,
    nameOfProductId: 3,
    productionDocumentId: 103,
    productionDocument: { id: 103 },
    department: { id: 1, value: 'Участок 1' },
    shift: { id: 1, value: 'Ранняя' },
    nameOfProduct: { id: 3, value: 'Изделие В' }
  },
  // Участок 1, Поздняя смена
  {
    id: 4,
    date: '2024-01-15',
    fact: 105,
    dailyRate: 110,
    departmentId: 1,
    shiftId: 2,
    nameOfProductId: 1,
    productionDocumentId: 104,
    productionDocument: { id: 104 },
    department: { id: 1, value: 'Участок 1' },
    shift: { id: 2, value: 'Поздняя' },
    nameOfProduct: { id: 1, value: 'Изделие А' }
  },
  // Участок 2, Поздняя смена
  {
    id: 2,
    date: '2024-01-15',
    fact: 145,
    dailyRate: 150,
    departmentId: 2,
    shiftId: 2,
    nameOfProductId: 2,
    productionDocumentId: 102,
    productionDocument: { id: 102 },
    department: { id: 2, value: 'Участок 2' },
    shift: { id: 2, value: 'Поздняя' },
    nameOfProduct: { id: 2, value: 'Изделие Б' }
  },
  // Участок 2, Ночная смена
  {
    id: 5,
    date: '2024-01-15',
    fact: 135,
    dailyRate: 140,
    departmentId: 2,
    shiftId: 3,
    nameOfProductId: 2,
    productionDocumentId: 105,
    productionDocument: { id: 105 },
    department: { id: 2, value: 'Участок 2' },
    shift: { id: 3, value: 'Ночная' },
    nameOfProduct: { id: 2, value: 'Изделие Б' }
  },
  // Участок 3, Ранняя смена
  {
    id: 6,
    date: '2024-01-15',
    fact: 125,
    dailyRate: 130,
    departmentId: 3,
    shiftId: 1,
    nameOfProductId: 3,
    productionDocumentId: 106,
    productionDocument: { id: 106 },
    department: { id: 3, value: 'Участок 3' },
    shift: { id: 1, value: 'Ранняя' },
    nameOfProduct: { id: 3, value: 'Изделие В' }
  }
]

// Моковые данные downtime
export const mockDownTimeData: { [documentId: number]: MockDownTimeData[] } = {
  // Участок 1, Ранняя смена
  101: [
    {
      id: 1,
      documentId: 101,
      reasonGroupId: 1,
      reasonGroup: { id: 1, value: 'Группа 1' },
      reasonId: 1,
      reason: { id: 1, value: 'Причина 1' },
      downTime: 30,
      actionTake: 'Действие 1'
    },
    {
      id: 2,
      documentId: 101,
      reasonGroupId: 2,
      reasonGroup: { id: 2, value: 'Группа 2' },
      reasonId: 2,
      reason: { id: 2, value: 'Причина 2' },
      downTime: 15,
      actionTake: 'Действие 2'
    }
  ],
  103: [
    {
      id: 4,
      documentId: 103,
      reasonGroupId: 1,
      reasonGroup: { id: 1, value: 'Группа 1' },
      reasonId: 4,
      reason: { id: 4, value: 'Причина 4' },
      downTime: 25,
      actionTake: 'Действие 4'
    },
    {
      id: 5,
      documentId: 103,
      reasonGroupId: 4,
      reasonGroup: { id: 4, value: 'Группа 4' },
      reasonId: 5,
      reason: { id: 5, value: 'Причина 5' },
      downTime: 10,
      actionTake: 'Действие 5'
    }
  ],
  // Участок 1, Поздняя смена
  104: [
    {
      id: 6,
      documentId: 104,
      reasonGroupId: 2,
      reasonGroup: { id: 2, value: 'Группа 2' },
      reasonId: 6,
      reason: { id: 6, value: 'Причина 6' },
      downTime: 20,
      actionTake: 'Действие 6'
    }
  ],
  // Участок 2, Поздняя смена
  102: [
    {
      id: 3,
      documentId: 102,
      reasonGroupId: 3,
      reasonGroup: { id: 3, value: 'Группа 3' },
      reasonId: 3,
      reason: { id: 3, value: 'Причина 3' },
      downTime: 20,
      actionTake: 'Действие 3'
    }
  ],
  // Участок 2, Ночная смена
  105: [
    {
      id: 7,
      documentId: 105,
      reasonGroupId: 3,
      reasonGroup: { id: 3, value: 'Группа 3' },
      reasonId: 7,
      reason: { id: 7, value: 'Причина 7' },
      downTime: 15,
      actionTake: 'Действие 7'
    }
  ],
  // Участок 3, Ранняя смена
  106: [
    {
      id: 8,
      documentId: 106,
      reasonGroupId: 1,
      reasonGroup: { id: 1, value: 'Группа 1' },
      reasonId: 8,
      reason: { id: 8, value: 'Причина 8' },
      downTime: 18,
      actionTake: 'Действие 8'
    }
  ]
}

// Функции для использования моковых данных
export const mockApi = {
  // Имитация paBlankApi.getAll()
  getAllBlanks: async (): Promise<MockPABlank[]> => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockPABlanks
  },

  // Имитация paApi.getAllHourlyByTactTime() и других методов
  getAllRawData: async (): Promise<MockRawData[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockRawData
  },

  // Имитация downTimeApi.getByDocumentId()
  getDownTimeByDocumentId: async (documentId: number): Promise<MockDownTimeData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockDownTimeData[documentId] || []
  }
}

// Моковые справочники
export const mockCatalogs = [
  {
    id: 1,
    title: 'Подразделение',
    values: [
      { id: 1, value: 'Участок 1' },
      { id: 2, value: 'Участок 2' },
      { id: 3, value: 'Участок 3' }
    ]
  },
  {
    id: 2,
    title: 'Смена',
    values: [
      { id: 1, value: 'Ранняя' },
      { id: 2, value: 'Поздняя' },
      { id: 3, value: 'Ночная' }
    ]
  },
  {
    id: 3,
    title: 'Наименование продукции',
    values: [
      { id: 1, value: 'Изделие А' },
      { id: 2, value: 'Изделие Б' },
      { id: 3, value: 'Изделие В' }
    ]
  }
]

// Функции для использования моковых данных
export const mockCatalogApi = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockCatalogs
  }
}

// Пример использования в компоненте:
/*
import { mockApi, mockPABlanks, mockRawData, mockDownTimeData, mockCatalogApi } from './reportMockData'

// В функции loadReportData можно временно заменить:
const allBlanks = await mockApi.getAllBlanks()
const allRawData = await mockApi.getAllRawData()
const downtimeData = await mockApi.getDownTimeByDocumentId(productionDocumentId)
const catalogs = await mockCatalogApi.getAll()
*/
