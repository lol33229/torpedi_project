import { useState, useEffect } from 'react'
import { catalogApi, type CatalogValue } from '../services/api'

interface EditDirectoryProps {
  directoryName: string
  onBack: () => void
  initialItems?: string[]
}

function EditDirectory({ directoryName, onBack }: EditDirectoryProps) {
  const [catalogId, setCatalogId] = useState<number | null>(null)
  const [items, setItems] = useState<CatalogValue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  useEffect(() => {
    const savedCatalogId = localStorage.getItem('editingCatalogId')
    if (savedCatalogId) {
      const id = parseInt(savedCatalogId, 10)
      setCatalogId(id)
      loadCatalogValues(id)
    } else {
      setError('Не указан ID справочника')
      setLoading(false)
    }
  }, [])

  const loadCatalogValues = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const catalog = await catalogApi.getById(id)
      setItems(catalog.values || [])
    } catch (err: any) {
      console.error('Ошибка загрузки значений справочника:', err)
      setError('Не удалось загрузить значения справочника')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (index: number) => {
    if (!catalogId) return

    const item = items[index]
    const newValue = editingValue.trim()

    if (!newValue) {
      alert('Значение не может быть пустым')
      return
    }

    try {
      if (item && item.id) {
        // Обновляем существующее значение
        await catalogApi.updateValue(catalogId, item.id, newValue)
      } else {
        // Создаем новое значение
        await catalogApi.addValue(catalogId, newValue)
      }
      await loadCatalogValues(catalogId)
      setEditingIndex(null)
      setEditingValue('')
    } catch (err: any) {
      console.error('Ошибка сохранения значения:', err)
      alert('Не удалось сохранить значение')
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditingValue('')
  }

  const handleDelete = async (index: number) => {
    if (!catalogId) return

    const item = items[index]
    if (!item || !item.id) return

    if (window.confirm(`Вы уверены, что хотите удалить "${item.value}"?`)) {
      try {
        await catalogApi.deleteValue(catalogId, item.id)
        await loadCatalogValues(catalogId)
      } catch (err: any) {
        console.error('Ошибка удаления значения:', err)
        alert('Не удалось удалить значение')
      }
    }
  }

  const handleAdd = () => {
    // Добавляем новое пустое значение для редактирования
    setItems([...items, { id: 0, value: '' }])
    setEditingIndex(items.length)
    setEditingValue('')
  }

  const handleDeleteDirectory = async () => {
    if (!catalogId) return

    if (window.confirm('Вы уверены, что хотите удалить весь справочник?')) {
      try {
        await catalogApi.delete(catalogId)
        localStorage.removeItem('editingCatalogId')
        onBack()
      } catch (err: any) {
        console.error('Ошибка удаления справочника:', err)
        alert('Не удалось удалить справочник')
      }
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg border-2 border-[#9B98FF] p-6">
        {/* Заголовок с кнопкой назад */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[18px] font-semibold text-[#0066FF] hover:text-blue-700 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Назад
            </button>
            <h1 className="text-[24px] font-bold text-black">
              Редактирование — {directoryName}
            </h1>
          </div>
        </div>

        {/* Поиск и кнопка добавления */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[18px] font-semibold text-black">Поиск:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите текст для поиска"
              className="w-[300px] h-[40px] rounded-lg border-2 border-[#9B98FF] px-4 text-[16px] font-medium focus:outline-none focus:border-[#7B79E6]"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#9B98FF] text-white text-[18px] font-semibold rounded-lg hover:bg-[#7B79E6] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Добавить
          </button>
        </div>

        {/* Список элементов */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Загрузка...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {items
              .filter((item) => {
                const value = item.value || ''
                return searchQuery === '' || value.toLowerCase().includes(searchQuery.toLowerCase())
              })
              .map((item) => {
                const originalIndex = items.indexOf(item)
                const isEditing = editingIndex === originalIndex
                const bgColor = originalIndex % 2 === 0 ? 'bg-[#EDEAEA]' : 'bg-white'

                return (
                  <div
                    key={item.id || `new-${originalIndex}`}
                    className={`w-full ${bgColor} rounded-lg`}
                  >
                    <div className="w-full flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-[16px] font-medium text-black min-w-[30px]">
                          {originalIndex + 1}.
                        </span>
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSave(originalIndex)
                                } else if (e.key === 'Escape') {
                                  handleCancel()
                                }
                              }}
                              autoFocus
                              className="flex-1 border-2 border-[#9B98FF] px-3 py-2 text-[16px] rounded-lg focus:outline-none focus:border-[#7B79E6]"
                            />
                            <button
                              onClick={() => handleSave(originalIndex)}
                              className="px-4 py-2 bg-green-600 text-white text-[14px] font-semibold rounded-lg hover:bg-green-700 transition"
                            >
                              Сохранить
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-4 py-2 bg-gray-600 text-white text-[14px] font-semibold rounded-lg hover:bg-gray-700 transition"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <>
                            <span
                              className="text-[18px] font-medium text-black flex-1"
                            >
                              {item.value || '(пусто)'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingIndex(originalIndex)
                                setEditingValue(item.value || '')
                              }}
                              className="px-3 py-1 text-[14px] text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Редактировать
                            </button>
                          </>
                        )}
                      </div>
                      {!isEditing && item.id !== 0 && (
                        <button
                          onClick={() => handleDelete(originalIndex)}
                          className="p-2 hover:opacity-70 transition"
                        >
                          <img
                            src="/image/trash.png"
                            alt="Удалить"
                            className="w-5 h-5"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* Кнопка удаления справочника */}
        <div className="flex justify-end">
          <button
            onClick={handleDeleteDirectory}
            className="px-6 py-2 bg-[#FF3333] text-white text-[16px] font-medium rounded-lg hover:bg-red-700 transition"
          >
            Удалить справочник
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditDirectory

