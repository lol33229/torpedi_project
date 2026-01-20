import { useState, useEffect } from 'react'
import { exportApi, type CatalogValue } from '../services/api'
import ShiftSelector from '../components/ShiftSelector'

interface ReportRow {
  department: string
  shift: string
  reasonGroup: string
  reason: string
  deviation: number
}

interface ReportData {
  rows: ReportRow[]
  totalDeviation: number
  reasonGroupStats: { [key: string]: { count: number; totalDowntime: number; deviation: number } }
  byDepartmentAndShift: { [key: string]: { department: string; shift: string; deviation: number; count: number } }
}

function Report() {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [selectedProduction, setSelectedProduction] = useState('')
  
  const [departments, setDepartments] = useState<CatalogValue[]>([])
  const [, setShifts] = useState<CatalogValue[]>([])
  const [productions, setProductions] = useState<CatalogValue[]>([])
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({
    rows: [],
    totalDeviation: 0,
    reasonGroupStats: {},
    byDepartmentAndShift: {}
  })

  // Загрузка справочников
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        // ВРЕМЕННО: Используем моковые справочники
        const { mockCatalogApi } = await import('./reportMockData')
        const catalogs = await mockCatalogApi.getAll()
        
        // ЗАКОММЕНТИРОВАНО: Реальный API вызов
        // const catalogs = await catalogApi.getAll()
        
        // Подразделения
        const deptCatalog = catalogs.find(c => 
          c.title?.toLowerCase().includes('подраздел')
        )
        if (deptCatalog?.values) {
          setDepartments(deptCatalog.values)
        }
        
        // Смены
        const shiftCatalog = catalogs.find(c => 
          c.title?.toLowerCase().includes('смен')
        )
        if (shiftCatalog?.values) {
          setShifts(shiftCatalog.values)
        }
        
        // Продукция
        const prodCatalog = catalogs.find(c => 
          c.title?.toLowerCase().includes('наименован') && 
          c.title?.toLowerCase().includes('продукц')
        )
        if (prodCatalog?.values) {
          setProductions(prodCatalog.values)
        }
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error)
      }
    }
    
    loadCatalogs()
  }, [])

  // Загрузка данных для отчета
  const loadReportData = async () => {
    setLoading(true)
    try {
      // ВРЕМЕННО: Используем моковые данные для тестирования
      const { mockPABlanks, mockRawData } = await import('./reportMockData')
      const allBlanks = mockPABlanks as any[]
      const allRawData = mockRawData
      
      // ЗАКОММЕНТИРОВАНО: Реальные API вызовы
      /*
      // Загружаем конвертированные бланки через paBlankApi
      const allBlanks = await paBlankApi.getAll()
      
      // Параллельно загружаем исходные данные для получения productionDocumentId и date
      const { paApi } = await import('../services/api')
      const [tactTimeData, powerData, severalData, lessThanData] = await Promise.all([
        paApi.getAllHourlyByTactTime().catch(() => []),
        paApi.getAllHourlyByPower().catch(() => []),
        paApi.getAllHourlySeveral().catch(() => []),
        paApi.getAllLessThanPerHour().catch(() => [])
      ])
      
      // Создаем мапу исходных данных по ID для быстрого доступа
      const allRawData = [
        ...(Array.isArray(tactTimeData) ? tactTimeData : []),
        ...(Array.isArray(powerData) ? powerData : []),
        ...(Array.isArray(severalData) ? severalData : []),
        ...(Array.isArray(lessThanData) ? lessThanData : [])
      ]
      */
      
      // Создаем мапу исходных данных по ID для быстрого доступа
      const rawDataMap = new Map<number, any>()
      allRawData.forEach(raw => {
        if (raw.id) {
          rawDataMap.set(raw.id, raw)
        }
      })
      
      // Отладка: проверяем, что все данные загружены
      console.log('Отчет: Загружено бланков:', allBlanks.length)
      console.log('Отчет: Загружено исходных данных:', allRawData.length)
      console.log('Отчет: Мапа исходных данных:', Array.from(rawDataMap.keys()))
      console.log('Отчет: Бланки:', allBlanks.map(b => ({ id: b.id, department: b.department })))
      console.log('Отчет: Исходные данные:', allRawData.map(r => ({ id: r.id, department: r.department?.value, shift: r.shift?.value })))
      
      // Загружаем справочники для фильтрации
      // ВРЕМЕННО: Используем моковые справочники
      const { mockCatalogApi } = await import('./reportMockData')
      const catalogs = await mockCatalogApi.getAll()
      
      // ЗАКОММЕНТИРОВАНО: Реальный API вызов
      // const catalogs = await catalogApi.getAll()
      
      const shiftCatalog = catalogs.find(c => c.title?.toLowerCase().includes('смен'))
      
      // Фильтруем бланки по выбранным критериям
      let filteredBlanks = allBlanks
      
      console.log('Отчет: Фильтры - подразделение:', selectedDepartment, 'смена:', selectedShift, 'дата:', `${day}.${month}.${year}`, 'продукция:', selectedProduction)
      
      if (selectedDepartment && selectedDepartment !== 'Все') {
        filteredBlanks = filteredBlanks.filter(b => b.department === selectedDepartment)
        console.log('Отчет: После фильтрации по подразделению:', filteredBlanks.length, 'бланков')
      }
      
      if (selectedShift) {
        // Для фильтрации по смене нужно проверить исходные данные
        const shiftId = shiftCatalog?.values?.find(v => v.value === selectedShift)?.id
        console.log('Отчет: ID смены для фильтрации:', shiftId, 'название:', selectedShift)
        if (shiftId) {
          filteredBlanks = filteredBlanks.filter(b => {
            const rawData = rawDataMap.get(b.id || 0)
            if (!rawData) {
              console.log('Отчет: Нет исходных данных для бланка', b.id)
              return false
            }
            const matches = rawData.shiftId === shiftId || 
                   (rawData.shift && typeof rawData.shift === 'object' && rawData.shift.id === shiftId)
            console.log('Отчет: Бланк', b.id, 'смена:', rawData.shift?.value, 'совпадает:', matches)
            return matches
          })
          console.log('Отчет: После фильтрации по смене:', filteredBlanks.length, 'бланков')
        }
      }
      
      if (day && month && year) {
        const filterDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        filteredBlanks = filteredBlanks.filter(b => {
          const rawData = rawDataMap.get(b.id || 0)
          if (!rawData || !rawData.date) return false
          const dataDate = typeof rawData.date === 'string' ? rawData.date : rawData.date.split('T')[0]
          return dataDate === filterDate
        })
        console.log('Отчет: После фильтрации по дате:', filteredBlanks.length, 'бланков')
      }
      
      if (selectedProduction) {
        filteredBlanks = filteredBlanks.filter(b => b.productName === selectedProduction)
        console.log('Отчет: После фильтрации по продукции:', filteredBlanks.length, 'бланков')
      }
      
      console.log('Отчет: Итого отфильтровано бланков:', filteredBlanks.length)
      console.log('Отчет: Отфильтрованные бланки:', filteredBlanks.map(b => ({ id: b.id, department: b.department })))
      
      // Обрабатываем отфильтрованные бланки
      const reportRows: ReportRow[] = []
      const reasonGroupStats: { [key: string]: { count: number; totalDowntime: number; deviation: number } } = {}
      let totalDeviation = 0
      
      // Обрабатываем каждый бланк
      for (const blank of filteredBlanks) {
        // Вычисляем отклонение из бланка (факт - план)
        const plan = parseFloat(blank.dailyPace || '0')
        // Для факта нужно получить из исходных данных или из rows
        const rawData = rawDataMap.get(blank.id || 0)
        const fact = rawData ? parseFloat(rawData.fact?.toString() || '0') : 0
        const blankDeviation = fact - plan
        
        // Получаем подразделение и смену из исходных данных
        const department = rawData?.department?.value || blank.department || 'Неизвестное подразделение'
        const shift = rawData?.shift?.value || 'Неизвестная смена'
        
        // Получаем productionDocumentId из исходных данных
        const productionDocumentId = rawData ? (
          rawData.productionDocumentId || 
          rawData.productionDocument?.id ||
          (rawData.productionDocument && typeof rawData.productionDocument === 'object' 
            ? rawData.productionDocument.id : null)
        ) : null
        
        // Флаг для отслеживания, были ли добавлены данные downtime для этого бланка
        let hasDowntimeData = false
        
        // Загружаем downtime для этого документа
        if (productionDocumentId) {
          try {
            // ВРЕМЕННО: Используем моковые данные
            const { mockApi } = await import('./reportMockData')
            const downtimeData = await mockApi.getDownTimeByDocumentId(productionDocumentId)
            
            // ЗАКОММЕНТИРОВАНО: Реальный API вызов
            // const downtimeData = await downTimeApi.getByDocumentId(productionDocumentId)
            
            if (downtimeData && downtimeData.length > 0) {
              hasDowntimeData = true
              
              for (const dt of downtimeData) {
                const reasonGroupName = dt.reasonGroup?.value || 'Неизвестная группа'
                const reasonName = dt.reason?.value || 'Неизвестная причина'
                
                // Добавляем строку в отчет с подразделением и сменой
                reportRows.push({
                  department,
                  shift,
                  reasonGroup: reasonGroupName,
                  reason: reasonName,
                  deviation: blankDeviation
                })
                
                // Агрегируем статистику по группам причин
                if (!reasonGroupStats[reasonGroupName]) {
                  reasonGroupStats[reasonGroupName] = {
                    count: 0,
                    totalDowntime: 0,
                    deviation: 0
                  }
                }
                reasonGroupStats[reasonGroupName].count++
                reasonGroupStats[reasonGroupName].totalDowntime += dt.downTime
                reasonGroupStats[reasonGroupName].deviation += blankDeviation
              }
            }
          } catch (error) {
            console.warn(`Не удалось загрузить downtime для бланка ${blank.id} (documentId: ${productionDocumentId}):`, error)
          }
        }
        
        // Если нет данных downtime для этого бланка, добавляем строку с отклонением
        if (!hasDowntimeData) {
          reportRows.push({
            department,
            shift,
            reasonGroup: 'Без указания причины',
            reason: blank.productName || 'Неизвестная продукция',
            deviation: blankDeviation
          })
        }
        
        totalDeviation += blankDeviation
      }
      
      console.log('Отчет: Обработано строк отчета:', reportRows.length)
      console.log('Отчет: Строки по подразделениям и сменам:', 
        reportRows.reduce((acc, row) => {
          const key = `${row.department} - ${row.shift}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {} as { [key: string]: number })
      )
      
      setReportData({
        rows: reportRows,
        totalDeviation,
        reasonGroupStats,
        byDepartmentAndShift: {}
      })
    } catch (error) {
      console.error('Ошибка загрузки данных отчета:', error)
    } finally {
      setLoading(false)
    }
  }

  // Автоматическая загрузка при изменении фильтров
  useEffect(() => {
    if (day && month && year) {
      loadReportData()
    }
  }, [selectedDepartment, selectedShift, day, month, year, selectedProduction])

  const handleExportExcel = async () => {
    try {
      if (tableRows.length === 0) {
        alert('Нет данных для экспорта')
        return
      }

      // Пытаемся использовать бэкенд для экспорта
      try {
        // Получаем ID для фильтров (используем те же справочники, что и в загрузке данных)
        // ВРЕМЕННО: Используем моковые справочники
        const { mockCatalogApi } = await import('./reportMockData')
        const catalogs = await mockCatalogApi.getAll()
        
        // ЗАКОММЕНТИРОВАНО: Реальный API вызов
        // const catalogs = await catalogApi.getAll()
        
        const deptCatalog = catalogs.find(c => c.title?.toLowerCase().includes('подраздел'))
        const shiftCatalog = catalogs.find(c => c.title?.toLowerCase().includes('смен'))
        const prodCatalog = catalogs.find(c => 
          c.title?.toLowerCase().includes('наименован') && 
          c.title?.toLowerCase().includes('продукц')
        )

        const filters: any = {}
        if (selectedDepartment && selectedDepartment !== 'Все') {
          const deptId = deptCatalog?.values?.find(v => v.value === selectedDepartment)?.id
          if (deptId) filters.departmentId = deptId
        }
        if (selectedShift) {
          const shiftId = shiftCatalog?.values?.find(v => v.value === selectedShift)?.id
          if (shiftId) filters.shiftId = shiftId
        }
        if (day && month && year) {
          filters.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
        if (selectedProduction) {
          const prodId = prodCatalog?.values?.find(v => v.value === selectedProduction)?.id
          if (prodId) filters.productId = prodId
        }

        // Пытаемся вызвать бэкенд
        await exportApi.exportReportExcel(filters)
        return // Если успешно, выходим
      } catch (backendError: any) {
        // Если бэкенд не поддерживает (404, 501 и т.д.), используем клиентский экспорт
        if (backendError.response?.status === 404 || backendError.response?.status === 501) {
          console.log('Бэкенд не поддерживает экспорт отчетов, используем клиентский экспорт')
        } else {
          console.warn('Ошибка экспорта через бэкенд, используем клиентский экспорт:', backendError)
        }
      }

      // Клиентский экспорт (CSV) - работает с моковыми данными
      const headers = ['Подразделение', 'Смена', 'Причина', 'Отклонения (шт)']
      const csvRows = [
        headers.join(','),
        ...tableRows.map(row => [
          `"${(row.department || '').replace(/"/g, '""')}"`,
          `"${(row.shift || '').replace(/"/g, '""')}"`,
          `"${(row.reason || '').replace(/"/g, '""')}"`,
          row.deviation
        ].join(',')),
        ['', '', 'Общий итог', reportData.totalDeviation].join(',')
      ]

      const csvContent = csvRows.join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const dateStr = day && month && year 
        ? `${day}-${month}-${year}` 
        : new Date().toISOString().split('T')[0]
      
      link.setAttribute('href', url)
      link.setAttribute('download', `отчет_${dateStr}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Ошибка экспорта в Excel:', error)
      alert('Ошибка при экспорте в Excel')
    }
  }

  const handleExportPDF = async () => {
    try {
      if (tableRows.length === 0) {
        alert('Нет данных для экспорта')
        return
      }

      // Пытаемся использовать бэкенд для экспорта
      try {
        // Получаем ID для фильтров (используем те же справочники, что и в загрузке данных)
        // ВРЕМЕННО: Используем моковые справочники
        const { mockCatalogApi } = await import('./reportMockData')
        const catalogs = await mockCatalogApi.getAll()
        
        // ЗАКОММЕНТИРОВАНО: Реальный API вызов
        // const catalogs = await catalogApi.getAll()
        
        const deptCatalog = catalogs.find(c => c.title?.toLowerCase().includes('подраздел'))
        const shiftCatalog = catalogs.find(c => c.title?.toLowerCase().includes('смен'))
        const prodCatalog = catalogs.find(c => 
          c.title?.toLowerCase().includes('наименован') && 
          c.title?.toLowerCase().includes('продукц')
        )

        const filters: any = {}
        if (selectedDepartment && selectedDepartment !== 'Все') {
          const deptId = deptCatalog?.values?.find(v => v.value === selectedDepartment)?.id
          if (deptId) filters.departmentId = deptId
        }
        if (selectedShift) {
          const shiftId = shiftCatalog?.values?.find(v => v.value === selectedShift)?.id
          if (shiftId) filters.shiftId = shiftId
        }
        if (day && month && year) {
          filters.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
        if (selectedProduction) {
          const prodId = prodCatalog?.values?.find(v => v.value === selectedProduction)?.id
          if (prodId) filters.productId = prodId
        }

        // Пытаемся вызвать бэкенд
        await exportApi.exportReportPdf(filters)
        return // Если успешно, выходим
      } catch (backendError: any) {
        // Если бэкенд не поддерживает (404, 501 и т.д.), используем клиентский экспорт
        if (backendError.response?.status === 404 || backendError.response?.status === 501) {
          console.log('Бэкенд не поддерживает экспорт отчетов, используем клиентский экспорт')
        } else {
          console.warn('Ошибка экспорта через бэкенд, используем клиентский экспорт:', backendError)
        }
      }

      // Клиентский экспорт (PDF через печать) - работает с моковыми данными
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Не удалось открыть окно для печати. Разрешите всплывающие окна.')
        return
      }

      const dateStr = day && month && year 
        ? `${day}.${month}.${year}` 
        : new Date().toLocaleDateString('ru-RU')

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Отчет по причинам простоев</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .info {
              margin-bottom: 20px;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Отчет по причинам простоев</h1>
          <div class="info">
            <p><strong>Дата:</strong> ${dateStr}</p>
            ${selectedDepartment && selectedDepartment !== 'Все' ? `<p><strong>Подразделение:</strong> ${selectedDepartment}</p>` : ''}
            ${selectedShift ? `<p><strong>Смена:</strong> ${selectedShift}</p>` : ''}
            ${selectedProduction ? `<p><strong>Продукция:</strong> ${selectedProduction}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Подразделение</th>
                <th>Смена</th>
                <th>Причина</th>
                <th>Отклонения (шт)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.map(row => `
                <tr>
                  <td>${row.department}</td>
                  <td>${row.shift}</td>
                  <td>${row.reason}</td>
                  <td>${row.deviation > 0 ? '+' : ''}${Math.round(row.deviation)}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="3">Общий итог</td>
                <td>${reportData.totalDeviation > 0 ? '+' : ''}${Math.round(reportData.totalDeviation)}</td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Ждем загрузки и открываем диалог печати
      setTimeout(() => {
        printWindow.print()
      }, 250)
    } catch (error) {
      console.error('Ошибка экспорта в PDF:', error)
      alert('Ошибка при экспорте в PDF')
    }
  }

  // Группируем строки по подразделению, смене и группам причин для таблицы
  const groupedRows = reportData.rows.reduce((acc, row) => {
    const key = `${row.department}|${row.shift}|${row.reasonGroup}|${row.reason}`
    if (!acc[key]) {
      acc[key] = { 
        department: row.department, 
        shift: row.shift,
        reasonGroup: row.reasonGroup, 
        reason: row.reason, 
        deviation: 0, 
        count: 0 
      }
    }
    acc[key].deviation += row.deviation
    acc[key].count++
    return acc
  }, {} as { [key: string]: { department: string; shift: string; reasonGroup: string; reason: string; deviation: number; count: number } })

  // Сортируем по подразделению, затем по смене
  const tableRows = Object.values(groupedRows)
    .sort((a, b) => {
      if (a.department !== b.department) {
        return a.department.localeCompare(b.department)
      }
      return a.shift.localeCompare(b.shift)
    })
    .map(item => ({
      department: item.department,
      shift: item.shift,
      reason: `${item.reasonGroup}, ${item.reason}`,
      deviation: item.deviation
    }))

  const getReasonGroupColor = (_groupName: string, index: number) => {
    const colors = ['#FBFF00', '#FF0000', '#44FF44', '#4444FF', '#FF44FF', '#44FFFF']
    return colors[index % colors.length]
  }

  // Подготовка данных для круговой диаграммы
  const reasonGroupNames = Object.keys(reportData.reasonGroupStats)
  const pieData = reasonGroupNames.map((name, index) => ({
    name,
    value: reportData.reasonGroupStats[name].totalDowntime,
    color: getReasonGroupColor(name, index)
  }))

  // Вычисление углов для круговой диаграммы
  const totalDowntime = pieData.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = -90 // Начинаем сверху
  const piePaths = pieData.map(item => {
    const percentage = totalDowntime > 0 ? item.value / totalDowntime : 0
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    const x1 = 100 + 100 * Math.cos(startAngleRad)
    const y1 = 100 + 100 * Math.sin(startAngleRad)
    const x2 = 100 + 100 * Math.cos(endAngleRad)
    const y2 = 100 + 100 * Math.sin(endAngleRad)
    const largeArc = angle > 180 ? 1 : 0
    
    return {
      d: `M 100,100 L ${x1},${y1} A 100,100 0 ${largeArc},1 ${x2},${y2} Z`,
      fill: item.color,
      name: item.name
    }
  })

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6">
      <div className="bg-white rounded-lg p-4 sm:p-6">
        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-black whitespace-nowrap min-w-[140px]">
                Подразделение:
              </label>
              <div className="relative w-full sm:w-[220px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 sm:px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
                >
                  <option value="">Все</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.value}>
                      {dept.value}
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

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-black whitespace-nowrap min-w-[140px]">
                Смена:
              </label>
              <div className="relative w-full sm:w-[220px] border-2 border-[#CCCCCC] rounded-lg">
                <ShiftSelector
                  value={selectedShift}
                  onChange={setSelectedShift}
                  className="h-[36px] px-3 sm:px-4 text-[14px] font-medium text-gray-700"
                  placeholder="Выберите смену"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-black whitespace-nowrap min-w-[140px]">
                Период:
              </label>
              <div className="flex items-center gap-2 w-full sm:w-[210px]">
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="дд"
                  maxLength={2}
                  className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-2 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
                />
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="мм"
                  maxLength={2}
                  className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-2 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
                />
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="гггг"
                  maxLength={4}
                  className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-2 text-[14px] font-medium text-gray-700 bg-white text-center focus:outline-none focus:border-[#7B79E6]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-black whitespace-nowrap min-w-[140px]">
                Продукция:
              </label>
              <div className="relative w-full sm:w-[210px]">
                <select
                  value={selectedProduction}
                  onChange={(e) => setSelectedProduction(e.target.value)}
                  className="w-full h-[40px] rounded-lg border-2 border-[#CCCCCC] px-3 sm:px-4 text-[14px] font-medium text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
                >
                  <option value="">Все</option>
                  {productions.map((production) => (
                    <option key={production.id} value={production.value}>
                      {production.value}
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
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <span className="text-[16px] text-gray-600">Загрузка данных...</span>
          </div>
        )}

        {/* Распределение причин простоев */}
        {!loading && (
          <div className="mb-8">
            <h2 className="text-[17px] sm:text-[19px] lg:text-[20px] font-bold text-black mb-4 sm:mb-6 text-center">
              Распределение причин простоев
            </h2>
            {reasonGroupNames.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-12">
                {/* Легенда */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  {reasonGroupNames.map((name, index) => (
                    <div key={name} className="flex items-center gap-2 sm:gap-3">
                      <div 
                        className="w-4 sm:w-5 h-4 sm:h-5 rounded-full" 
                        style={{ backgroundColor: getReasonGroupColor(name, index) }}
                      ></div>
                      <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium text-black">{name}</span>
                    </div>
                  ))}
                </div>

                {/* Круговая диаграмма */}
                <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[250px] lg:h-[250px] relative">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {piePaths.map((path, index) => (
                      <path key={index} d={path.d} fill={path.fill} />
                    ))}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-[14px] text-gray-500">Нет данных для отображения</span>
              </div>
            )}
          </div>
        )}

        {/* Таблица детализации */}
        {!loading && (
          <div className="mt-8">
            <h2 className="text-[17px] sm:text-[19px] lg:text-[20px] font-bold text-black mb-4 sm:mb-6 text-center">
              Детализация по группам причин
            </h2>

            <div className="flex flex-col md:flex-row items-end gap-6">
              {/* Таблица */}
              <div className="w-full md:flex-1">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                            <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold text-black">Подразделение</span>
                          </th>
                          <th className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                            <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold text-black">Смена</span>
                          </th>
                          <th className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                            <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold text-black">Причина</span>
                          </th>
                          <th className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                            <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold text-black">Отклонения (шт)</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.length > 0 ? (
                          <>
                            {tableRows.map((row, index) => (
                              <tr key={index} className="bg-white hover:bg-gray-50">
                                <td className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                                  <span className="text-[13px] sm:text-[14px] font-medium text-black">{row.department}</span>
                                </td>
                                <td className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                                  <span className="text-[13px] sm:text-[14px] font-medium text-black">{row.shift}</span>
                                </td>
                                <td className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                                  <span className="text-[13px] sm:text-[14px] font-medium text-black">{row.reason}</span>
                                </td>
                                <td className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                                  <span className={`text-[13px] sm:text-[14px] font-medium ${row.deviation < 0 ? 'text-red-600' : row.deviation > 0 ? 'text-green-600' : 'text-black'}`}>
                                    {row.deviation > 0 ? '+' : ''}{Math.round(row.deviation)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-100 font-bold">
                              <td colSpan={3} className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                                <span className="text-[13px] sm:text-[14px] font-bold text-black">Общий итог</span>
                              </td>
                              <td className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                                <span className={`text-[13px] sm:text-[14px] font-bold ${reportData.totalDeviation < 0 ? 'text-red-600' : reportData.totalDeviation > 0 ? 'text-green-600' : 'text-black'}`}>
                                  {reportData.totalDeviation > 0 ? '+' : ''}{Math.round(reportData.totalDeviation)}
                                </span>
                              </td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan={4} className="border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-center">
                              <span className="text-[13px] sm:text-[14px] text-gray-500">Нет данных для отображения</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Кнопки экспорта */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleExportExcel}
                  disabled={tableRows.length === 0}
                  className="w-[120px] h-[40px] bg-[#14AE5C] text-white text-[16px] font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  EXCEL
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={tableRows.length === 0}
                  className="w-[120px] h-[40px] bg-[#EC221F] text-white text-[16px] font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Report