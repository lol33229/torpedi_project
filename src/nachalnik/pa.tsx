import { useState } from 'react'

function PA() {
  const [blanks, setBlanks] = useState([
    { id: 1, number: 1 },
    { id: 2, number: 2 },
    { id: 3, number: 3 },
    { id: 4, number: 4 },
  ])

  const handleEdit = (id: number) => {
    console.log('Редактировать бланк', id)
    // Здесь будет логика редактирования
  }

  const handleDelete = (id: number) => {
    setBlanks(blanks.filter((blank) => blank.id !== id))
  }

  const handleAddNew = () => {
    const newId = blanks.length > 0 ? Math.max(...blanks.map((b) => b.id)) + 1 : 1
    const newNumber = blanks.length > 0 ? Math.max(...blanks.map((b) => b.number)) + 1 : 1
    setBlanks([...blanks, { id: newId, number: newNumber }])
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg p-6">
        <div className="flex flex-col gap-4">
          {blanks.map((blank) => (
            <div
              key={blank.id}
              className="flex items-center py-3"
            >
              <span className="text-[16px] font-medium text-black">Бланк № {blank.number}</span>
              <div className="flex items-center gap-3 ml-[44px]">
                <button
                  onClick={() => handleEdit(blank.id)}
                  className="px-4 py-2 bg-[#2C2C2C] text-white text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity mr-[26px]"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(blank.id)}
                  className="px-4 py-2 bg-[#EC221F] text-white text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-black text-[14px] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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

