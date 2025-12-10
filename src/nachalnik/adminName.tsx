interface AdminNameProps {
  onNavigateToBook: () => void
  onNavigateToUsers: () => void
}

function AdminName({ onNavigateToBook, onNavigateToUsers }: AdminNameProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="bg-[#9B98FF] px-4 py-3 mb-[96px]">
        <div className="mx-auto flex w-full items-center justify-end gap-4">
          <span className="text-[32px] font-medium text-[#000000]">
            Иванов Иван Иванович
          </span>
          <button className="text-[32px] font-bold text-[#000000] ml-[70px] mr-[110px]">
            Выйти
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-col gap-6 px-4 py-6">
        <div className="grid grid-cols-3 gap-y-[76px] justify-items-center">
          <button className="h-[138px] w-[307px] rounded-[39px] border-[5px] border-[#453FFF] text-[32px] font-medium hover:shadow-[0_4px_4px_11px_rgba(155,152,255,0.82)] transition-shadow">
            Отчёты
          </button>
          <button className="h-[138px] w-[307px] rounded-[39px] border-[5px] border-[#453FFF] text-[32px] font-medium hover:shadow-[0_4px_4px_11px_rgba(155,152,255,0.82)] transition-shadow">
            Цепочки помощи
          </button>
          <button
            onClick={onNavigateToBook}
            className="h-[138px] w-[307px] rounded-[39px] border-[5px] border-[#453FFF] text-[32px] font-medium hover:shadow-[0_4px_4px_11px_rgba(155,152,255,0.82)] transition-shadow"
          >
            Справочники
          </button>
          <button className="h-[138px] w-[307px] rounded-[39px] border-[5px] border-[#453FFF] text-[32px] font-medium hover:shadow-[0_4px_4px_11px_rgba(155,152,255,0.82)] transition-shadow">
            Создать бланк ПА
          </button>
          <button className="h-[138px] w-[307px] rounded-[39px] border-[5px] border-[#453FFF] text-[32px] font-medium hover:shadow-[0_4px_4px_11px_rgba(155,152,255,0.82)] transition-shadow">
            БД отклонений
          </button>
          <button
            onClick={onNavigateToUsers}
            className="h-[138px] w-[307px] rounded-[39px] border-[5px] border-[#453FFF] text-[32px] font-medium hover:shadow-[0_4px_4px_11px_rgba(155,152,255,0.82)] transition-shadow">
            Пользователи
          </button>
        </div>
      </main>
    </div>
  )
}

export default AdminName

