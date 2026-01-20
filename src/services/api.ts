import axios from 'axios'

// Используем /api префикс для работы через Vite proxy
// Прокси в vite.config.ts перенаправляет /api/* на http://localhost:5182/*
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Используем /api для прокси
    withCredentials: true, // Важно для работы с cookies
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    },
    responseType: 'json',
    responseEncoding: 'utf8',
})

// Перехватчик для добавления токена авторизации
api.interceptors.request.use((config) => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('authToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    // Отладка (можно удалить)
    const baseURL = config.baseURL || ''
    const url = config.url || ''
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${baseURL}${url}`
    console.log('API Request:', `${baseURL}${url}`, 'Full URL:', fullUrl)
    return config
})

// Интерфейсы для API
export interface LoginRequest {
    email: string
    password: string
    twoFactorCode?: string
    twoFactorRecoveryCode?: string
}

export interface UserInfo {
    userName: string
    email: string
    roles: string[]
    status?: string // Статус пользователя (если доступен)
}

export interface UserResponse {
    id?: string
    userName?: string
    email?: string
    status: string
    roles: (string | null)[]
}

// API методы
export const authApi = {
    register: async (userName: string, email: string, password: string): Promise<void> => {
        const response = await api.post('/register', { userName, email, password })
        return response.data
    },

    login: async (userName: string, password: string): Promise<{ token?: string; accessToken?: string }> => {
        // Не передаем useCookies, так как бэкенд не настроен для cookie authentication
        // Используем Bearer токены
        const response = await api.post('/login', {
            email: userName,
            password
        })
        return response.data
    },

    logout: async (): Promise<void> => {
        await api.post('/logout')
    },

    getUserInfo: async (): Promise<UserInfo> => {
        const response = await api.get('/manage/info')
        return response.data
    },

    // Попытка получить статус текущего пользователя
    // Работает только для админов (они могут получить список пользователей)
    // Для обычных пользователей возвращает null
    getCurrentUserStatus: async (): Promise<string | null> => {
        try {
            const allUsers = await userApi.getAll()
            const currentUserInfo = await authApi.getUserInfo()
            const currentUser = allUsers.find(u => u.email === currentUserInfo.email)
            return currentUser?.status || null
        } catch (error: any) {
            // Если 403 - нет прав (обычный пользователь), возвращаем null
            if (error.response?.status === 403) {
                return null
            }
            console.error('Error getting current user status:', error)
            return null
        }
    },
}

export const userApi = {
    getAll: async (): Promise<UserResponse[]> => {
        try {
            const response = await api.get('/user')
            return response.data
        } catch (error: any) {
            // Если 403 - нет прав (например, для начальника), возвращаем пустой массив
            if (error.response?.status === 403) {
                console.log('Нет прав для получения списка пользователей')
                return []
            }
            // Для других ошибок пробрасываем дальше
            throw error
        }
    },

    getByEmail: async (email: string): Promise<UserResponse | null> => {
        try {
            const allUsers = await userApi.getAll()
            return allUsers.find(u => u.email === email) || null
        } catch (error: any) {
            // Если 403 - нет прав, возвращаем null
            if (error.response?.status === 403) {
                return null
            }
            console.error('Error getting user by email:', error)
            return null
        }
    },

    changeRole: async (email: string, role: string): Promise<void> => {
        await api.patch('/user/changeRole', { email, role })
    },

    changeStatus: async (email: string, statusId: number): Promise<void> => {
        await api.patch('/user/changeStatus', { email, statusId })
    },
}

export interface CatalogValue {
    id: number
    value: string
}

export interface Catalog {
    id: number
    title: string
    values: CatalogValue[]
}

export const catalogApi = {
    getAll: async (): Promise<Catalog[]> => {
        const response = await api.get('/catalog')
        return response.data
    },

    getById: async (id: number): Promise<Catalog> => {
        const response = await api.get(`/catalog/${id}`)
        return response.data
    },

    create: async (title: string, values: string[]): Promise<Catalog> => {
        const response = await api.post('/catalog', { title, values })
        return response.data
    },

    update: async (id: number, title: string): Promise<void> => {
        await api.patch(`/catalog/${id}`, { title })
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/catalog/${id}`)
    },

    // Методы для работы со значениями справочников
    addValue: async (catalogId: number, value: string): Promise<CatalogValue> => {
        const response = await api.post(`/catalog/${catalogId}/value`, { value })
        return response.data
    },

    updateValue: async (catalogId: number, valueId: number, value: string): Promise<void> => {
        await api.patch(`/catalog/${catalogId}/value/${valueId}`, { value })
    },

    deleteValue: async (catalogId: number, valueId: number): Promise<void> => {
        await api.delete(`/catalog/${catalogId}/value/${valueId}`)
    },
}

// Интерфейс для данных downtime согласно Swagger ProductionDownTime
export interface DownTimeData {
    id: number
    documentId: number
    responsibleId?: number // Опциональное поле
    responsible?: {
        id: number
        value: string
    }
    reasonGroupId: number // Обязательное поле
    reasonGroup: {
        id: number
        value: string
    }
    reasonId?: number // Опциональное поле
    reason?: {
        id: number
        value: string
    }
    downTime: number
    actionTake?: string // Может быть nullable
}

export interface ReasonGroupStatistic {
    reasonGroupName: string
    reasonName: string
    deviation: number
}

export const downTimeApi = {
    getByDocumentId: async (documentId: number): Promise<DownTimeData[]> => {
        const response = await api.get(`/downtime/${documentId}`)
        return response.data
    },

    create: async (data: {
        documentId: number
        reasonGroupId: number // Обязательное поле
        downTime: number // Обязательное поле
        actionTake?: string | null // Опциональное, может быть null
        responsibleId?: number // Опциональное - только если валидный ID
        reasonId?: number // Опциональное - только если валидный ID
    }): Promise<DownTimeData> => {
        const response = await api.post('/downtime', data)
        return response.data
    },
}

// API для бланков ПА
export interface HourlyByTactTimeCreateRequest {
    nameOfProductId: number
    departmentId: number
    performerId: number
    shiftId: number
    workHourId: number
    tactTime: number
    dailyRate: number
    fact: number
    date: string // DateOnly в формате "YYYY-MM-DD"
}

export interface HourlyByPowerCreateRequest {
    nameOfProductId: number
    departmentId: number
    performerId: number
    shiftId: number
    workHourId: number
    power: number
    dailyRate: number
    fact: number
    date: string
}

export interface HourlySeveralCreateRequest {
    product1Id: number
    product2Id: number
    departmentId: number
    performerId: number
    shiftId: number
    workHourId: number
    date: string
    cycleTime1: number
    cycleTime2: number
    dailyRate1: number
    dailyRate2: number
    fact: number
    changeover: number
}

export interface LessThanPerHourCreateRequest {
    departmentId: number
    performerId: number
    date: string
    shiftId: number
    workHourId: number
    operationNameId: number
    startTimePlan: string // TimeOnly в формате "HH:mm:ss"
    startTimeFact: string
    endTimePlan: string
    endTimeFact: string
    plan: number
    fact: number
    // status: string // Убрано, так как колонка Status не существует в таблице LessThanPerHour
}

export const paApi = {
    // Почасовой по времени такта
    getAllHourlyByTactTime: async () => {
        const response = await api.get('/hourlyByTactTime')
        return response.data
    },

    getHourlyByTactTimeById: async (id: number) => {
        const response = await api.get(`/hourlyByTactTime/${id}`)
        return response.data
    },

    createHourlyByTactTime: async (data: HourlyByTactTimeCreateRequest) => {
        const response = await api.post('/hourlyByTactTime', data)
        return response.data
    },

    updateHourlyByTactTime: async (id: number, data: Partial<HourlyByTactTimeCreateRequest>) => {
        const response = await api.patch(`/hourlyByTactTime/${id}`, data)
        return response.data
    },

    deleteHourlyByTactTime: async (id: number) => {
        await api.delete(`/hourlyByTactTime/${id}`)
    },

    // Почасовой по мощности
    getAllHourlyByPower: async () => {
        const response = await api.get('/hourlyByPower')
        return response.data
    },

    getHourlyByPowerById: async (id: number) => {
        const response = await api.get(`/hourlyByPower/${id}`)
        return response.data
    },

    createHourlyByPower: async (data: HourlyByPowerCreateRequest) => {
        const response = await api.post('/hourlyByPower', data)
        return response.data
    },

    updateHourlyByPower: async (id: number, data: Partial<HourlyByPowerCreateRequest>) => {
        const response = await api.patch(`/hourlyByPower/${id}`, data)
        return response.data
    },

    deleteHourlyByPower: async (id: number) => {
        await api.delete(`/hourlyByPower/${id}`)
    },

    // Почасовой несколько номенклатур
    getAllHourlySeveral: async () => {
        const response = await api.get('/hourlySeveral')
        return response.data
    },

    getHourlySeveralById: async (id: number) => {
        const response = await api.get(`/hourlySeveral/${id}`)
        return response.data
    },

    createHourlySeveral: async (data: HourlySeveralCreateRequest) => {
        const response = await api.post('/hourlySeveral', data)
        return response.data
    },

    updateHourlySeveral: async (id: number, data: Partial<HourlySeveralCreateRequest>) => {
        const response = await api.patch(`/hourlySeveral/${id}`, data)
        return response.data
    },

    deleteHourlySeveral: async (id: number) => {
        await api.delete(`/hourlySeveral/${id}`)
    },

    // Почасовой менее 1 изделия в час
    getAllLessThanPerHour: async () => {
        const response = await api.get('/lessThanPerHour')
        return response.data
    },

    getLessThanPerHourById: async (id: number) => {
        const response = await api.get(`/lessThanPerHour/${id}`)
        return response.data
    },

    createLessThanPerHour: async (data: LessThanPerHourCreateRequest) => {
        const response = await api.post('/lessThanPerHour', data)
        return response.data
    },

    updateLessThanPerHour: async (id: number, data: Partial<LessThanPerHourCreateRequest>) => {
        const response = await api.patch(`/lessThanPerHour/${id}`, data)
        return response.data
    },

    deleteLessThanPerHour: async (id: number) => {
        await api.delete(`/lessThanPerHour/${id}`)
    },
}

// Вспомогательная функция для скачивания файла
const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

export const exportApi = {
    // Hourly By Tact Time
    exportHourlyByTactTimeExcel: async () => {
        const response = await api.get('/hourlyByTactTime/excel', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'hourlyByTactTime.xlsx')
    },

    exportHourlyByTactTimePdf: async () => {
        const response = await api.get('/hourlyByTactTime/pdf', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'hourlyByTactTime.pdf')
    },

    // Hourly By Power
    exportHourlyByPowerExcel: async () => {
        const response = await api.get('/hourlyByPower/excel', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'hourlyByPower.xlsx')
    },

    exportHourlyByPowerPdf: async () => {
        const response = await api.get('/hourlyByPower/pdf', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'hourlyByPower.pdf')
    },

    // Hourly Several
    exportHourlySeveralExcel: async () => {
        const response = await api.get('/hourlySeveral/excel', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'hourlySeveral.xlsx')
    },

    exportHourlySeveralPdf: async () => {
        const response = await api.get('/hourlySeveral/pdf', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'hourlySeveral.pdf')
    },

    // Less Than Per Hour
    exportLessThanPerHourExcel: async () => {
        const response = await api.get('/lessThanPerHour/excel', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'lessThanPerHour.xlsx')
    },

    exportLessThanPerHourPdf: async () => {
        const response = await api.get('/lessThanPerHour/pdf', {
            responseType: 'blob'
        })
        downloadFile(response.data, 'lessThanPerHour.pdf')
    },

    // Экспорт отчетов по причинам простоев
    exportReportExcel: async (filters: {
        departmentId?: number
        shiftId?: number
        date?: string // YYYY-MM-DD
        productId?: number
    }) => {
        const params = new URLSearchParams()
        if (filters.departmentId) params.append('departmentId', filters.departmentId.toString())
        if (filters.shiftId) params.append('shiftId', filters.shiftId.toString())
        if (filters.date) params.append('date', filters.date)
        if (filters.productId) params.append('productId', filters.productId.toString())
        
        const queryString = params.toString()
        const url = `/report/excel${queryString ? `?${queryString}` : ''}`
        
        const response = await api.get(url, {
            responseType: 'blob'
        })
        downloadFile(response.data, 'report.xlsx')
    },

    exportReportPdf: async (filters: {
        departmentId?: number
        shiftId?: number
        date?: string // YYYY-MM-DD
        productId?: number
    }) => {
        const params = new URLSearchParams()
        if (filters.departmentId) params.append('departmentId', filters.departmentId.toString())
        if (filters.shiftId) params.append('shiftId', filters.shiftId.toString())
        if (filters.date) params.append('date', filters.date)
        if (filters.productId) params.append('productId', filters.productId.toString())
        
        const queryString = params.toString()
        const url = `/report/pdf${queryString ? `?${queryString}` : ''}`
        
        const response = await api.get(url, {
            responseType: 'blob'
        })
        downloadFile(response.data, 'report.pdf')
    },
}

