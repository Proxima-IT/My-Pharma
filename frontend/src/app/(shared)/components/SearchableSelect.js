'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiChevronDown, FiX, FiSearch } from 'react-icons/fi';

/**
 * SearchableSelect
 * A custom dropdown component with search capabilities designed to fit 
 * the industrial "Sharp" aesthetic (rounded-none, monospace, uppercase, bold borders).
 */
export default function SearchableSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'SELECT',
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return options;
    return options.filter(option =>
      (option.label || '').toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Find currently selected option's label
  const selectedOption = useMemo(() => {
    return options.find(option => String(option.value) === String(value));
  }, [options, value]);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 px-5 bg-white border-2 flex items-center justify-between cursor-pointer text-sm font-mono uppercase transition-all select-none ${
          isOpen ? 'border-black' : 'border-gray-100 hover:border-gray-300'
        }`}
      >
        <span className={selectedOption ? 'text-black' : 'text-gray-300'}>
          {selectedOption ? selectedOption.label.toUpperCase() : placeholder}
        </span>
        <div className="flex items-center gap-2 text-gray-400">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-black focus:outline-none cursor-pointer"
            >
              <FiX size={16} />
            </button>
          )}
          <FiChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : 'text-gray-400'}`}
          />
        </div>
      </div>

      {/* Hidden input for HTML form validation if required */}
      <input
        type="text"
        tabIndex={-1}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        required={required}
        value={value || ''}
        onChange={() => {}}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-black rounded-none shadow-lg max-h-80 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Header */}
          <div className="flex items-center gap-2 px-4 h-12 border-b-2 border-gray-100 bg-gray-50 shrink-0">
            <FiSearch className="text-gray-400 shrink-0" size={16} />
            <input
              type="text"
              className="w-full h-full bg-transparent focus:outline-none text-xs uppercase font-mono text-black placeholder:text-gray-300"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Options Scrolling Box */}
          <div className="overflow-y-auto flex-1 font-mono text-xs uppercase">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-5 py-3.5 cursor-pointer hover:bg-black hover:text-white transition-colors ${
                      isSelected ? 'bg-gray-100 font-bold text-black border-l-4 border-black' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-4 text-gray-400 text-center">
                NO MATCHES FOUND
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
