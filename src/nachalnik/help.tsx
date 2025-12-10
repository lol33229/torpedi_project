import { useState } from 'react'

interface HelpProps {
  onBack: () => void
}

function Help({ onBack }: HelpProps) {
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
            Цепочка помощи
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-col gap-6 px-4 py-6">
        <div className="mx-auto w-full">
          <div className="ml-[114px] mt-6 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-[59px]">
              <label className="text-[32px] font-extrabold text-[#000000] whitespace-nowrap ">
                Подразделение:
              </label>
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-[351px] h-[42px] rounded-[39px] border-[4px] border-[#453FFF] px-4 ml-[87px] text-[24px] font-medium text-[#000000] bg-white appearance-none focus:outline-none cursor-pointer"
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

            <div className="flex items-center gap-4">
              <label className="text-[32px] font-extrabold text-[#000000] whitespace-nowrap">
                Цепочка помощи:
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-8 mr-[84px]">
            <button
              onClick={handleSave}
              className="w-[299px] y-[41px] mt-[200px] mr-[195px] bg-[#0066FF] text-white text-[24px] font-semibold rounded-[39px] hover:opacity-90 transition-opacity">
              Сохранить изменения
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Help

