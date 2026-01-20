import { useState, useEffect, useRef } from 'react'
import { catalogApi, type CatalogValue } from '../services/api'

interface ShiftSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export default function ShiftSelector({
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder = 'Выберите смену...'
}: ShiftSelectorProps) {
  const [catalogValues, setCatalogValues] = useState<CatalogValue[]>([])
  const [filteredValues, setFilteredValues] = useState<CatalogValue[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Загрузка значений из справочника "Смена"
  useEffect(() => {
    const loadCatalogValues = async () => {
      try {
        setLoading(true)
        const catalogs = await catalogApi.getAll()
        const shiftCatalog = catalogs.find(c =>
          c.title?.toLowerCase().includes('смен')
        )

        if (shiftCatalog && shiftCatalog.values) {
          setCatalogValues(shiftCatalog.values)
          setFilteredValues(shiftCatalog.values)
          console.log('ShiftSelector: Загружено значений из справочника:', shiftCatalog.values.length)
        } else {
          console.warn('ShiftSelector: Справочник "Смена" не найден')
        }
      } catch (error) {
        console.error('Ошибка загрузки справочника смен:', error)
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

  // Сбрасываем searchQuery когда value меняется извне (при загрузке бланка)
  useEffect(() => {
    // Всегда сбрасываем searchQuery при изменении value извне
    setSearchQuery('')
    setIsOpen(false)
  }, [value])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    setIsOpen(true)
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
        value={searchQuery && isOpen ? searchQuery : (value || '')}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        onBlur={() => {
          setTimeout(() => {
            setSearchQuery('')
          }, 200)
        }}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-[38px] px-2 border-0 focus:outline-none bg-transparent"
      />

      {isOpen && !disabled && (
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
