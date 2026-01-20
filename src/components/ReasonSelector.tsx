import { useState, useEffect, useRef } from 'react'
import { catalogApi, type CatalogValue } from '../services/api'

interface ReasonSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export default function ReasonSelector({ 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  placeholder = 'Выберите причину отклонения...'
}: ReasonSelectorProps) {
  const [catalogValues, setCatalogValues] = useState<CatalogValue[]>([])
  const [filteredValues, setFilteredValues] = useState<CatalogValue[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Загрузка значений из справочника "Причины отклонений"
  useEffect(() => {
    const loadCatalogValues = async () => {
      try {
        setLoading(true)
        const catalogs = await catalogApi.getAll()
        const reasonCatalog = catalogs.find(c => 
          c.title?.toLowerCase().includes('причин') && 
          c.title?.toLowerCase().includes('отклон')
        )
        
        if (reasonCatalog && reasonCatalog.values) {
          setCatalogValues(reasonCatalog.values)
          setFilteredValues(reasonCatalog.values)
        } else {
          console.warn('ReasonSelector: Справочник "Причины отклонений" не найден')
        }
      } catch (error) {
        console.error('Ошибка загрузки справочника причин отклонений:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCatalogValues()
  }, [])

  // Фильтрация по поисковому запросу
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredValues(catalogValues)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = catalogValues.filter(item => 
        item.value?.toLowerCase().includes(query)
      )
      setFilteredValues(filtered)
    }
  }, [searchQuery, catalogValues])

  // Сбрасываем searchQuery когда value меняется извне (при загрузке бланка)
  useEffect(() => {
    // Всегда сбрасываем searchQuery при изменении value извне
    setSearchQuery('')
    setIsOpen(false)
  }, [value])

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    setIsOpen(true)
    
    // Если значение очищено, сбрасываем выбор
    if (!newValue.trim()) {
      onChange('')
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && filteredValues.length > 0) {
      handleSelect(filteredValues[0].value || '')
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={isOpen && searchQuery ? searchQuery : (value || '')}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        onBlur={() => {
          // При потере фокуса сбрасываем поисковый запрос, чтобы отображалось значение
          setTimeout(() => {
            if (!value) {
              setSearchQuery('')
            } else {
              // Если есть значение, сбрасываем поисковый запрос, чтобы отображалось значение
              setSearchQuery('')
            }
          }, 200) // Небольшая задержка, чтобы onClick успел сработать
        }}
        disabled={disabled || loading}
        placeholder={placeholder}
        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
      />
      
      {isOpen && !disabled && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-2 text-gray-500 text-sm">Загрузка...</div>
          ) : filteredValues.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">
              {searchQuery ? 'Ничего не найдено' : 'Нет доступных значений'}
            </div>
          ) : (
            filteredValues.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleSelect(item.value || '')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {item.value}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