// API для бланков ПА (Production Analysis Blanks)
// Бланки ПА хранятся в таблице HourlyByPower
export type PABlank = {
    id?: number
    blankNumber: number
    paType: string
    productName: string
    department: string
    fillerName: string
    cycleTime: string
    dailyPace: string
    workplacePower?: string
    // Поля для бланка "по часовой N" (несколько номенклатур)
    productName1?: string
    productName2?: string
    cycleTime1?: string
    cycleTime2?: string
    dailyPace1?: string
    dailyPace2?: string
    dateShift?: string
    rows: any[] // TimeSlot[]
    breaks: any[] // BreakSettings[]
    createdAt?: string
    updatedAt?: string
}

export interface PABlankCreateRequest {
    blankNumber: number
    paType: string
    productName: string
    department: string
    fillerName: string
    cycleTime: string
    dailyPace: string
    workplacePower?: string
    // Поля для бланка "по часовой N" (несколько номенклатур)
    productName1?: string
    productName2?: string
    cycleTime1?: string
    cycleTime2?: string
    dailyPace1?: string
    dailyPace2?: string
    dateShift?: string
    rows: any[]
    breaks: any[]
}

// Расширенный интерфейс для HourlyByTactTime с дополнительными полями для бланка
interface HourlyByTactTimeWithBlank extends HourlyByTactTimeCreateRequest {
    blankNumber?: number
    paType?: string
    productName?: string
    department?: string
    fillerName?: string
    cycleTime?: string
    dailyPace?: string
    rowsJson?: string // JSON строка для rows
    breaksJson?: string // JSON строка для breaks
}

// Функция для сохранения данных downtime через API /downtime
// АРХИТЕКТУРА:
// - rowsJson содержит ТОЛЬКО структуру строк (time, plan, fact) - БЕЗ reasonGroups/reasons/downtime/responsible
// - reasonGroups/reasons/downtime/responsible сохраняются ТОЛЬКО через /downtime API
// - Каждая строка с заполненной reasonGroups = одна запись в ProductionDownTime
const saveDownTimeData = async (hourlyByTactTimeResponse: any, rows: any[]): Promise<void> => {
    console.log('saveDownTimeData: НАЧАЛО. hourlyByTactTimeResponse:', hourlyByTactTimeResponse, 'rows:', rows?.length || 0)
    try {
        // Получаем productionDocumentId из ответа HourlyByTactTime
        const productionDocumentId = hourlyByTactTimeResponse?.productionDocumentId || 
                                     hourlyByTactTimeResponse?.productionDocument?.id ||
                                     hourlyByTactTimeResponse?.ProductionDocumentId ||
                                     (hourlyByTactTimeResponse?.productionDocument && typeof hourlyByTactTimeResponse.productionDocument === 'object' 
                                        ? hourlyByTactTimeResponse.productionDocument.id : null)
        
        console.log('saveDownTimeData: productionDocumentId:', productionDocumentId, 'из данных:', {
            productionDocumentId: hourlyByTactTimeResponse?.productionDocumentId,
            productionDocumentId2: hourlyByTactTimeResponse?.productionDocument?.id,
            ProductionDocumentId: hourlyByTactTimeResponse?.ProductionDocumentId,
            productionDocument: hourlyByTactTimeResponse?.productionDocument
        })
        
        if (!productionDocumentId) {
            console.warn('saveDownTimeData: productionDocumentId не найден, пропускаем сохранение downtime. Полные данные:', JSON.stringify(hourlyByTactTimeResponse, null, 2))
            return
        }

        console.log('saveDownTimeData: Сохраняем downtime для documentId:', productionDocumentId, 'строк для обработки:', rows.filter(r => !r.isBreak && !r.isTotal).length)

        // Сначала удаляем все существующие записи downtime для этого документа
        // (чтобы избежать дублирования при обновлении)
        try {
            const existingDownTimes = await downTimeApi.getByDocumentId(productionDocumentId)
            console.log('saveDownTimeData: Найдено существующих downtime записей:', existingDownTimes.length)
            // TODO: Добавить удаление, если бэкенд поддерживает DELETE /downtime/{id}
        } catch (error) {
            console.warn('saveDownTimeData: Не удалось загрузить существующие downtime записи:', error)
        }

        // Проходим по всем строкам и сохраняем данные downtime
        let savedCount = 0
        let skippedCount = 0
        
        for (const row of rows) {
            // Пропускаем перерывы и итоговые строки
            if (row.isBreak || row.isTotal) {
                continue
            }

            // Сохраняем ТОЛЬКО строки с заполненной reasonGroups (обязательное поле)
            if (!row.reasonGroups || !row.reasonGroups.trim()) {
                skippedCount++
                continue
            }

            // Получаем ID группы причин из справочника
            let reasonGroupId: number | null = null
            reasonGroupId = await getCatalogValueId('Группы причин простоя', row.reasonGroups)
            if (!reasonGroupId || reasonGroupId === 0) {
                reasonGroupId = await getCatalogValueId('Группа причин простоя', row.reasonGroups)
            }
            if (!reasonGroupId || reasonGroupId === 0) {
                reasonGroupId = await getCatalogValueId('Группы причин', row.reasonGroups)
            }

            if (!reasonGroupId || reasonGroupId === 0) {
                console.warn('saveDownTimeData: reasonGroupId не найден для', row.reasonGroups, '- пропускаем строку')
                skippedCount++
                continue
            }
            
            console.log('saveDownTimeData: Найден reasonGroupId:', reasonGroupId, 'для', row.reasonGroups)

            // Получаем опциональные ID
            let reasonId: number | null = null
            if (row.reasons && row.reasons.trim()) {
                reasonId = await getCatalogValueId('Причины отклонений', row.reasons)
                if (!reasonId || reasonId === 0) {
                    reasonId = null
                }
            }

            let responsibleId: number | null = null
            if (row.responsible && row.responsible.trim()) {
                responsibleId = await getCatalogValueId('ФИО заполняющего', row.responsible)
                if (!responsibleId || responsibleId === 0) {
                    responsibleId = null
                }
            }

            // Вычисляем downTime (в минутах)
            let downTimeValue = Math.round(parseFloat(row.downtime) || 0)
            
            // Если есть reasonGroups, но downTime = 0, устанавливаем минимальное значение 1
            // (бэкенд может не принимать downTime = 0, но нам нужно сохранить запись с reasonGroups)
            if (downTimeValue === 0) {
                console.log('saveDownTimeData: downTime = 0 для строки', row.time, ', устанавливаем минимальное значение 1')
                downTimeValue = 1 // Минимальное значение для сохранения записи
            }
            
            const actionTakeValue = (row.reasons || '').trim()
            
            // Формируем данные для /downtime согласно Swagger
            // ВАЖНО: НЕ включаем reasonId и responsibleId, если они не валидны
            // Бэкенд может интерпретировать undefined/null как 0, что вызывает foreign key constraint error
            const downtimeData: any = {
                documentId: productionDocumentId,
                reasonGroupId: reasonGroupId,
                downTime: downTimeValue,
                actionTake: actionTakeValue || '' // Пустая строка вместо null
            }

            // Добавляем опциональные поля ТОЛЬКО если ID валидны и > 0
            // НЕ добавляем поле вообще, если ID невалиден (не undefined, не null, не 0)
            if (reasonId && reasonId > 0) {
                downtimeData.reasonId = reasonId
                console.log('saveDownTimeData: Добавляем reasonId:', reasonId)
            } else {
                console.log('saveDownTimeData: reasonId не добавляем (невалиден или отсутствует)')
            }
            
            if (responsibleId && responsibleId > 0) {
                downtimeData.responsibleId = responsibleId
                console.log('saveDownTimeData: Добавляем responsibleId:', responsibleId)
            } else {
                console.log('saveDownTimeData: responsibleId не добавляем (невалиден или отсутствует)')
            }
            
            // ВАЖНО: Убеждаемся, что в объекте НЕТ полей reasonId/responsibleId, если они невалидны
            // Это предотвратит отправку undefined/null, которые могут интерпретироваться как 0

            try {
                // ВАЖНО: Убеждаемся, что в объекте НЕТ полей reasonId/responsibleId, если они невалидны
                // Удаляем их явно, если они undefined/null/0
                const cleanDowntimeData: any = {
                    documentId: downtimeData.documentId,
                    reasonGroupId: downtimeData.reasonGroupId,
                    downTime: downtimeData.downTime,
                    actionTake: downtimeData.actionTake
                }
                
                // Добавляем только валидные опциональные поля
                if (downtimeData.reasonId && downtimeData.reasonId > 0) {
                    cleanDowntimeData.reasonId = downtimeData.reasonId
                }
                if (downtimeData.responsibleId && downtimeData.responsibleId > 0) {
                    cleanDowntimeData.responsibleId = downtimeData.responsibleId
                }
                
                console.log('saveDownTimeData: Отправляем в /downtime (очищенные данные):', JSON.stringify(cleanDowntimeData, null, 2))
                console.log('saveDownTimeData: Ключи в объекте:', Object.keys(cleanDowntimeData))
                const result = await downTimeApi.create(cleanDowntimeData)
                savedCount++
                console.log('saveDownTimeData: ✓ Сохранено для строки', row.time, 'результат:', result)
            } catch (error: any) {
                // Выводим полную информацию об ошибке
                const errorDetails = {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    responseData: error.response?.data,
                    responseHeaders: error.response?.headers,
                    downtimeData: downtimeData
                }
                console.error('saveDownTimeData: ✗ Ошибка для строки', row.time, ':', errorDetails)
                
                // Пытаемся извлечь детали ошибки из response.data
                if (error.response?.data) {
                    const errorData = typeof error.response.data === 'string' 
                        ? error.response.data 
                        : JSON.stringify(error.response.data, null, 2)
                    console.error('saveDownTimeData: Детали ошибки от бэкенда:', errorData.substring(0, 1000))
                }
                // Не прерываем цикл, продолжаем для других строк
            }
        }
        
        console.log('saveDownTimeData: Завершено. Сохранено:', savedCount, ', пропущено:', skippedCount)
    } catch (error: any) {
        console.error('saveDownTimeData: Общая ошибка:', error.message || error)
    }
}

// Функции преобразования данных бланка в формат HourlyByTactTime
// Вспомогательная функция для получения ID из справочника по значению
const getCatalogValueId = async (catalogTitle: string, value: string): Promise<number | null> => {
    try {
        if (!value || !value.trim()) {
            return null
        }
        
        const catalogs = await catalogApi.getAll()
        // Ищем справочник по точному совпадению или частичному
        const catalog = catalogs.find(c => 
            c.title === catalogTitle || 
            c.title?.toLowerCase().includes(catalogTitle.toLowerCase()) ||
            catalogTitle.toLowerCase().includes(c.title?.toLowerCase() || '')
        )
        
        if (!catalog || !catalog.values || catalog.values.length === 0) {
            console.warn(`getCatalogValueId: Справочник "${catalogTitle}" не найден. Доступные справочники:`, catalogs.map(c => c.title))
            return null
        }

        // Ищем значение в массиве values справочника (точное совпадение)
        let catalogValue = catalog.values.find((v: CatalogValue) => v.value === value)
        
        // Если не найдено точное совпадение, ищем частичное
        if (!catalogValue) {
            catalogValue = catalog.values.find((v: CatalogValue) => 
                v.value?.toLowerCase().includes(value.toLowerCase()) ||
                value.toLowerCase().includes(v.value?.toLowerCase() || '')
            )
        }
        
        if (!catalogValue) {
            console.warn(`getCatalogValueId: Значение "${value}" не найдено в справочнике "${catalog.title}". Доступные значения:`, catalog.values.map(v => v.value))
            return null
        }

        return catalogValue.id
    } catch (error) {
        console.error(`getCatalogValueId: Ошибка получения ID из справочника ${catalogTitle}:`, error)
        return null
    }
}

// Функция для получения названия значения справочника по ID
const getCatalogValueName = async (catalogTitle: string, id: number): Promise<string | null> => {
    try {
        const catalogs = await catalogApi.getAll()
        const catalog = catalogs.find(c => c.title === catalogTitle)
        if (catalog && catalog.values) {
            const catalogValue = catalog.values.find(v => v.id === id)
            return catalogValue?.value || null
        }
        return null
    } catch (error) {
        console.error(`Ошибка получения названия для ID ${id} из справочника "${catalogTitle}":`, error)
        return null
    }
}

