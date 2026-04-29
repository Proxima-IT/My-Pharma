'use client';

import React from 'react';
import { FiCode, FiAlignLeft } from 'react-icons/fi';

/**
 * RichTextEditor Component (Refactored to RAW HTML Editor)
 * Removed TipTap to prevent HTML escaping/encoding issues.
 * Features: Accepts direct HTML input and saves it exactly as typed to the database.
 * Design: Sharp Industrial (rounded-none, border-2, high contrast, mono font for code).
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Paste or write your RAW HTML content here...',
}) => {
  const handleChange = e => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full border-2 border-gray-100 bg-white group focus-within:border-black transition-all rounded-none shadow-none">
      {/* Header Info Bar */}
      <div className="flex flex-wrap bg-gray-50 border-b border-gray-100 p-3 gap-1 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-gray-500">
          <FiCode size={16} />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest">
            HTML_SOURCE_EDITOR
          </span>
        </div>

        <div className="ml-auto pr-2 flex items-center gap-4">
          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-300 uppercase">
            <FiAlignLeft /> Text_Wrap: ON
          </div>
          <span className="font-mono text-[9px] font-bold text-[#3A5A40] uppercase tracking-widest bg-[#E8F0EA] px-2 py-0.5">
            Format: DIRECT_INJECTION
          </span>
        </div>
      </div>

      {/* Raw Text Area Container */}
      <div className="relative">
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full min-h-[300px] p-6 font-mono text-sm text-black bg-white outline-none resize-y rounded-none uppercase"
          style={{ textTransform: 'none' }} // Ensure HTML tags aren't visually forced to uppercase if global CSS isn't applied yet
        />

        {/* Character/Data Counter */}
        <div className="absolute bottom-3 right-5 pointer-events-none bg-white/80 px-2 py-1">
          <span className="font-mono text-[9px] font-bold text-gray-400 uppercase">
            Payload Size: {value?.length || 0} bytes
          </span>
        </div>
      </div>

      {/* Footer Instruction */}
      <div className="bg-gray-50 p-2 border-t border-gray-100 text-center">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
          Caution: HTML entered here will be rendered directly on the public
          site. Ensure tags are properly closed.
        </p>
      </div>
    </div>
  );
};

export default RichTextEditor;
