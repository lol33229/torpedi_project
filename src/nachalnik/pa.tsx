import { useState } from 'react'
import EditPA from '../admin/editPA'

function PA() {
  const [blanks, setBlanks] = useState([
    { id: 1, number: 1 },
    { id: 2, number: 2 },
    { id: 3, number: 3 },
    { id: 4, number: 4 },
  ])

  const [editingBlank, setEditingBlank] = useState<{ id: number; number: number } | null>(null)

  const handleEdit = (id: number) => {
    const blank = blanks.find(b => b.id === id)
    if (blank) {
      setEditingBlank({ id: blank.id, number: blank.number })
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm(`Вы уверены, что хотите удалить бланк № ${blanks.find(b => b.id === id)?.number}?`)) {
      setBlanks(blanks.filter((blank) => blank.id !== id))
    }
  }

  const handleAddNew = () => {
    const newId = blanks.length > 0 ? Math.max(...blanks.map((b) => b.id)) + 1 : 1
    const newNumber = blanks.length > 0 ? Math.max(...blanks.map((b) => b.number)) + 1 : 1
    setEditingBlank({ id: newId, number: newNumber })
  }

  if (editingBlank) {
    return (
      <EditPA
        blankId={editingBlank.id}
        blankNumber={editingBlank.number}
        onBack={() => {
          setEditingBlank(null)
          // Обновляем список бланков после создания/редактирования
          if (!blanks.find(b => b.id === editingBlank.id)) {
            setBlanks([...blanks, { id: editingBlank.id, number: editingBlank.number }])
          }
        }}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg p-4 md:p-6">
        <div className="flex flex-col gap-3 md:gap-4 max-w-2xl mx-auto md:translate-x-[-80px] lg:max-w-none lg:mx-0 lg:translate-x-0">
          {blanks.map((blank) => (
            <div
              key={blank.id}
              className="flex flex-col md:flex-row md:items-center py-3 px-2 md:px-0 border-b md:border-b-0 border-gray-100 last:border-b-0"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-center lg:justify-start w-full">
                <span className="text-[14px] md:text-[16px] font-medium text-black mb-2 md:mb-0 text-center md:text-center lg:text-left">
                  Бланк № {blank.number}
                </span>
                <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 md:ml-[44px]">
                  <button
                    onClick={() => handleEdit(blank.id)}
                    className="px-3 py-2 md:px-4 md:py-2 bg-[#2C2C2C] text-white text-[12px] md:text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity md:mr-[26px]"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(blank.id)}
                    className="px-3 py-2 md:px-4 md:py-2 bg-[#EC221F] text-white text-[12px] md:text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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