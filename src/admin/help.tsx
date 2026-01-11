import { useState } from 'react'

function Help() {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [helpChain, setHelpChain] = useState('')

  const departments = [
    'Участок 1',
    'Участок 2',
    'Участок 3',
    'Все',
  ]

  const handleSave = () => {
    // Здесь можно добавить логику сохранения
    console.log('Сохранение:', { selectedDepartment, helpChain })
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg p-6">
        <h1 className="text-[24px] font-bold text-black mb-6">
          Цепочка помощи
        </h1>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <label className="text-[18px] font-semibold text-black whitespace-nowrap">
              Подразделение:
            </label>
            <div className="relative flex-1 max-w-[400px]">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full h-[42px] rounded-lg border-2 border-[#CCCCCC] px-4 text-[16px] font-medium text-black bg-white appearance-none focus:outline-none focus:border-[#7B79E6] cursor-pointer"
              >
                <option value="" disabled>
                  Выберите подразделение
                </option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#9B98FF]"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-[18px] font-semibold text-black">
              Цепочка помощи:
            </label>
            <textarea
              value={helpChain}
              onChange={(e) => setHelpChain(e.target.value)}
              placeholder="Введите цепочку помощи..."
              className="w-full min-h-[200px] rounded-lg  px-4 py-3 text-[16px] font-medium focus:outline-none focus:border-[#7B79E6] resize-y"
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#2C2C2C] text-white text-[16px] font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help

