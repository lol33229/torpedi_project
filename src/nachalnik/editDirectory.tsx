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
    <div className="min-h-screen bg-white text-slate-900">
      <header className="bg-[#9B98FF] px-4 py-3">
        <div className="mx-auto flex w-full items-center justify-start gap-4">
          <div className="flex items-center gap-4 ml-[110px]">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[32px] font-semibold text-[#000000]">
              <svg
                width="32"
                height="32"
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
          </div>
          <span className="text-[32px] font-medium text-[#000000] ml-[70px]">
            Редактирование — {directoryName}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-col gap-6 px-4 py-6">
        <div className="mx-auto w-full bg-white p-6">
          <div className="mb-6 flex items-center justify-between mx-[111px]">
            <div className="flex items-center gap-4">
              <span className="text-[35px] font-bold text-[#000000]">Поиск:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите текст для поиска"
                className="w-[351px] h-[42px] rounded-[39px] border-[4px] border-[#453FFF] px-4 text-[20px] font-medium focus:outline-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 text-[35px] font-extrabold text-black mt-[40px]">
              <svg
                width="48"
                height="48"
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
        </div>

        <div className="w-full flex flex-col gap-2">
          {items.map((item, index) => {
            // Показываем элемент только если он соответствует поисковому запросу или поиск пустой
            const shouldShow = searchQuery === '' || item.toLowerCase().includes(searchQuery.toLowerCase())
            
            if (!shouldShow) return null

            const isEditing = editingIndex === index
            const bgColor = index % 2 === 0 ? 'bg-[#EDEAEA]' : 'bg-white'

            return (
              <div
                key={index}
                className={`w-full ${bgColor}`}
              >
                <div className="mx-auto w-full flex items-center justify-between px-[105px] py-3">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-[32px] font-medium text-[#000000] min-w-[40px]">
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
                          className="flex-1 border-2 border-[#453FFF] px-3 py-2 text-[20px] focus:outline-none"
                        />
                        <button
                          onClick={() => handleSave(index)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-[18px] font-semibold text-white hover:bg-green-700 transition">
                          Сохранить
                        </button>
                        <button
                          onClick={handleCancel}
                          className="rounded-lg bg-gray-600 px-4 py-2 text-[18px] font-semibold text-white hover:bg-gray-700 transition">
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <span className="text-[32px] font-medium text-[#000000] flex-1">
                        {item}
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 hover:opacity-70 transition">
                      <img
                        src="/image/trash.png"
                        alt="Удалить"
                        className="w-6 h-6"
                      />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mx-auto w-full">

          <div className="flex justify-end">
            <button
              onClick={handleDeleteDirectory}
              className="rounded-[39px] bg-[#FF3333] mr-[195px] text-[24px] font-medium text-white hover:bg-red-700 transition w-[299px] h-[41px]">
              Удалить справочник
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EditDirectory

