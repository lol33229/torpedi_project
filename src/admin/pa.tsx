import { useState, useEffect } from 'react'
import EditPA from './editPA'
import { paBlankApi } from '../services/api'

// Локальный тип для бланка
type PABlank = {
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
  rows: any[]
  breaks: any[]
  createdAt?: string
  updatedAt?: string
}

function PA() {
  const [blanks, setBlanks] = useState<PABlank[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBlank, setEditingBlank] = useState<{ id: number; number: number } | null>(null)

  // Загрузка бланков из API
  const loadBlanks = async () => {
    try {
      setLoading(true)
      const loadedBlanks = await paBlankApi.getAll()
      setBlanks(loadedBlanks || [])
    } catch (error: any) {
      // Если 404 - эндпоинт не реализован на бэкенде
      if (error.response?.status === 404) {
        console.log('Эндпоинт /pa-blank пока не реализован на бэкенде. Нужно добавить эндпоинты на бэкенде для работы с бланками ПА.')
        // Показываем пустой список, но не показываем ошибку пользователю
        setBlanks([])
      } else {
        console.error('Ошибка загрузки бланков:', error)
        setBlanks([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlanks()
  }, [])

  const handleEdit = (id: number) => {
    const blank = blanks.find(b => b.id === id)
    if (blank) {
      setEditingBlank({ id: blank.id!, number: blank.blankNumber })
    }
  }

  if (editingBlank) {
    return (
      <EditPA
        blankId={editingBlank.id}
        blankNumber={editingBlank.number}
        onBack={() => {
          setEditingBlank(null)
          loadBlanks() // Обновляем список после возврата
        }}
      />
    )
  }

  const handleDelete = async (id: number) => {
    const blank = blanks.find(b => b.id === id)
    if (blank && window.confirm(`Вы уверены, что хотите удалить бланк № ${blank.blankNumber}?`)) {
      try {
        // Передаем тип бланка как подсказку для правильного удаления
        await paBlankApi.delete(id, blank.paType)
        // Удаляем локальные данные
        localStorage.removeItem(`pa-blank-${id}`)
        await loadBlanks() // Обновляем список после удаления
        alert('Бланк успешно удален')
      } catch (error: any) {
        console.error('Ошибка удаления бланка:', error)
        const errorMsg = error.response?.data?.message || error.message || 'Не удалось удалить бланк'
        
        if (error.response?.status === 403) {
          alert('Нет прав доступа для удаления бланка. Обратитесь к администратору.')
        } else if (errorMsg.includes('не найден') || error.response?.status === 404) {
          console.log('Бланк не найден на сервере, удаляем локально')
          localStorage.removeItem(`pa-blank-${id}`)
          setBlanks(blanks.filter(b => b.id !== id))
          alert('Бланк удален локально (не найден на сервере)')
        } else {
          alert(`Ошибка удаления: ${errorMsg}`)
        }
      }
    }
  }

  const handleAddNew = () => {
    // Определяем следующий номер бланка
    const nextNumber = blanks.length > 0 
      ? Math.max(...blanks.map((b) => b.blankNumber)) + 1 
      : 1
    
    // Открываем форму редактирования с blankId = 0 для нового бланка
    setEditingBlank({ id: 0, number: nextNumber })
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="text-[16px] text-gray-600">Загрузка бланков...</span>
          </div>
        ) : blanks.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <span className="text-[16px] text-gray-600">Бланки не найдены</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 md:gap-4 max-w-2xl mx-auto md:translate-x-[-80px] lg:max-w-none lg:mx-0 lg:translate-x-0">
            {blanks.map((blank) => (
              <div
                key={blank.id}
                className="flex flex-col md:flex-row md:items-center py-3 px-2 md:px-0 border-b md:border-b-0 border-gray-100 last:border-b-0"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-center lg:justify-start w-full">
                  <span className="text-[14px] md:text-[16px] font-medium text-black mb-2 md:mb-0 text-center md:text-center lg:text-left">
                    Бланк № {blank.blankNumber}
                    {blank.productName && ` - ${blank.productName}`}
                    {(() => {
                      // Определяем тип для отображения
                      const paTypeLower = (blank.paType || '').toLowerCase()
                      
                      // Если это "по часовой мощности"
                      if (paTypeLower.includes('часовой мощности') || 
                          paTypeLower.includes('по часовой мощности')) {
                        return ` (${blank.paType})`
                      }
                      
                      // Если это "несколько номенклатур"
                      if (paTypeLower.includes('нескольк')) {
                        return ` (${blank.paType})`
                      }
                      
                      // Если это "меньше одного изделия"
                      if (paTypeLower.includes('меньше одного изделия')) {
                        return ` (${blank.paType})`
                      }
                      
                      // По умолчанию (бланк по времени такта) - показываем тип
                      if (blank.paType) {
                        return ` (${blank.paType})`
                      }
                      
                      // Если тип не указан, показываем "Бланк по времени такта"
                      return ` (Бланк по времени такта)`
                    })()}
                  </span>
                  <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 md:ml-[44px]">
                    <button
                      onClick={() => handleEdit(blank.id!)}
                      className="px-3 py-2 md:px-4 md:py-2 bg-[#2C2C2C] text-white text-[12px] md:text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity md:mr-[26px]"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(blank.id!)}
                      className="px-3 py-2 md:px-4 md:py-2 bg-[#EC221F] text-white text-[12px] md:text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-4 md:mt-6">
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white border-2 border-gray-300 text-black text-[12px] md:text-[14px] font-semibold rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-4 md:h-4"
            >
              <path
                d="M8 3V13M3 8H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Добавить новый бланк
          </button>
        </div>
      </div>
    </div>
  )
}

export default PA