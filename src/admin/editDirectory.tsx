import { useState } from 'react'

interface EditDirectoryProps {
  directoryName: string
  onBack: () => void
  initialItems?: string[]
}

function EditDirectory({ directoryName, onBack, initialItems = [] }: EditDirectoryProps) {
  const [items, setItems] = useState<string[]>(initialItems.length > 0 ? initialItems : ['Агрегат', 'Деталь', 'Узел', '', '', '', ''])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const handleSave = (index: number) => {
    const newItems = [...items]
    newItems[index] = editingValue
    setItems(newItems)
    setEditingIndex(null)
    setEditingValue('')
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditingValue('')
  }

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    while (newItems.length < 7) {
      newItems.push('')
    }
    setItems(newItems)
  }

  const handleAdd = () => {
    const firstEmptyIndex = items.findIndex(item => item === '')
    if (firstEmptyIndex !== -1) {
      setEditingIndex(firstEmptyIndex)
      setEditingValue('')
    } else {
      // Если нет пустых элементов, добавляем новый
      setItems([...items, ''])
      setEditingIndex(items.length)
      setEditingValue('')
    }
  }

  const handleDeleteDirectory = () => {
    if (window.confirm('Вы уверены, что хотите удалить весь справочник?')) {
      onBack()
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
        <div className="flex flex-col gap-2 mb-6">
          {items.map((item, index) => {
            const shouldShow = searchQuery === '' || item.toLowerCase().includes(searchQuery.toLowerCase())
            if (!shouldShow) return null

            const isEditing = editingIndex === index
            const bgColor = index % 2 === 0 ? 'bg-[#EDEAEA]' : 'bg-white'

            return (
              <div
                key={index}
                className={`w-full ${bgColor} rounded-lg`}
              >
                <div className="w-full flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-[16px] font-medium text-black min-w-[30px]">
                      {index + 1}.
                    </span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSave(index)
                            } else if (e.key === 'Escape') {
                              handleCancel()
                            }
                          }}
                          autoFocus
                          className="flex-1 border-2 border-[#9B98FF] px-3 py-2 text-[16px] rounded-lg focus:outline-none focus:border-[#7B79E6]"
                        />
                        <button
                          onClick={() => handleSave(index)}
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
                      <span className="text-[18px] font-medium text-black flex-1">
                        {item}
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => handleDelete(index)}
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