const convertBlankToHourlyByTactTime = async (blank: PABlankCreateRequest): Promise<HourlyByTactTimeWithBlank> => {
    // Получаем ID из справочников
    let nameOfProductId = await getCatalogValueId('Наименование продукции', blank.productName)
    let departmentId = await getCatalogValueId('Подразделение', blank.department)
    let performerId = await getCatalogValueId('ФИО заполняющего', blank.fillerName)

    // Если ID не найдены, получаем первый доступный ID из соответствующих справочников
    if (!nameOfProductId) {
        const catalogs = await catalogApi.getAll()
        const productCatalog = catalogs.find(c => c.title === 'Наименование продукции')
        nameOfProductId = productCatalog?.values?.[0]?.id || 1
    }

    if (!departmentId) {
        const catalogs = await catalogApi.getAll()
        const deptCatalog = catalogs.find(c => c.title === 'Подразделение')
        departmentId = deptCatalog?.values?.[0]?.id || 1
    }

    if (!performerId) {
        const catalogs = await catalogApi.getAll()
        const performerCatalog = catalogs.find(c => c.title === 'ФИО заполняющего')
        performerId = performerCatalog?.values?.[0]?.id || 1
    }

    // Получаем первый доступный ID для смены и часа работы
    const catalogs = await catalogApi.getAll()
    const shiftCatalog = catalogs.find(c => c.title === 'Смена')
    const workHourCatalog = catalogs.find(c => c.title === 'Время работы, час')

    // Для смены используем первый доступный ID
    let shiftId = shiftCatalog?.values?.[0]?.id
    if (!shiftId) {
        // Если справочник "Смена" пуст, используем ID из любого другого справочника с значениями
        const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
        shiftId = catalogWithValues?.values?.[0]?.id || 16 // Используем ID 16 из справочника "Смена" как fallback
    }

    // ВАЖНО: workHourId должен быть из справочника "Время работы, час", иначе будет ошибка внешнего ключа
    let workHourId = workHourCatalog?.values?.[0]?.id
    if (!workHourId) {
        // Если справочник "Время работы, час" пуст, используем ID из справочника "Смена" как временное решение
        console.warn('Справочник "Время работы, час" не найден или пуст. Используется ID из справочника "Смена" как временное решение.')
        const shiftCatalog = catalogs.find(c => c.title === 'Смена')
        workHourId = shiftCatalog?.values?.[0]?.id
        if (!workHourId) {
            // Если и справочник "Смена" пуст, используем первый доступный ID из любого справочника
            const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
            workHourId = catalogWithValues?.values?.[0]?.id
            if (!workHourId) {
                throw new Error('Не найдено ни одного справочника с значениями. Пожалуйста, заполните справочники перед созданием бланка.')
            }
        }
    }

    // Создаем уникальную дату на основе blankNumber, чтобы избежать конфликта уникального индекса
    // Используем базовую дату и добавляем дни на основе blankNumber
    const baseDate = new Date('2024-01-01')
    const uniqueDate = new Date(baseDate)
    uniqueDate.setDate(baseDate.getDate() + (blank.blankNumber || 1))
    const dateString = uniqueDate.toISOString().split('T')[0]

    // Используем blankNumber для выбора WorkHourId из существующих значений справочника
    // ВАЖНО: всегда используем ID из справочника "Время работы, час", не вычисляем арифметически
    let finalWorkHourId = workHourId
    if (blank.blankNumber > 0 && workHourCatalog && workHourCatalog.values && workHourCatalog.values.length > 0) {
        // Выбираем ID из существующих значений справочника по индексу
        const index = (blank.blankNumber - 1) % workHourCatalog.values.length
        finalWorkHourId = workHourCatalog.values[index]?.id || workHourCatalog.values[0]?.id || workHourId
    }

    // rowsJson содержит ВСЕ данные строк, включая reasonGroups/reasons/downtime/responsible
    // Это нужно для совместимости и как резервный источник данных
    // Дополнительно данные сохраняются через /downtime API для отчетов и аналитики
    const result = {
        nameOfProductId,
        departmentId,
        performerId,
        shiftId,
        workHourId: finalWorkHourId,
        tactTime: parseFloat(blank.cycleTime) || 0,
        dailyRate: parseFloat(blank.dailyPace) || 0,
        fact: 0,
        date: dateString,
        blankNumber: blank.blankNumber,
        paType: blank.paType,
        productName: blank.productName,
        department: blank.department,
        fillerName: blank.fillerName,
        cycleTime: blank.cycleTime,
        dailyPace: blank.dailyPace,
        rowsJson: JSON.stringify(blank.rows), // ВСЕ данные, включая reasonGroups
        breaksJson: JSON.stringify(blank.breaks),
    }
    console.log('convertBlankToHourlyByTactTime: Сохраняем rowsJson с reasonGroups (первые 3 строки):', blank.rows.slice(0, 3).map(r => ({
        time: r.time,
        reasonGroups: r.reasonGroups,
        reasons: r.reasons
    })))
    return result
}

// Функция для загрузки данных downtime и восстановления их в rows
// ЛОГИКА: 
// 1. rowsJson - основной источник данных (структура + reasonGroups из localStorage/БД)
// 2. downtime - дополнительный источник (приоритетнее, если есть)
// 3. При загрузке: сначала rowsJson, затем ПЕРЕЗАПИСЫВАЕМ данными из downtime (они более актуальные)
const loadDownTimeDataToRows = async (productionDocumentId: number | null | undefined, rows: any[]): Promise<any[]> => {
    console.log('loadDownTimeDataToRows: НАЧАЛО. productionDocumentId:', productionDocumentId, 'rows.length:', rows.length)
    
    if (!productionDocumentId) {
        console.log('loadDownTimeDataToRows: productionDocumentId отсутствует, возвращаем rows как есть')
        return rows
    }

    if (rows.length === 0) {
        console.log('loadDownTimeDataToRows: rows пустой, не можем загрузить downtime')
        return rows
    }

    try {
        console.log('loadDownTimeDataToRows: Запрашиваем /downtime/' + productionDocumentId)
        const downTimeData = await downTimeApi.getByDocumentId(productionDocumentId)
        console.log('loadDownTimeDataToRows: Загружено downtime записей:', downTimeData.length, 'данные:', downTimeData)

        if (downTimeData.length === 0) {
            return rows
        }

        // Распределяем данные downtime по строкам по порядку
        // Каждая запись downtime соответствует одной строке (по порядку, пропуская break/total)
        let downtimeIndex = 0
        for (const row of rows) {
            if (row.isBreak || row.isTotal) {
                continue
            }

            if (downtimeIndex < downTimeData.length) {
                const dt = downTimeData[downtimeIndex]
                
                // ПЕРЕЗАПИСЫВАЕМ данными из downtime (они приоритетнее)
                if (dt.reasonGroup?.value) {
                    row.reasonGroups = dt.reasonGroup.value
                }
                if (dt.reason?.value) {
                    row.reasons = dt.reason.value
                } else if (dt.actionTake) {
                    row.reasons = dt.actionTake
                }
                if (dt.downTime !== undefined && dt.downTime !== null) {
                    row.downtime = dt.downTime.toString()
                }
                if (dt.responsible?.value) {
                    row.responsible = dt.responsible.value
                }
                
                downtimeIndex++
            }
        }

        console.log('loadDownTimeDataToRows: Заполнено строк из downtime:', downtimeIndex, 'из', downTimeData.length)
        return rows
    } catch (error: any) {
        console.error('loadDownTimeDataToRows: Ошибка:', error.message || error)
        return rows
    }
}

// Функция преобразования HourlyByTactTime обратно в формат бланка
const convertHourlyByTactTimeToBlank = async (data: any): Promise<PABlank> => {
    // Пытаемся извлечь данные из дополнительных полей или из JSON
    let rows: any[] = []
    let breaks: any[] = []

    // Безопасное извлечение строк из объектов (та же логика, что и для других полей)
    const getStringValue = (value: any): string => {
        if (typeof value === 'string') return value
        if (value && typeof value === 'object' && 'value' in value) return String(value.value || '')
        return ''
    }
    
    // Извлекаем rowsJson и breaksJson используя ТОЧНО ТУ ЖЕ логику, что и для productName, department, fillerName
    // rowsJson и breaksJson - это строки JSON, которые приходят напрямую из БД
    // Проверяем все возможные варианты названий полей, включая вложенные объекты
    console.log('convertHourlyByTactTimeToBlank: Проверяем наличие rowsJson в данных:', {
        hasRowsJson: 'rowsJson' in data,
        hasRowsJsonLower: 'rowsjson' in data,
        hasRowsJsonUpper: 'RowsJson' in data,
        hasProductionDocument: 'productionDocument' in data,
        productionDocumentKeys: data.productionDocument ? Object.keys(data.productionDocument) : [],
        productionDocumentFull: JSON.stringify(data.productionDocument, null, 2),
        allKeys: Object.keys(data),
        rowsJsonValue: data.rowsJson,
        rowsJsonType: typeof data.rowsJson,
        // Проверяем все ключи, которые могут содержать JSON
        allKeysWithJson: Object.keys(data).filter(k => k.toLowerCase().includes('json') || k.toLowerCase().includes('rows') || k.toLowerCase().includes('break')),
        // Выводим все значения для отладки
        allDataValues: Object.keys(data).reduce((acc: any, key) => {
            const value = data[key]
            if (typeof value === 'string' && value.length > 0 && value.length < 500) {
                acc[key] = value
            } else if (typeof value === 'object' && value !== null) {
                acc[key] = `[Object with keys: ${Object.keys(value).join(', ')}]`
            }
            return acc
        }, {})
    })
    
    // Проверяем rowsJson в основном объекте
    // Сначала проверяем прямое строковое значение (даже если пустое, но не null/undefined)
    let rowsJsonStr = ''
    if (data.rowsJson !== null && data.rowsJson !== undefined) {
        if (typeof data.rowsJson === 'string') {
            rowsJsonStr = data.rowsJson
        } else {
            // Пробуем через getStringValue для объектов
            rowsJsonStr = getStringValue(data.rowsJson) || ''
        }
    }
    
    // Если не нашли, пробуем другие варианты названия
    if (!rowsJsonStr) {
        if (data.RowsJson !== null && data.RowsJson !== undefined) {
            if (typeof data.RowsJson === 'string') {
                rowsJsonStr = data.RowsJson
            } else {
                rowsJsonStr = getStringValue(data.RowsJson) || ''
            }
        }
    }
    
    if (!rowsJsonStr && data.rowsjson !== null && data.rowsjson !== undefined) {
        if (typeof data.rowsjson === 'string') {
            rowsJsonStr = data.rowsjson
        } else {
            rowsJsonStr = getStringValue(data.rowsjson) || ''
        }
    }
    
    // Если не нашли в основном объекте, проверяем в productionDocument
    if (!rowsJsonStr && data.productionDocument) {
        console.log('convertHourlyByTactTimeToBlank: Проверяем productionDocument для rowsJson:', {
            productionDocumentKeys: Object.keys(data.productionDocument),
            productionDocumentValues: Object.keys(data.productionDocument).reduce((acc: any, key) => {
                const value = data.productionDocument[key]
                if (typeof value === 'string' && value.length > 0 && value.length < 500) {
                    acc[key] = value.substring(0, 200)
                } else if (typeof value === 'object' && value !== null) {
                    acc[key] = `[Object with keys: ${Object.keys(value).join(', ')}]`
                }
                return acc
            }, {})
        })
        
        rowsJsonStr = getStringValue(data.productionDocument.rowsJson) || 
                     getStringValue(data.productionDocument.RowsJson) || 
                     getStringValue(data.productionDocument.rowsjson) ||
                     (typeof data.productionDocument.rowsJson === 'string' ? data.productionDocument.rowsJson : '') ||
                     ''
        if (rowsJsonStr) {
            console.log('convertHourlyByTactTimeToBlank: rowsJson найден в productionDocument')
        }
    }
    
    // Проверяем все вложенные объекты на наличие rowsJson
    if (!rowsJsonStr) {
        for (const key in data) {
            if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
                const nestedObj = data[key] as any
                if ('rowsJson' in nestedObj || 'RowsJson' in nestedObj || 'rowsjson' in nestedObj) {
                    rowsJsonStr = getStringValue(nestedObj.rowsJson) || 
                                 getStringValue(nestedObj.RowsJson) || 
                                 getStringValue(nestedObj.rowsjson) ||
                                 (typeof nestedObj.rowsJson === 'string' ? nestedObj.rowsJson : '') ||
                                 ''
                    if (rowsJsonStr) {
                        console.log(`convertHourlyByTactTimeToBlank: rowsJson найден в вложенном объекте "${key}"`)
                        break
                    }
                }
            }
        }
    }
    
    console.log('convertHourlyByTactTimeToBlank: rowsJsonStr:', rowsJsonStr ? 'найден' : 'не найден', rowsJsonStr ? `(длина: ${rowsJsonStr.length})` : '')
    
    if (rowsJsonStr) {
        try {
            rows = JSON.parse(rowsJsonStr)
            console.log('convertHourlyByTactTimeToBlank: Успешно распарсили rowsJson, количество строк:', rows.length)
            // Нормализуем данные - убеждаемся, что все поля правильно инициализированы
            rows = rows.map((r: any) => ({
                ...r,
                reasonGroups: r.reasonGroups || '',
                reasons: r.reasons || ''
            }))
            console.log('convertHourlyByTactTimeToBlank: Первые 3 строки после нормализации:', rows.slice(0, 3).map((r: any) => ({
                time: r.time,
                reasonGroups: r.reasonGroups,
                reasons: r.reasons
            })))
        } catch (e) {
            console.error('Ошибка парсинга rowsJson:', e, 'rowsJsonStr:', rowsJsonStr.substring(0, 200))
        }
    } else {
        console.warn('convertHourlyByTactTimeToBlank: rowsJson не найден в данных')
        // Пытаемся загрузить из localStorage как резервный вариант
        const blankId = data.id || data.Id
        if (blankId) {
            try {
                const savedRowsJson = localStorage.getItem(`paBlank_${blankId}_rowsJson`)
                if (savedRowsJson) {
                    console.log('convertHourlyByTactTimeToBlank: Загружаем rowsJson из localStorage для бланка', blankId)
                    try {
                        rows = JSON.parse(savedRowsJson)
                        console.log('convertHourlyByTactTimeToBlank: Успешно загружено из localStorage, строк:', rows.length)
                    } catch (e) {
                        console.error('convertHourlyByTactTimeToBlank: Ошибка парсинга rowsJson из localStorage:', e)
                    }
                }
            } catch (e) {
                console.warn('convertHourlyByTactTimeToBlank: Не удалось загрузить из localStorage:', e)
            }
        }
        
        // ВАЖНО: Если rows пустой, мы не можем загрузить данные из downtime
        // потому что нет структуры для сопоставления. Нужно либо rowsJson, либо генерировать структуру
        if (rows.length === 0) {
            console.warn('convertHourlyByTactTimeToBlank: rows пустой - не можем загрузить downtime без структуры строк')
        }
    }

    // Проверяем breaksJson в основном объекте
    // Сначала проверяем прямое строковое значение (даже если пустое, но не null/undefined)
    let breaksJsonStr = ''
    if (data.breaksJson !== null && data.breaksJson !== undefined) {
        if (typeof data.breaksJson === 'string') {
            breaksJsonStr = data.breaksJson
        } else {
            // Пробуем через getStringValue для объектов
            breaksJsonStr = getStringValue(data.breaksJson) || ''
        }
    }
    
    // Если не нашли, пробуем другие варианты названия
    if (!breaksJsonStr) {
        if (data.BreaksJson !== null && data.BreaksJson !== undefined) {
            if (typeof data.BreaksJson === 'string') {
                breaksJsonStr = data.BreaksJson
            } else {
                breaksJsonStr = getStringValue(data.BreaksJson) || ''
            }
        }
    }
    
    if (!breaksJsonStr && data.breaksjson !== null && data.breaksjson !== undefined) {
        if (typeof data.breaksjson === 'string') {
            breaksJsonStr = data.breaksjson
        } else {
            breaksJsonStr = getStringValue(data.breaksjson) || ''
        }
    }
    
    // Если не нашли в основном объекте, проверяем в productionDocument
    if (!breaksJsonStr && data.productionDocument) {
        breaksJsonStr = getStringValue(data.productionDocument.breaksJson) || 
                       getStringValue(data.productionDocument.BreaksJson) || 
                       getStringValue(data.productionDocument.breaksjson) ||
                       (typeof data.productionDocument.breaksJson === 'string' ? data.productionDocument.breaksJson : '') ||
                       ''
        if (breaksJsonStr) {
            console.log('convertHourlyByTactTimeToBlank: breaksJson найден в productionDocument')
        }
    }
    
    if (breaksJsonStr) {
        try {
            breaks = JSON.parse(breaksJsonStr)
            console.log('convertHourlyByTactTimeToBlank: Успешно распарсили breaksJson, количество перерывов:', breaks.length)
        } catch (e) {
            console.error('Ошибка парсинга breaksJson:', e)
        }
    } else {
        console.warn('convertHourlyByTactTimeToBlank: breaksJson не найден в данных, breaks будет пустым массивом')
    }
    
    // Извлекаем данные из связанных объектов, если дополнительные поля не сохранены
    const productName = getStringValue(data.productName) || getStringValue(data.nameOfProduct) || ''
    const department = getStringValue(data.department) || ''
    const fillerName = getStringValue(data.fillerName) || getStringValue(data.performer) || ''
    // hourlyByTactTime = Бланк по времени такта
    // Улучшенная логика извлечения paType: проверяем разные варианты
    let paType = ''
    if (data.paType) {
        if (typeof data.paType === 'string') {
            paType = data.paType
        } else if (typeof data.paType === 'object' && 'value' in data.paType) {
            paType = String(data.paType.value || '')
        } else {
            paType = String(data.paType)
        }
    }
    if (!paType || paType === '') {
        paType = 'Бланк по времени такта'
    }
    console.log('convertHourlyByTactTimeToBlank: paType из данных:', { raw: data.paType, extracted: paType, fullData: data })
    const blankNumber = data.blankNumber || data.id || 0

    // Загружаем данные downtime и восстанавливаем их в rows
    const productionDocumentId = data.productionDocumentId || data.productionDocument?.id
    const rowsWithDownTime = await loadDownTimeDataToRows(productionDocumentId, rows)

    return {
        id: data.id,
        blankNumber,
        paType,
        productName,
        department,
        fillerName,
        cycleTime: data.cycleTime || data.tactTime?.toString() || '', // Используем tactTime если cycleTime не задан
        dailyPace: data.dailyPace || data.dailyRate?.toString() || '',
        rows: rowsWithDownTime,
        breaks,
    }
}

