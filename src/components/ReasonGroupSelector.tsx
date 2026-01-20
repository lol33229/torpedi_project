import { useState, useEffect, useRef } from 'react'
import { catalogApi, type CatalogValue } from '../services/api'

interface ReasonGroupSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export default function ReasonGroupSelector({ 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  placeholder = 'Выберите группу причин...'
}: ReasonGroupSelectorProps) {
  const [catalogValues, setCatalogValues] = useState<CatalogValue[]>([])
  const [filteredValues, setFilteredValues] = useState<CatalogValue[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Загрузка значений из справочника "Группы причин простоя"
  useEffect(() => {
    const loadCatalogValues = async () => {
      try {
        setLoading(true)
        const catalogs = await catalogApi.getAll()
        const reasonGroupCatalog = catalogs.find(c => 
          c.title?.toLowerCase().includes('групп') && 
          (c.title?.toLowerCase().includes('причин') || c.title?.toLowerCase().includes('просто'))
        )
        
        if (reasonGroupCatalog && reasonGroupCatalog.values) {
          setCatalogValues(reasonGroupCatalog.values)
          setFilteredValues(reasonGroupCatalog.values)
        } else {
          console.warn('ReasonGroupSelector: Справочник "Группы причин простоя" не найден')
        }
      } catch (error) {
        console.error('Ошибка загрузки справочника групп причин:', error)
        setCatalogValues([])
        setFilteredValues([])
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

  const handleSelect = (selectedValue: CatalogValue) => {
    onChange(selectedValue.value || '')
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
    } else if (e.key === 'Enter' && filteredValues.length === 1) {
      handleSelect(filteredValues[0])
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
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
        placeholder={placeholder}
        disabled={disabled || loading}
        className={`w-full ${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      
      {loading && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
          Загрузка...
        </div>
      )}

      {isOpen && !disabled && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
          {filteredValues.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {loading ? (
                'Загрузка значений...'
              ) : searchQuery ? (
                'Значения не найдены'
              ) : catalogValues.length === 0 ? (
                'Нет доступных значений'
              ) : (
                'Нет доступных значений'
              )}
            </div>
          ) : (
            filteredValues.map((item) => {
              const itemValue = item.value || ''
              return (
                <div
                  key={item.id || itemValue}
                  onClick={() => handleSelect(item)}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                    value === itemValue ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{itemValue}</div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
