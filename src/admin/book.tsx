import { useState } from 'react'

interface BookProps {
  onEditDirectory: (directoryName: string) => void
}

function Book({ onEditDirectory }: BookProps) {
  const [items, setItems] = useState([
    'Наименование продукции',
    'Подразделение',
    'Смена',
    'Время работы',
    'Ответственный за простой',
    'Группы причин за простой',
    'ФИО заполняющего',
  ])

  const handleDelete = (index: number) => {
    if (window.confirm(`Вы уверены, что хотите удалить справочник "${items[index]}"?`)) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
    }
  }

  const handleAdd = () => {
    const newItem = prompt('Введите название нового справочника:')
    if (newItem && newItem.trim()) {
      setItems([...items, newItem.trim()])
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
        {/* Заголовок с иконкой и кнопкой */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/image/icon1.png"
              alt="Icon"
              className="h-10 w-10"
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 text-[18px] font-semibold text-black hover:bg-gray-100 rounded transition-colors"
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
        </div>

        {/* Список справочников */}
        <div className="flex flex-col gap-0">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <span className="text-[18px] font-medium text-black">
                {item}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditDirectory(item)}
                  className="w-[100px] h-[32px] rounded bg-[#2C2C2C] text-[14px] font-medium text-white hover:bg-gray-700 transition"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="w-[100px] h-[32px] rounded bg-[#EC221F] text-[14px] font-medium text-white hover:bg-red-700 transition"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Book