// Функция преобразования бланка в формат HourlyByPower (Бланк по часовой мощности)
const convertBlankToHourlyByPower = async (blank: PABlankCreateRequest): Promise<any> => {
    // Получаем ID из справочников (та же логика, что и для HourlyByTactTime)
    let nameOfProductId = await getCatalogValueId('Наименование продукции', blank.productName)
    let departmentId = await getCatalogValueId('Подразделение', blank.department)
    let performerId = await getCatalogValueId('ФИО заполняющего', blank.fillerName)

    // Если ID не найдены, получаем первый доступный ID из соответствующих справочников
    if (!nameOfProductId) {
        const catalogs = await catalogApi.getAll()
        const productCatalog = catalogs.find(c => c.title === 'Наименование продукции')
        nameOfProductId = productCatalog?.values?.[0]?.id || 1
    }

    if (!departmentId) {
        const catalogs = await catalogApi.getAll()
        const deptCatalog = catalogs.find(c => c.title === 'Подразделение')
        departmentId = deptCatalog?.values?.[0]?.id || 1
    }

    if (!performerId) {
        const catalogs = await catalogApi.getAll()
        const performerCatalog = catalogs.find(c => c.title === 'ФИО заполняющего')
        performerId = performerCatalog?.values?.[0]?.id || 1
    }

    // Получаем ID для смены и часа работы
    // Для типа "почасовой по мощности" cycleTime используется как "Дата/смена" (название смены)
    let shiftId: number | null = null
    if (blank.cycleTime) {
        shiftId = await getCatalogValueId('Смена', blank.cycleTime)
    }
    
    // Если не найден по названию, используем первый доступный ID
    if (!shiftId) {
        const catalogs = await catalogApi.getAll()
        const shiftCatalog = catalogs.find(c => c.title === 'Смена')
        shiftId = shiftCatalog?.values?.[0]?.id || null
        if (!shiftId) {
            const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
            shiftId = catalogWithValues?.values?.[0]?.id || 16
        }
    }

    const catalogs = await catalogApi.getAll()
    const workHourCatalog = catalogs.find(c => c.title === 'Время работы, час')

    // ВАЖНО: workHourId должен быть из справочника "Время работы, час", иначе будет ошибка внешнего ключа FK_HourlyByPower_CatalogValue_WorkHourId
    let workHourId = workHourCatalog?.values?.[0]?.id
    if (!workHourId) {
        // Если справочник "Время работы, час" пуст, используем ID из справочника "Смена" как временное решение
        // Это может вызвать ошибку, но лучше попробовать, чем сразу выдавать ошибку
        console.warn('Справочник "Время работы, час" не найден или пуст. Используется ID из справочника "Смена" как временное решение.')
        const shiftCatalog = catalogs.find(c => c.title === 'Смена')
        workHourId = shiftCatalog?.values?.[0]?.id
        if (!workHourId) {
            // Если и справочник "Смена" пуст, используем первый доступный ID из любого справочника
            const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
            workHourId = catalogWithValues?.values?.[0]?.id
            if (!workHourId) {
                throw new Error('Не найдено ни одного справочника с значениями. Пожалуйста, заполните справочники перед созданием бланка.')
            }
        }
    }

    // Создаем уникальную дату на основе blankNumber
    const baseDate = new Date('2024-01-01')
    const uniqueDate = new Date(baseDate)
    uniqueDate.setDate(baseDate.getDate() + (blank.blankNumber || 1))
    const dateString = uniqueDate.toISOString().split('T')[0]

    // Используем blankNumber для выбора WorkHourId из существующих значений справочника
    // ВАЖНО: всегда используем ID из справочника "Время работы, час", не вычисляем арифметически
    let finalWorkHourId = workHourId
    if (blank.blankNumber > 0 && workHourCatalog && workHourCatalog.values && workHourCatalog.values.length > 0) {
        // Выбираем ID из существующих значений справочника по индексу
        const index = (blank.blankNumber - 1) % workHourCatalog.values.length
        finalWorkHourId = workHourCatalog.values[index]?.id || workHourCatalog.values[0]?.id || workHourId
    }

    const result = {
        nameOfProductId,
        departmentId,
        performerId,
        shiftId,
        workHourId: finalWorkHourId,
        // Для типа "по часовой мощности" используем workplacePower, если оно есть, иначе dailyPace
        power: blank.workplacePower ? parseFloat(blank.workplacePower) || 0 : parseFloat(blank.dailyPace) || 0,
        dailyRate: parseFloat(blank.dailyPace) || 0,
        fact: 0,
        date: dateString,
        blankNumber: blank.blankNumber,
        paType: blank.paType,
        productName: blank.productName,
        department: blank.department,
        fillerName: blank.fillerName,
        cycleTime: blank.cycleTime,
        dailyPace: blank.dailyPace,
        rowsJson: JSON.stringify(blank.rows),
        breaksJson: JSON.stringify(blank.breaks),
    }
    console.log('convertBlankToHourlyByPower: отправляем paType в БД:', { paType: blank.paType, fullData: result })
    return result
}

// Функция преобразования бланка в формат HourlySeveral (Бланк по часовой N)
const convertBlankToHourlySeveral = async (blank: PABlankCreateRequest): Promise<any> => {
    // Получаем ID для двух номенклатур
    // Используем productName1 и productName2, если они есть, иначе используем общий productName
    const product1Name = blank.productName1 || blank.productName || ''
    const product2Name = blank.productName2 || blank.productName || ''
    let product1Id = await getCatalogValueId('Наименование продукции', product1Name)
    let product2Id = await getCatalogValueId('Наименование продукции', product2Name)
    if (!product2Id) product2Id = product1Id // Если не найден, используем тот же ID

    let departmentId = await getCatalogValueId('Подразделение', blank.department)
    let performerId = await getCatalogValueId('ФИО заполняющего', blank.fillerName)

    // Если ID не найдены, получаем первый доступный ID
    if (!product1Id) {
        const catalogs = await catalogApi.getAll()
        const productCatalog = catalogs.find(c => c.title === 'Наименование продукции')
        product1Id = productCatalog?.values?.[0]?.id || 1
        product2Id = product1Id
    }

    if (!departmentId) {
        const catalogs = await catalogApi.getAll()
        const deptCatalog = catalogs.find(c => c.title === 'Подразделение')
        departmentId = deptCatalog?.values?.[0]?.id || 1
    }

    if (!performerId) {
        const catalogs = await catalogApi.getAll()
        const performerCatalog = catalogs.find(c => c.title === 'ФИО заполняющего')
        performerId = performerCatalog?.values?.[0]?.id || 1
    }

    // Получаем ID для смены и часа работы
    // Используем dateShift для поиска ID смены по названию
    let shiftId: number | null = null
    if (blank.dateShift) {
        shiftId = await getCatalogValueId('Смена', blank.dateShift)
    }
    
    // Если не найден по названию, используем первый доступный ID
    if (!shiftId) {
        const catalogs = await catalogApi.getAll()
        const shiftCatalog = catalogs.find(c => c.title === 'Смена')
        shiftId = shiftCatalog?.values?.[0]?.id || null
        if (!shiftId) {
            const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
            shiftId = catalogWithValues?.values?.[0]?.id || 16
        }
    }
    
    const catalogs = await catalogApi.getAll()
    const workHourCatalog = catalogs.find(c => c.title === 'Время работы, час')

    let workHourId = workHourCatalog?.values?.[0]?.id
    if (!workHourId) {
        const shiftCatalog = catalogs.find(c => c.title === 'Смена')
        workHourId = shiftCatalog?.values?.[0]?.id
        if (!workHourId) {
            const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
            workHourId = catalogWithValues?.values?.[0]?.id || 16
        }
    }

    // Создаем уникальную дату
    const baseDate = new Date('2024-01-01')
    const uniqueDate = new Date(baseDate)
    uniqueDate.setDate(baseDate.getDate() + (blank.blankNumber || 1))
    const dateString = uniqueDate.toISOString().split('T')[0]

    // Варьируем WorkHourId
    let finalWorkHourId = workHourId
    if (blank.blankNumber > 0) {
        const catalogs = await catalogApi.getAll()
        const workHourCatalog = catalogs.find(c => c.title === 'Время работы, час')
        if (workHourCatalog && workHourCatalog.values && workHourCatalog.values.length > 0) {
            const index = (blank.blankNumber - 1) % workHourCatalog.values.length
            finalWorkHourId = workHourCatalog.values[index]?.id || workHourId
        } else {
            finalWorkHourId = workHourId + (blank.blankNumber % 10)
        }
    }

    const result = {
        product1Id,
        product2Id,
        departmentId,
        performerId,
        shiftId,
        workHourId: finalWorkHourId,
        date: dateString,
        // Используем cycleTime1/cycleTime2 и dailyPace1/dailyPace2, если они есть, иначе используем общие значения
        cycleTime1: parseFloat(blank.cycleTime1 || blank.cycleTime) || 0,
        cycleTime2: parseFloat(blank.cycleTime2 || blank.cycleTime) || 0,
        dailyRate1: parseFloat(blank.dailyPace1 || blank.dailyPace) || 0,
        dailyRate2: parseFloat(blank.dailyPace2 || blank.dailyPace) || 0,
        fact: 0,
        changeover: 0, // Время переналадки
        blankNumber: blank.blankNumber,
        paType: blank.paType,
        productName: blank.productName || blank.productName1 || '',
        department: blank.department,
        fillerName: blank.fillerName,
        // Сохраняем дополнительные поля для бланка "по часовой N" (для загрузки обратно)
        cycleTime: blank.cycleTime1 || blank.cycleTime || '',
        dailyPace: blank.dailyPace1 || blank.dailyPace || '',
        productName1: blank.productName1 || blank.productName || '',
        productName2: blank.productName2 || blank.productName || '',
        // cycleTime1 и cycleTime2 уже определены выше как числа для API
        // Сохраняем строковые значения для загрузки обратно
        cycleTime1Str: blank.cycleTime1 || blank.cycleTime || '',
        cycleTime2Str: blank.cycleTime2 || blank.cycleTime || '',
        dailyPace1Str: blank.dailyPace1 || blank.dailyPace || '',
        dailyPace2Str: blank.dailyPace2 || blank.dailyPace || '',
        dateShift: blank.dateShift || '',
        rowsJson: JSON.stringify(blank.rows),
        breaksJson: JSON.stringify(blank.breaks),
    }
    console.log('convertBlankToHourlySeveral: отправляем paType в БД:', { paType: blank.paType, fullData: result })
    return result
}

