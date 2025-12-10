import { useState } from 'react'

interface BookProps {
  onBack: () => void
  onEditDirectory: (directoryName: string) => void
}

function Book({ onBack, onEditDirectory }: BookProps) {
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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="bg-[#9B98FF] px-4 py-3 mb-[96px]">
        <div className="mx-auto flex w-full items-center justify-start gap-4">
          <div className="flex items-center gap-4 ml-[110px]">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[32px] font-semibold text-[#000000] ">
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
            Справочники
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-col gap-6 px-4 py-6">
        <div className="mx-auto w-full max-w-4xl rounded-lg border-[3px] border-black bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <img
              src="/image/icon1.png"
              alt="Icon"
              className="h-12 w-12"
            />
            <button className="flex items-center gap-2 px-4 py-2 text-[35px] font-extrabold text-black ">
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

          <div className="flex flex-col gap-5 ">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <span className="text-[32px] font-medium text-[#000000]">
                  {item}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => onEditDirectory(item)}
                    className="w-[151px] h-[41px] rounded-[39px] bg-[#0066FF] text-[24px] font-medium text-white hover:bg-blue-700 transition">
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="w-[151px] h-[41px] rounded-[39px] bg-[#FF3333] text-[24px] font-medium text-white hover:bg-red-700 transition">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Book