// Функция преобразования бланка в формат LessThanPerHour (Бланк меньше одного изделия в час)
const convertBlankToLessThanPerHour = async (blank: PABlankCreateRequest): Promise<any> => {
    let departmentId = await getCatalogValueId('Подразделение', blank.department)
    let performerId = await getCatalogValueId('ФИО заполняющего', blank.fillerName)
    let operationNameId = await getCatalogValueId('Оборудование', blank.productName) // Используем productName как operationName

    // Если ID не найдены, получаем первый доступный ID
    if (!departmentId) {
        const catalogs = await catalogApi.getAll()
        const deptCatalog = catalogs.find(c => c.title === 'Подразделение')
        departmentId = deptCatalog?.values?.[0]?.id || 1
    }

    if (!performerId) {
        const catalogs = await catalogApi.getAll()
        const performerCatalog = catalogs.find(c => c.title === 'ФИО заполняющего')
        performerId = performerCatalog?.values?.[0]?.id || 1
    }

    if (!operationNameId) {
        const catalogs = await catalogApi.getAll()
        const operationCatalog = catalogs.find(c => c.title === 'Оборудование')
        operationNameId = operationCatalog?.values?.[0]?.id || 1
    }

    // Получаем ID для смены и часа работы
    // Для типа "меньше одного изделия в час" cycleTime используется как "Дата/смена" (название смены)
    let shiftId: number | null = null
    if (blank.cycleTime) {
        shiftId = await getCatalogValueId('Смена', blank.cycleTime)
    }
    
    // Если не найден по названию, используем первый доступный ID
    if (!shiftId) {
        const catalogs = await catalogApi.getAll()
        const shiftCatalog = catalogs.find(c => c.title === 'Смена')
        shiftId = shiftCatalog?.values?.[0]?.id || null
        if (!shiftId) {
            const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
            shiftId = catalogWithValues?.values?.[0]?.id || 16
        }
    }

    const catalogs = await catalogApi.getAll()
    const workHourCatalog = catalogs.find(c => c.title === 'Время работы, час')

    let workHourId = workHourCatalog?.values?.[0]?.id
    if (!workHourId) {
        const shiftCatalog = catalogs.find(c => c.title === 'Смена')
        workHourId = shiftCatalog?.values?.[0]?.id
        if (!workHourId) {
            const catalogWithValues = catalogs.find(c => c.values && c.values.length > 0)
            workHourId = catalogWithValues?.values?.[0]?.id || 16
        }
    }

    // Создаем уникальную дату
    const baseDate = new Date('2024-01-01')
    const uniqueDate = new Date(baseDate)
    uniqueDate.setDate(baseDate.getDate() + (blank.blankNumber || 1))
    const dateString = uniqueDate.toISOString().split('T')[0]

    // Варьируем WorkHourId
    let finalWorkHourId = workHourId
    if (blank.blankNumber > 0) {
        const catalogs = await catalogApi.getAll()
        const workHourCatalog = catalogs.find(c => c.title === 'Время работы, час')
        if (workHourCatalog && workHourCatalog.values && workHourCatalog.values.length > 0) {
            const index = (blank.blankNumber - 1) % workHourCatalog.values.length
            finalWorkHourId = workHourCatalog.values[index]?.id || workHourId
        } else {
            finalWorkHourId = workHourId + (blank.blankNumber % 10)
        }
    }

    return {
        departmentId,
        performerId,
        date: dateString,
        shiftId,
        workHourId: finalWorkHourId,
        operationNameId,
        startTimePlan: '08:00:00', // По умолчанию
        startTimeFact: '08:00:00',
        endTimePlan: '17:00:00',
        endTimeFact: '17:00:00',
        plan: parseFloat(blank.dailyPace) || 0,
        fact: 0,
        status: 'В работе', // Захардкоженный статус
        blankNumber: blank.blankNumber,
        paType: blank.paType,
        productName: blank.productName,
        department: blank.department,
        fillerName: blank.fillerName,
        cycleTime: blank.cycleTime,
        dailyPace: blank.dailyPace,
        rowsJson: JSON.stringify(blank.rows),
        breaksJson: JSON.stringify(blank.breaks),
    }
}

// Функции преобразования для других типов бланков
const convertHourlyByPowerToBlank = async (data: any): Promise<PABlank> => {
    let rows: any[] = []
    let breaks: any[] = []

    // Безопасное извлечение строк из объектов
    const getStringValue = (value: any): string => {
        if (typeof value === 'string') return value
        if (value && typeof value === 'object' && 'value' in value) return String(value.value || '')
        return ''
    }
    
    // Извлекаем rowsJson и breaksJson используя ТОЧНО ТУ ЖЕ логику, что и для productName, department, fillerName
    const rowsJsonStr = getStringValue(data.rowsJson) || getStringValue(data.RowsJson) || ''
    if (rowsJsonStr) {
        try {
            rows = JSON.parse(rowsJsonStr)
            // Нормализуем данные - убеждаемся, что все поля правильно инициализированы
            rows = rows.map((r: any) => ({
                ...r,
                reasonGroups: r.reasonGroups || '',
                reasons: r.reasons || ''
            }))
        } catch (e) {
            console.error('Ошибка парсинга rowsJson:', e)
        }
    }

    const breaksJsonStr = getStringValue(data.breaksJson) || getStringValue(data.BreaksJson) || ''
    if (breaksJsonStr) {
        try {
            breaks = JSON.parse(breaksJsonStr)
        } catch (e) {
            console.error('Ошибка парсинга breaksJson:', e)
        }
    }
    
    const productName = getStringValue(data.productName) || getStringValue(data.nameOfProduct) || ''
    const department = getStringValue(data.department) || ''
    const fillerName = getStringValue(data.fillerName) || getStringValue(data.performer) || ''
    // hourlyByPower = Бланк по часовой мощности
    // Улучшенная логика извлечения paType: проверяем разные варианты
    let paType = ''
    if (data.paType) {
        if (typeof data.paType === 'string') {
            paType = data.paType
        } else if (typeof data.paType === 'object' && 'value' in data.paType) {
            paType = String(data.paType.value || '')
        } else {
            paType = String(data.paType)
        }
    }
    if (!paType || paType === '') {
        paType = 'Бланк по часовой мощности'
    }
    console.log('convertHourlyByPowerToBlank: paType из данных:', { raw: data.paType, extracted: paType, fullData: data })
    const blankNumber = data.blankNumber || data.id || 0

    // Получаем название смены по shiftId (для типа "почасовой по мощности" cycleTime используется как "Дата/смена")
    let cycleTime = data.cycleTime || ''
    
    // Пробуем получить shiftId из разных возможных полей
    const shiftId = data.shiftId || data.shift?.id || (typeof data.shift === 'number' ? data.shift : null)
    
    if (shiftId) {
        const shiftName = await getCatalogValueName('Смена', shiftId)
        if (shiftName) {
            cycleTime = shiftName
        }
    }

    return {
        id: data.id,
        blankNumber,
        paType,
        productName,
        department,
        fillerName,
        cycleTime,
        dailyPace: data.dailyPace || data.dailyRate?.toString() || '',
        workplacePower: data.workplacePower || data.power?.toString() || '', // Загружаем workplacePower из power или из сохраненного поля
        rows,
        breaks,
    }
}

const convertHourlySeveralToBlank = async (data: any): Promise<PABlank> => {
    let rows: any[] = []
    let breaks: any[] = []

    // Безопасное извлечение строк из объектов
    const getStringValue = (value: any): string => {
        if (typeof value === 'string') return value
        if (value && typeof value === 'object' && 'value' in value) return String(value.value || '')
        return ''
    }
    
    // Извлекаем rowsJson и breaksJson используя ТОЧНО ТУ ЖЕ логику, что и для productName, department, fillerName
    const rowsJsonStr = getStringValue(data.rowsJson) || getStringValue(data.RowsJson) || ''
    if (rowsJsonStr) {
        try {
            rows = JSON.parse(rowsJsonStr)
            // Нормализуем данные - убеждаемся, что все поля правильно инициализированы
            rows = rows.map((r: any) => ({
                ...r,
                reasonGroups: r.reasonGroups || '',
                reasons: r.reasons || ''
            }))
        } catch (e) {
            console.error('Ошибка парсинга rowsJson:', e)
        }
    }

    const breaksJsonStr = getStringValue(data.breaksJson) || getStringValue(data.BreaksJson) || ''
    if (breaksJsonStr) {
        try {
            breaks = JSON.parse(breaksJsonStr)
        } catch (e) {
            console.error('Ошибка парсинга breaksJson:', e)
        }
    }

    const productName = getStringValue(data.productName) || getStringValue(data.product1) || getStringValue(data.product2) || ''
    const department = getStringValue(data.department) || ''
    const fillerName = getStringValue(data.fillerName) || getStringValue(data.performer) || ''
    // hourlySeveral = Бланк по часовой N
    // Улучшенная логика извлечения paType: проверяем разные варианты
    let paType = ''
    if (data.paType) {
        if (typeof data.paType === 'string') {
            paType = data.paType
        } else if (typeof data.paType === 'object' && 'value' in data.paType) {
            paType = String(data.paType.value || '')
        } else {
            paType = String(data.paType)
        }
    }
    if (!paType || paType === '') {
        paType = 'Бланк по часовой N'
    }
    console.log('convertHourlySeveralToBlank: paType из данных:', { raw: data.paType, extracted: paType, fullData: data })
    const blankNumber = data.blankNumber || data.id || 0

    // Получаем название смены по shiftId
    let dateShift = getStringValue(data.dateShift) || ''
    
    // Пробуем получить shiftId из разных возможных полей
    const shiftId = data.shiftId || data.shift?.id || (typeof data.shift === 'number' ? data.shift : null)
    
    if (shiftId) {
        const shiftName = await getCatalogValueName('Смена', shiftId)
        if (shiftName) {
            dateShift = shiftName
        }
    }

    return {
        id: data.id,
        blankNumber,
        paType,
        productName,
        department,
        fillerName,
        cycleTime: data.cycleTime || data.cycleTime1?.toString() || '',
        dailyPace: data.dailyPace || data.dailyRate1?.toString() || '',
        // Загружаем дополнительные поля для бланка "по часовой N"
        productName1: getStringValue(data.productName1) || getStringValue(data.product1) || productName,
        productName2: getStringValue(data.productName2) || getStringValue(data.product2) || productName,
        // Используем сохраненные строковые значения или числовые значения из API
        cycleTime1: getStringValue(data.cycleTime1Str) || data.cycleTime1?.toString() || data.cycleTime || '',
        cycleTime2: getStringValue(data.cycleTime2Str) || data.cycleTime2?.toString() || data.cycleTime || '',
        dailyPace1: getStringValue(data.dailyPace1Str) || data.dailyPace1?.toString() || data.dailyRate1?.toString() || data.dailyPace || '',
        dailyPace2: getStringValue(data.dailyPace2Str) || data.dailyPace2?.toString() || data.dailyRate2?.toString() || data.dailyPace || '',
        dateShift,
        rows,
        breaks,
    }
}

const convertLessThanPerHourToBlank = async (data: any): Promise<PABlank> => {
    let rows: any[] = []
    let breaks: any[] = []

    // Безопасное извлечение строк из объектов
    const getStringValue = (value: any): string => {
        if (typeof value === 'string') return value
        if (value && typeof value === 'object' && 'value' in value) return String(value.value || '')
        return ''
    }
    
    // Извлекаем rowsJson и breaksJson используя ТОЧНО ТУ ЖЕ логику, что и для productName, department, fillerName
    const rowsJsonStr = getStringValue(data.rowsJson) || getStringValue(data.RowsJson) || ''
    if (rowsJsonStr) {
        try {
            rows = JSON.parse(rowsJsonStr)
            // Нормализуем данные - убеждаемся, что все поля правильно инициализированы
            rows = rows.map((r: any) => ({
                ...r,
                reasonGroups: r.reasonGroups || '',
                reasons: r.reasons || ''
            }))
        } catch (e) {
            console.error('Ошибка парсинга rowsJson:', e)
        }
    }

    const breaksJsonStr = getStringValue(data.breaksJson) || getStringValue(data.BreaksJson) || ''
    if (breaksJsonStr) {
        try {
            breaks = JSON.parse(breaksJsonStr)
        } catch (e) {
            console.error('Ошибка парсинга breaksJson:', e)
        }
    }

    const productName = getStringValue(data.productName) || getStringValue(data.operationName) || ''
    const department = getStringValue(data.department) || ''
    const fillerName = getStringValue(data.fillerName) || getStringValue(data.performer) || ''
    // lessThanPerHour = Бланк меньше одного изделия в час
    // Улучшенная логика извлечения paType: проверяем разные варианты
    let paType = ''
    if (data.paType) {
        if (typeof data.paType === 'string') {
            paType = data.paType
        } else if (typeof data.paType === 'object' && 'value' in data.paType) {
            paType = String(data.paType.value || '')
        } else {
            paType = String(data.paType)
        }
    }
    if (!paType || paType === '') {
        paType = 'Бланк меньше одного изделия в час'
    }
    console.log('convertLessThanPerHourToBlank: paType из данных:', { raw: data.paType, extracted: paType, fullData: data })
    const blankNumber = data.blankNumber || data.id || 0

    // Получаем название смены по shiftId (для типа "меньше одного изделия в час" cycleTime используется как "Дата/смена")
    let cycleTime = data.cycleTime || ''
    
    // Пробуем получить shiftId из разных возможных полей
    const shiftId = data.shiftId || data.shift?.id || (typeof data.shift === 'number' ? data.shift : null)
    
    if (shiftId) {
        const shiftName = await getCatalogValueName('Смена', shiftId)
        if (shiftName) {
            cycleTime = shiftName
        }
    }

    return {
        id: data.id,
        blankNumber,
        paType,
        productName,
        department,
        fillerName,
        cycleTime,
        dailyPace: data.dailyPace || data.plan?.toString() || '',
        rows,
        breaks,
    }
}

// Функция для определения типа API по типу ПА
const getApiTypeFromPaType = (paType: string): string => {
    // Соответствие типов ПА и API эндпоинтов:
    // "Бланк по часовой мощности" или "Почасовой по мощности рабочего места" = hourlyByPower
    // "Бланк по времени такта" или "Почасовой по времени такта" = hourlyByTactTime
    // "Бланк по часовой N" или "Почасовой несколько номенклатур" = hourlySeveral
    // "Бланк меньше одного изделия в час" или "Почасовой менее 1 изделия в час" = lessThanPerHour
    // По умолчанию = hourlyByPower

    const paTypeLower = paType.toLowerCase().trim()
    // Проверяем оба формата: из бэкенда и из справочника
    if (paTypeLower.includes('часовой мощности') || paTypeLower.includes('по часовой мощности') ||
        paTypeLower.includes('мощности рабочего') || paTypeLower.includes('мощност')) {
        return 'power' // hourlyByPower
    } else if (paTypeLower.includes('времени такта') || paTypeLower.includes('по времени такта') ||
               paTypeLower.includes('время такта')) {
        return 'tactTime' // hourlyByTactTime
    } else if (paTypeLower.includes('часовой n') || paTypeLower.includes('по часовой n') || 
               (paTypeLower.includes('нескольк') && paTypeLower.includes('номенклатур'))) {
        return 'several' // hourlySeveral
    } else if (paTypeLower.includes('меньше одного изделия в час') || paTypeLower.includes('менее 1 изделия в час')) {
        return 'lessThanPerHour' // lessThanPerHour
    }
    // По умолчанию используем hourlyByPower (Бланк по часовой мощности)
    return 'power'
}

export const paBlankApi = {
    // Создать бланк ПА (сохраняем в зависимости от типа ПА)
    create: async (data: PABlankCreateRequest): Promise<PABlank> => {
        const apiType = getApiTypeFromPaType(data.paType || '')

        if (apiType === 'tactTime') {
            // Сохраняем в HourlyByTactTime (Бланк по времени такта)
            // Используем convertBlankToHourlyByTactTime, который отправляет поле tactTime
            const hourlyData = await convertBlankToHourlyByTactTime(data)
            // ВАЖНО: Сохраняем правильный paType в данных
            hourlyData.paType = data.paType || 'Бланк по времени такта'
            console.log('Создание в HourlyByTactTime: отправляем данные:', {
                hasRowsJson: 'rowsJson' in hourlyData,
                rowsJsonLength: hourlyData.rowsJson ? hourlyData.rowsJson.length : 0,
                rowsJsonPreview: hourlyData.rowsJson ? hourlyData.rowsJson.substring(0, 300) : 'отсутствует',
                hasBreaksJson: 'breaksJson' in hourlyData,
                breaksJsonLength: hourlyData.breaksJson ? hourlyData.breaksJson.length : 0,
                allKeys: Object.keys(hourlyData),
                fullData: hourlyData
            })
            // Отправляем как any, чтобы обойти проверку TypeScript и попробовать отправить rowsJson и breaksJson
            // даже если их нет в DTO (может быть бэкенд примет их, если они есть в модели БД)
            const response = await api.post('/hourlyByTactTime', hourlyData as any)
            console.log('Создание в HourlyByTactTime: получен ответ:', {
                hasRowsJson: 'rowsJson' in response.data,
                allKeys: Object.keys(response.data || {}),
                responseData: response.data
            })
            
            // Сохраняем данные downtime через API /downtime
            try {
                const rowsWithReasonGroups = (data.rows || []).filter((r: any) => r.reasonGroups && r.reasonGroups.trim())
                console.log('Создание: Вызываем saveDownTimeData с данными:', {
                    responseData: response.data,
                    responseDataKeys: Object.keys(response.data || {}),
                    productionDocumentId: response.data?.productionDocumentId,
                    productionDocument: response.data?.productionDocument,
                    rowsCount: (data.rows || []).length,
                    rowsWithReasonGroups: rowsWithReasonGroups.length,
                    rowsWithReasonGroupsData: rowsWithReasonGroups.slice(0, 3).map((r: any) => ({
                        time: r.time,
                        reasonGroups: r.reasonGroups,
                        reasons: r.reasons,
                        downtime: r.downtime
                    }))
                })
                if (rowsWithReasonGroups.length > 0) {
                    await saveDownTimeData(response.data, data.rows || [])
                } else {
                    console.log('Создание: Пропускаем saveDownTimeData - нет строк с reasonGroups')
                }
            } catch (error) {
                console.error('Создание: Ошибка при вызове saveDownTimeData:', error)
                // Не прерываем сохранение бланка, если ошибка в downtime
            }
            
            // ВРЕМЕННОЕ РЕШЕНИЕ: Если бэкенд не возвращает rowsJson, добавляем его из отправленных данных
            // Это нужно, пока бэкенд не будет исправлен, чтобы возвращать rowsJson
            const blankId = response.data.id || response.data.Id
            if (!response.data.rowsJson && hourlyData.rowsJson) {
                console.warn('Создание в HourlyByTactTime: бэкенд не вернул rowsJson, добавляем из отправленных данных')
                response.data.rowsJson = hourlyData.rowsJson
                // Сохраняем в localStorage как резервную копию
                if (blankId) {
                    try {
                        localStorage.setItem(`paBlank_${blankId}_rowsJson`, hourlyData.rowsJson)
                    } catch (e) {
                        console.warn('Не удалось сохранить rowsJson в localStorage:', e)
                    }
                }
            }
            if (!response.data.breaksJson && hourlyData.breaksJson) {
                console.warn('Создание в HourlyByTactTime: бэкенд не вернул breaksJson, добавляем из отправленных данных')
                response.data.breaksJson = hourlyData.breaksJson
                // Сохраняем в localStorage как резервную копию
                if (blankId) {
                    try {
                        localStorage.setItem(`paBlank_${blankId}_breaksJson`, hourlyData.breaksJson)
                    } catch (e) {
                        console.warn('Не удалось сохранить breaksJson в localStorage:', e)
                    }
                }
            }
            
            const blank = await convertHourlyByTactTimeToBlank(response.data)
            // Убеждаемся, что paType правильный
            blank.paType = data.paType || 'Бланк по времени такта'
            return blank
        } else if (apiType === 'power') {
            // Сохраняем в HourlyByPower (Бланк по часовой мощности)
            // Используем convertBlankToHourlyByPower, который отправляет поле power (мощность рабочего места)
            const hourlyData = await convertBlankToHourlyByPower(data)
            // Для типа "по часовой мощности" нужно использовать workplacePower как power
            if (data.workplacePower) {
                hourlyData.power = parseFloat(data.workplacePower) || 0
            }
            // ВАЖНО: Сохраняем правильный paType в данных, чтобы при загрузке он правильно определялся
            hourlyData.paType = data.paType || 'Бланк по часовой мощности'
            console.log('Отправляемые данные для HourlyByPower (по часовой мощности):', JSON.stringify(hourlyData, null, 2))
            const response = await api.post('/hourlyByPower', hourlyData)
            const blank = await convertHourlyByPowerToBlank(response.data)
            // Убеждаемся, что paType правильный
            if (blank) {
                blank.paType = data.paType || 'Бланк по часовой мощности'
            }
            return blank
        } else if (apiType === 'several') {
            // Сохраняем в HourlySeveral (Бланк по часовой N / несколько номенклатур)
            const hourlyData = await convertBlankToHourlySeveral(data)
            // ВАЖНО: Сохраняем правильный paType в данных
            hourlyData.paType = data.paType || 'Бланк по часовой N'
            console.log('Отправляемые данные для HourlySeveral (по часовой N):', JSON.stringify(hourlyData, null, 2))
            const response = await api.post('/hourlySeveral', hourlyData)
            const blank = await convertHourlySeveralToBlank(response.data)
            // Убеждаемся, что paType правильный
            if (blank) {
                blank.paType = data.paType || 'Бланк по часовой N'
            }
            return blank
        } else if (apiType === 'lessThanPerHour') {
            // Сохраняем в LessThanPerHour (Бланк меньше одного изделия в час)
            const hourlyData = await convertBlankToLessThanPerHour(data)
            // ВАЖНО: Проблема на бэкенде - модель Entity Framework имеет поле Status, которого нет в БД
            // Пробуем отправить БЕЗ поля status, хотя это может не помочь, если модель требует его
            const requestData: any = {
                departmentId: hourlyData.departmentId,
                performerId: hourlyData.performerId,
                date: hourlyData.date,
                shiftId: hourlyData.shiftId,
                workHourId: hourlyData.workHourId,
                operationNameId: hourlyData.operationNameId,
                startTimePlan: hourlyData.startTimePlan,
                startTimeFact: hourlyData.startTimeFact,
                endTimePlan: hourlyData.endTimePlan,
                endTimeFact: hourlyData.endTimeFact,
                plan: hourlyData.plan,
                fact: hourlyData.fact,
                // status НЕ отправляем - колонка Status не существует в таблице LessThanPerHour
                // Это проблема бэкенда, которую нужно исправить в модели C#
            }
            // Сохраняем дополнительные поля для localStorage отдельно
            const additionalData = {
                blankNumber: hourlyData.blankNumber,
                paType: hourlyData.paType,
                productName: hourlyData.productName,
                department: hourlyData.department,
                fillerName: hourlyData.fillerName,
                cycleTime: hourlyData.cycleTime,
                dailyPace: hourlyData.dailyPace,
                rowsJson: hourlyData.rowsJson,
                breaksJson: hourlyData.breaksJson,
            }
            console.log('Отправляемые данные для LessThanPerHour:', JSON.stringify(requestData, null, 2))
            const response = await api.post('/lessThanPerHour', requestData)
            // Объединяем ответ с дополнительными данными для конвертации
            const responseWithAdditional = { ...response.data, ...additionalData }
            return await convertLessThanPerHourToBlank(responseWithAdditional)
        } else {
            // По умолчанию сохраняем в HourlyByPower
            const hourlyData = await convertBlankToHourlyByPower(data)
            const response = await api.post('/hourlyByPower', hourlyData)
            return await convertHourlyByPowerToBlank(response.data)
        }
    },

    // Получить все бланки (загружаем из всех типов)
    getAll: async (): Promise<PABlank[]> => {
        const allBlanks: PABlank[] = []

        try {
            // Загружаем бланки по времени такта (hourlyByTactTime)
            const tactTimeResponse = await api.get('/hourlyByTactTime')
            if (Array.isArray(tactTimeResponse.data)) {
                const tactTimeBlanks = await Promise.all(tactTimeResponse.data.map(async (data: any) => {
                    const blank = await convertHourlyByTactTimeToBlank(data)
                    // Устанавливаем правильный тип если он не задан
                    if (!blank.paType) {
                        blank.paType = 'Бланк по времени такта'
                    }
                    return blank
                }))
                allBlanks.push(...tactTimeBlanks)
            }
        } catch (error) {
            console.error('Ошибка загрузки бланков HourlyByTactTime:', error)
        }

        try {
            // Загружаем бланки по часовой мощности (hourlyByPower)
            const powerResponse = await api.get('/hourlyByPower')
            if (Array.isArray(powerResponse.data)) {
                const powerBlanks = await Promise.all(powerResponse.data.map(async (data: any) => {
                    const blank = await convertHourlyByPowerToBlank(data)
                    // Устанавливаем правильный тип если он не задан
                    if (!blank.paType) {
                        blank.paType = 'Бланк по часовой мощности'
                    }
                    return blank
                }))
                allBlanks.push(...powerBlanks)
            }
        } catch (error) {
            console.error('Ошибка загрузки бланков HourlyByPower:', error)
        }

        try {
            // Загружаем бланки несколько номенклатур (hourlySeveral = Бланк по часовой N)
            const severalResponse = await api.get('/hourlySeveral')
            if (Array.isArray(severalResponse.data)) {
                const severalBlanks = await Promise.all(severalResponse.data.map(async (data: any) => {
                    const blank = await convertHourlySeveralToBlank(data)
                    // Устанавливаем правильный тип если он не задан
                    if (!blank.paType) {
                        blank.paType = 'Бланк по часовой N'
                    }
                    return blank
                }))
                allBlanks.push(...severalBlanks)
            }
        } catch (error) {
            console.error('Ошибка загрузки бланков HourlySeveral:', error)
        }

        try {
            // Загружаем бланки менее 1 изделия в час (lessThanPerHour = Бланк меньше одного изделия в час)
            const lessThanResponse = await api.get('/lessThanPerHour')
            if (Array.isArray(lessThanResponse.data)) {
                const lessThanBlanks = await Promise.all(lessThanResponse.data.map(async (data: any) => {
                    const blank = await convertLessThanPerHourToBlank(data)
                    // Устанавливаем правильный тип если он не задан
                    if (!blank.paType) {
                        blank.paType = 'Бланк меньше одного изделия в час'
                    }
                    return blank
                }))
                allBlanks.push(...lessThanBlanks)
            }
        } catch (error: any) {
            // Ошибка на бэкенде (обычно связана с отсутствием колонки l.Status в SQL запросе)
            // Это не критично - остальные бланки загружаются нормально
            if (error.response?.status === 500) {
                console.warn('Бланки LessThanPerHour временно недоступны (ошибка на сервере). Остальные бланки загружены.')
            } else {
                console.error('Ошибка загрузки бланков LessThanPerHour:', error)
            }
        }

        return allBlanks
    },

    // Получить бланк по ID (пробуем загрузить из всех типов)
    getById: async (id: number): Promise<PABlank> => {
        // Сначала пробуем загрузить из всех таблиц параллельно, чтобы определить, в какой таблице находится бланк
        // Это более надежный способ, чем последовательная проверка
        
        // Пробуем загрузить из HourlyByPower
        try {
            const response = await api.get(`/hourlyByPower/${id}`)
            // Нормализуем поля rowsJson и breaksJson перед передачей в функцию конвертации
            const allKeys = Object.keys(response.data || {})
            const rowsJsonKey = allKeys.find(k => k.toLowerCase() === 'rowsjson' || k.toLowerCase() === 'rows_json')
            const breaksJsonKey = allKeys.find(k => k.toLowerCase() === 'breaksjson' || k.toLowerCase() === 'breaks_json')
            if (rowsJsonKey && response.data[rowsJsonKey]) {
                response.data.rowsJson = response.data[rowsJsonKey]
            }
            if (breaksJsonKey && response.data[breaksJsonKey]) {
                response.data.breaksJson = response.data[breaksJsonKey]
            }
            const blank = await convertHourlyByPowerToBlank(response.data)
            // Убеждаемся, что paType правильный
            if (!blank.paType || blank.paType === '') {
                blank.paType = 'Бланк по часовой мощности'
            }
            console.log(`Бланк ID ${id} найден в HourlyByPower, paType: ${blank.paType}`)
            return blank
        } catch (error: any) {
            if (error.response?.status !== 404) {
                throw error
            }
        }

        // Пробуем загрузить из HourlyByTactTime
        try {
            const response = await api.get(`/hourlyByTactTime/${id}`)
            console.log(`getById: Получены данные из /hourlyByTactTime/${id}:`, {
                allKeys: Object.keys(response.data || {}),
                hasRowsJson: 'rowsJson' in response.data,
                hasRowsJsonLower: 'rowsjson' in response.data,
                hasRowsJsonUpper: 'RowsJson' in response.data,
                hasRowsJsonSnake: 'rows_json' in response.data,
                rowsJsonValue: response.data?.rowsJson,
                rowsJsonType: typeof response.data?.rowsJson,
                productionDocument: response.data?.productionDocument,
                productionDocumentKeys: response.data?.productionDocument ? Object.keys(response.data.productionDocument) : [],
                productionDocumentFull: response.data?.productionDocument,
                fullResponseData: response.data
            })
            
            // Нормализуем поля rowsJson и breaksJson перед передачей в функцию конвертации
            // Проверяем все возможные варианты названия поля (C# может использовать PascalCase)
            const allKeys = Object.keys(response.data || {})
            const rowsJsonKey = allKeys.find(k => k.toLowerCase() === 'rowsjson' || k.toLowerCase() === 'rows_json')
            const breaksJsonKey = allKeys.find(k => k.toLowerCase() === 'breaksjson' || k.toLowerCase() === 'breaks_json')
            if (rowsJsonKey && response.data[rowsJsonKey]) {
                response.data.rowsJson = response.data[rowsJsonKey]
                console.log(`getById: Найден rowsJson под ключом "${rowsJsonKey}", нормализован в rowsJson`)
            }
            if (breaksJsonKey && response.data[breaksJsonKey]) {
                response.data.breaksJson = response.data[breaksJsonKey]
                console.log(`getById: Найден breaksJson под ключом "${breaksJsonKey}", нормализован в breaksJson`)
            }
            // ВРЕМЕННОЕ РЕШЕНИЕ: Если бэкенд не вернул rowsJson, пытаемся загрузить из localStorage
            if (!response.data.rowsJson) {
                try {
                    const savedRowsJson = localStorage.getItem(`paBlank_${id}_rowsJson`)
                    if (savedRowsJson) {
                        console.log(`getById: rowsJson не найден в ответе бэкенда, загружаем из localStorage для бланка ${id}`)
                        response.data.rowsJson = savedRowsJson
                    }
                } catch (e) {
                    console.warn('Не удалось загрузить rowsJson из localStorage:', e)
                }
            }
            if (!response.data.breaksJson) {
                try {
                    const savedBreaksJson = localStorage.getItem(`paBlank_${id}_breaksJson`)
                    if (savedBreaksJson) {
                        console.log(`getById: breaksJson не найден в ответе бэкенда, загружаем из localStorage для бланка ${id}`)
                        response.data.breaksJson = savedBreaksJson
                    }
                } catch (e) {
                    console.warn('Не удалось загрузить breaksJson из localStorage:', e)
                }
            }
            
            const blank = await convertHourlyByTactTimeToBlank(response.data)
            // Убеждаемся, что paType правильный
            if (!blank.paType || blank.paType === '') {
                blank.paType = 'Бланк по времени такта'
            }
            console.log(`Бланк ID ${id} найден в HourlyByTactTime, paType: ${blank.paType}, rows.length: ${blank.rows.length}`)
            return blank
        } catch (error: any) {
            if (error.response?.status !== 404) {
                throw error
            }
        }

        // Пробуем загрузить из HourlySeveral
        try {
            const response = await api.get(`/hourlySeveral/${id}`)
            // Нормализуем поля rowsJson и breaksJson перед передачей в функцию конвертации
            const allKeys = Object.keys(response.data || {})
            const rowsJsonKey = allKeys.find(k => k.toLowerCase() === 'rowsjson' || k.toLowerCase() === 'rows_json')
            const breaksJsonKey = allKeys.find(k => k.toLowerCase() === 'breaksjson' || k.toLowerCase() === 'breaks_json')
            if (rowsJsonKey && response.data[rowsJsonKey]) {
                response.data.rowsJson = response.data[rowsJsonKey]
            }
            if (breaksJsonKey && response.data[breaksJsonKey]) {
                response.data.breaksJson = response.data[breaksJsonKey]
            }
            const blank = await convertHourlySeveralToBlank(response.data)
            // Убеждаемся, что paType правильный
            if (!blank.paType || blank.paType === '') {
                blank.paType = 'Бланк по часовой N'
            }
            console.log(`Бланк ID ${id} найден в HourlySeveral, paType: ${blank.paType}`)
            return blank
        } catch (error: any) {
            if (error.response?.status !== 404) {
                throw error
            }
        }

        // Пробуем загрузить из LessThanPerHour
        try {
            const response = await api.get(`/lessThanPerHour/${id}`)
            // Нормализуем поля rowsJson и breaksJson перед передачей в функцию конвертации
            const allKeys = Object.keys(response.data || {})
            const rowsJsonKey = allKeys.find(k => k.toLowerCase() === 'rowsjson' || k.toLowerCase() === 'rows_json')
            const breaksJsonKey = allKeys.find(k => k.toLowerCase() === 'breaksjson' || k.toLowerCase() === 'breaks_json')
            if (rowsJsonKey && response.data[rowsJsonKey]) {
                response.data.rowsJson = response.data[rowsJsonKey]
            }
            if (breaksJsonKey && response.data[breaksJsonKey]) {
                response.data.breaksJson = response.data[breaksJsonKey]
            }
            const blank = await convertLessThanPerHourToBlank(response.data)
            // Убеждаемся, что paType правильный
            if (!blank.paType || blank.paType === '') {
                blank.paType = 'Бланк меньше одного изделия в час'
            }
            console.log(`Бланк ID ${id} найден в LessThanPerHour, paType: ${blank.paType}`)
            return blank
        } catch (error: any) {
            if (error.response?.status !== 404) {
                throw error
            }
        }

        throw new Error(`Бланк с ID ${id} не найден`)
    },

    // Обновить бланк
    update: async (id: number, data: Partial<PABlankCreateRequest>): Promise<PABlank> => {
        // Получаем текущие данные
        const current = await paBlankApi.getById(id)
        if (!current) {
            throw new Error(`Бланк с ID ${id} не найден`)
        }

        // Объединяем с новыми данными
        const updatedBlank: PABlankCreateRequest = {
            blankNumber: data.blankNumber ?? current.blankNumber,
            paType: data.paType ?? current.paType,
            productName: data.productName ?? current.productName,
            department: data.department ?? current.department,
            fillerName: data.fillerName ?? current.fillerName,
            cycleTime: data.cycleTime ?? current.cycleTime,
            dailyPace: data.dailyPace ?? current.dailyPace,
            workplacePower: data.workplacePower ?? current.workplacePower,
            // Поля для бланка "по часовой N"
            productName1: data.productName1 ?? current.productName1,
            productName2: data.productName2 ?? current.productName2,
            cycleTime1: data.cycleTime1 ?? current.cycleTime1,
            cycleTime2: data.cycleTime2 ?? current.cycleTime2,
            dailyPace1: data.dailyPace1 ?? current.dailyPace1,
            dailyPace2: data.dailyPace2 ?? current.dailyPace2,
            dateShift: data.dateShift ?? current.dateShift,
            rows: data.rows ?? current.rows,
            breaks: data.breaks ?? current.breaks,
        }

        // Определяем тип бланка по paType и обновляем в соответствующем эндпоинте
        const paType = updatedBlank.paType?.toLowerCase().trim() || ''
        const apiType = getApiTypeFromPaType(paType)
        
        console.log(`Обновление бланка ID ${id}, paType: "${updatedBlank.paType}", apiType: "${apiType}"`)

        if (apiType === 'tactTime') {
            // Бланк по времени такта -> обновляем в HourlyByTactTime
            try {
                const hourlyData = await convertBlankToHourlyByTactTime(updatedBlank)
                console.log('Обновление в HourlyByTactTime: отправляем данные:', {
                    hasRowsJson: 'rowsJson' in hourlyData,
                    rowsJsonLength: hourlyData.rowsJson ? hourlyData.rowsJson.length : 0,
                    rowsJsonPreview: hourlyData.rowsJson ? hourlyData.rowsJson.substring(0, 200) : 'отсутствует',
                    hasBreaksJson: 'breaksJson' in hourlyData,
                    breaksJsonLength: hourlyData.breaksJson ? hourlyData.breaksJson.length : 0,
                    allKeys: Object.keys(hourlyData),
                    fullData: hourlyData
                })
                // Отправляем как any, чтобы обойти проверку TypeScript и попробовать отправить rowsJson и breaksJson
                // даже если их нет в DTO (может быть бэкенд примет их, если они есть в модели БД)
                const response = await api.patch(`/hourlyByTactTime/${id}`, hourlyData as any)
                
                // Сохраняем данные downtime через API /downtime
                try {
                    const rowsWithReasonGroups = (updatedBlank.rows || []).filter((r: any) => r.reasonGroups && r.reasonGroups.trim())
                    console.log('Обновление: Вызываем saveDownTimeData с данными:', {
                        responseData: response.data,
                        responseDataKeys: Object.keys(response.data || {}),
                        productionDocumentId: response.data?.productionDocumentId,
                        productionDocument: response.data?.productionDocument,
                        rowsCount: (updatedBlank.rows || []).length,
                        rowsWithReasonGroups: rowsWithReasonGroups.length,
                        rowsWithReasonGroupsData: rowsWithReasonGroups.slice(0, 3).map((r: any) => ({
                            time: r.time,
                            reasonGroups: r.reasonGroups,
                            reasons: r.reasons,
                            downtime: r.downtime
                        }))
                    })
                    if (rowsWithReasonGroups.length > 0) {
                        await saveDownTimeData(response.data, updatedBlank.rows || [])
                    } else {
                        console.log('Обновление: Пропускаем saveDownTimeData - нет строк с reasonGroups')
                    }
                } catch (error) {
                    console.error('Обновление: Ошибка при вызове saveDownTimeData:', error)
                    // Не прерываем сохранение бланка, если ошибка в downtime
                }
                console.log('Обновление в HourlyByTactTime: получен ответ:', {
                    hasRowsJson: 'rowsJson' in response.data,
                    allKeys: Object.keys(response.data || {}),
                    responseData: response.data
                })
                
                // ВРЕМЕННОЕ РЕШЕНИЕ: Если бэкенд не возвращает rowsJson, добавляем его из отправленных данных
                // Это нужно, пока бэкенд не будет исправлен, чтобы возвращать rowsJson
                if (!response.data.rowsJson && hourlyData.rowsJson) {
                    console.warn('Обновление в HourlyByTactTime: бэкенд не вернул rowsJson, добавляем из отправленных данных')
                    response.data.rowsJson = hourlyData.rowsJson
                    // Сохраняем в localStorage как резервную копию
                    try {
                        localStorage.setItem(`paBlank_${id}_rowsJson`, hourlyData.rowsJson)
                    } catch (e) {
                        console.warn('Не удалось сохранить rowsJson в localStorage:', e)
                    }
                }
                if (!response.data.breaksJson && hourlyData.breaksJson) {
                    console.warn('Обновление в HourlyByTactTime: бэкенд не вернул breaksJson, добавляем из отправленных данных')
                    response.data.breaksJson = hourlyData.breaksJson
                    // Сохраняем в localStorage как резервную копию
                    try {
                        localStorage.setItem(`paBlank_${id}_breaksJson`, hourlyData.breaksJson)
                    } catch (e) {
                        console.warn('Не удалось сохранить breaksJson в localStorage:', e)
                    }
                }
                
                return await convertHourlyByTactTimeToBlank(response.data)
            } catch (error: any) {
                console.error('Ошибка обновления в HourlyByTactTime:', error)
                throw new Error(`Не удалось обновить бланк с ID ${id} в HourlyByTactTime: ${error.message || error}`)
            }
        } else if (apiType === 'power') {
            // Бланк по часовой мощности -> обновляем в HourlyByPower
            try {
                const hourlyData = await convertBlankToHourlyByPower(updatedBlank)
                console.log('Обновление в HourlyByPower:', JSON.stringify(hourlyData, null, 2))
                const response = await api.patch(`/hourlyByPower/${id}`, hourlyData)
                return await convertHourlyByPowerToBlank(response.data)
            } catch (error: any) {
                console.error('Ошибка обновления в HourlyByPower:', error)
                throw new Error(`Не удалось обновить бланк с ID ${id} в HourlyByPower: ${error.message || error}`)
            }
        } else if (apiType === 'several') {
            // Бланк по часовой N -> обновляем в HourlySeveral
            try {
                const hourlyData = await convertBlankToHourlySeveral(updatedBlank)
                console.log('Обновление в HourlySeveral:', JSON.stringify(hourlyData, null, 2))
                const response = await api.patch(`/hourlySeveral/${id}`, hourlyData)
                return await convertHourlySeveralToBlank(response.data)
            } catch (error: any) {
                console.error('Ошибка обновления в HourlySeveral:', error)
                throw new Error(`Не удалось обновить бланк с ID ${id} в HourlySeveral: ${error.message || error}`)
            }
        } else if (apiType === 'lessThanPerHour') {
            // Бланк меньше одного изделия в час -> обновляем в LessThanPerHour
            try {
                const hourlyData = await convertBlankToLessThanPerHour(updatedBlank)
                // Убираем поле status, так как его нет в БД
                const requestData: any = {
                    departmentId: hourlyData.departmentId,
                    performerId: hourlyData.performerId,
                    date: hourlyData.date,
                    shiftId: hourlyData.shiftId,
                    workHourId: hourlyData.workHourId,
                    operationNameId: hourlyData.operationNameId,
                    startTimePlan: hourlyData.startTimePlan,
                    startTimeFact: hourlyData.startTimeFact,
                    endTimePlan: hourlyData.endTimePlan,
                    endTimeFact: hourlyData.endTimeFact,
                    plan: hourlyData.plan,
                    fact: hourlyData.fact,
                }
                console.log('Обновление в LessThanPerHour:', JSON.stringify(requestData, null, 2))
                const response = await api.patch(`/lessThanPerHour/${id}`, requestData)
                const responseWithAdditional = { ...response.data, ...hourlyData }
                return await convertLessThanPerHourToBlank(responseWithAdditional)
            } catch (error: any) {
                console.error('Ошибка обновления в LessThanPerHour:', error)
                throw new Error(`Не удалось обновить бланк с ID ${id} в LessThanPerHour: ${error.message || error}`)
            }
        } else {
            // По умолчанию пробуем HourlyByPower
            try {
                const hourlyData = await convertBlankToHourlyByPower(updatedBlank)
                console.log('Обновление в HourlyByPower (по умолчанию):', JSON.stringify(hourlyData, null, 2))
                const response = await api.patch(`/hourlyByPower/${id}`, hourlyData)
                return await convertHourlyByPowerToBlank(response.data)
            } catch (error: any) {
                console.error('Ошибка обновления в HourlyByPower (по умолчанию):', error)
                // Если не получилось, пробуем HourlyByTactTime
                if (error.response?.status === 404) {
                    try {
                        const hourlyData = await convertBlankToHourlyByTactTime(updatedBlank)
                        console.log('Fallback: обновление в HourlyByTactTime:', JSON.stringify(hourlyData, null, 2))
                        const response = await api.patch(`/hourlyByTactTime/${id}`, hourlyData)
                        return await convertHourlyByTactTimeToBlank(response.data)
                    } catch (e: any) {
                        throw new Error(`Не удалось обновить бланк с ID ${id}: ${e.message || e}`)
                    }
                }
                throw error
            }
        }
    },

    // Удалить бланк (определяем тип и удаляем из правильной таблицы)
    delete: async (id: number, paTypeHint?: string): Promise<void> => {
        // Если передан подсказка о типе, используем её
        if (paTypeHint) {
            console.log(`Используем подсказку о типе бланка: "${paTypeHint}" для ID ${id}`)
            
            // Используем getApiTypeFromPaType для определения типа (работает с обоими форматами)
            const apiType = getApiTypeFromPaType(paTypeHint)
            
            if (apiType === 'power') {
                console.log(`Удаление из HourlyByPower для ID ${id} (по подсказке)`)
                try {
                    await api.delete(`/hourlyByPower/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из HourlyByPower`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            } else if (apiType === 'tactTime') {
                console.log(`Удаление из HourlyByTactTime для ID ${id} (по подсказке)`)
                try {
                    await api.delete(`/hourlyByTactTime/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из HourlyByTactTime`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            } else if (apiType === 'several') {
                console.log(`Удаление из HourlySeveral для ID ${id} (по подсказке)`)
                try {
                    await api.delete(`/hourlySeveral/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из HourlySeveral`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            } else if (apiType === 'lessThanPerHour') {
                console.log(`Удаление из LessThanPerHour для ID ${id} (по подсказке)`)
                try {
                    await api.delete(`/lessThanPerHour/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из LessThanPerHour`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            }
        }
        
        // Сначала пробуем определить тип бланка через getById
        let blank: PABlank | null = null
        try {
            blank = await paBlankApi.getById(id)
            const paType = blank.paType || ''

            console.log(`Попытка удаления бланка ID ${id}, тип: "${paType}"`)

            // Используем getApiTypeFromPaType для определения типа (работает с обоими форматами)
            const apiType = getApiTypeFromPaType(paType)
            
            if (apiType === 'power') {
                console.log(`Удаление из HourlyByPower для ID ${id}`)
                try {
                    await api.delete(`/hourlyByPower/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из HourlyByPower`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            } else if (apiType === 'tactTime') {
                console.log(`Удаление из HourlyByTactTime для ID ${id}`)
                try {
                    await api.delete(`/hourlyByTactTime/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из HourlyByTactTime`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            } else if (apiType === 'several') {
                console.log(`Удаление из HourlySeveral для ID ${id}`)
                try {
                    await api.delete(`/hourlySeveral/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из HourlySeveral`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            } else if (apiType === 'lessThanPerHour') {
                console.log(`Удаление из LessThanPerHour для ID ${id}`)
                try {
                    await api.delete(`/lessThanPerHour/${id}`)
                    console.log(`Бланк ID ${id} успешно удален из LessThanPerHour`)
                    return
                } catch (error: any) {
                    if (error.response?.status === 403) {
                        throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
                    }
                    throw error
                }
            } else {
                console.warn(`Не удалось определить тип бланка по paType: "${paType}", пробуем удалить из всех таблиц`)
            }
        } catch (error: any) {
            // Если не удалось определить тип, пробуем удалить из всех таблиц
            console.warn(`Не удалось получить бланк ID ${id} для определения типа, пробуем удалить из всех таблиц:`, error)
        }

        // Fallback: пробуем удалить из всех типов по порядку
        // ВАЖНО: пробуем сначала HourlyByTactTime, потом HourlyByPower, чтобы правильно обработать бланки "по времени такта"
        const errors: Error[] = []
        let found = false

        // Пробуем удалить из HourlyByTactTime (Бланк по времени такта) - ПЕРВЫМ
        try {
            console.log(`Fallback: попытка удаления из HourlyByTactTime для ID ${id}`)
            await api.delete(`/hourlyByTactTime/${id}`)
            console.log(`Бланк ID ${id} успешно удален из HourlyByTactTime (fallback)`)
            found = true
            return
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log(`Бланк ID ${id} не найден в HourlyByTactTime, пробуем другие таблицы`)
            } else if (error.response?.status === 403) {
                throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
            } else if (error.response?.status === 200 || error.response?.status === 204 || !error.response) {
                console.log(`Бланк ID ${id} успешно удален из HourlyByTactTime (статус: ${error.response?.status || 'no response'})`)
                found = true
                return
            } else {
                errors.push(error)
                console.error(`Ошибка удаления из HourlyByTactTime:`, error)
            }
        }

        // Пробуем удалить из HourlyByPower (Бланк по часовой мощности)
        try {
            console.log(`Fallback: попытка удаления из HourlyByPower для ID ${id}`)
            await api.delete(`/hourlyByPower/${id}`)
            console.log(`Бланк ID ${id} успешно удален из HourlyByPower (fallback)`)
            found = true
            return
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log(`Бланк ID ${id} не найден в HourlyByPower, пробуем другие таблицы`)
            } else if (error.response?.status === 403) {
                throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
            } else if (error.response?.status === 200 || error.response?.status === 204 || !error.response) {
                console.log(`Бланк ID ${id} успешно удален из HourlyByPower (статус: ${error.response?.status || 'no response'})`)
                found = true
                return
            } else {
                errors.push(error)
                console.error(`Ошибка удаления из HourlyByPower:`, error)
            }
        }

        // Пробуем удалить из HourlySeveral
        try {
            console.log(`Fallback: попытка удаления из HourlySeveral для ID ${id}`)
            await api.delete(`/hourlySeveral/${id}`)
            console.log(`Бланк ID ${id} успешно удален из HourlySeveral (fallback)`)
            found = true
            return
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log(`Бланк ID ${id} не найден в HourlySeveral, пробуем другие таблицы`)
            } else if (error.response?.status === 403) {
                throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
            } else if (error.response?.status === 200 || error.response?.status === 204 || !error.response) {
                console.log(`Бланк ID ${id} успешно удален из HourlySeveral (статус: ${error.response?.status || 'no response'})`)
                found = true
                return
            } else {
                errors.push(error)
                console.error(`Ошибка удаления из HourlySeveral:`, error)
            }
        }

        // Пробуем удалить из LessThanPerHour
        try {
            console.log(`Fallback: попытка удаления из LessThanPerHour для ID ${id}`)
            await api.delete(`/lessThanPerHour/${id}`)
            console.log(`Бланк ID ${id} успешно удален из LessThanPerHour (fallback)`)
            found = true
            return
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log(`Бланк ID ${id} не найден в LessThanPerHour, пробуем другие таблицы`)
            } else if (error.response?.status === 403) {
                throw new Error('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
            } else if (error.response?.status === 200 || error.response?.status === 204 || !error.response) {
                console.log(`Бланк ID ${id} успешно удален из LessThanPerHour (статус: ${error.response?.status || 'no response'})`)
                found = true
                return
            } else {
                errors.push(error)
                console.error(`Ошибка удаления из LessThanPerHour:`, error)
            }
        }

        // Если были ошибки (не 404), выбрасываем первую
        if (errors.length > 0) {
            throw errors[0]
        }

        // Если все попытки вернули 404, выбрасываем ошибку
        if (!found) {
            throw new Error(`Бланк с ID ${id} не найден ни в одном из типов`)
        }
    },
}

export default api
