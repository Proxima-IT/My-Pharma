'use client';
import React from 'react';
import { FiPlus, FiTrash2, FiHelpCircle, FiSettings } from 'react-icons/fi';

// Tailwind style constants for Sharp Industrial UI
const inputClass =
  'w-full h-14 px-5 bg-white border-2 border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-black transition-all uppercase placeholder:text-gray-200 text-black';
const labelClass =
  'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3';
const textAreaClass =
  'w-full min-h-[100px] p-5 bg-white border-2 border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-black transition-all uppercase text-black';

/**
 * AdvancedTab
 * Features:
 * 1. Dynamic Specification Builder (Key-Value pairs).
 * 2. Dynamic FAQ Builder (Question-Answer pairs) saved as JSON string.
 * 3. Additional medical categorization fields.
 */
export default function AdvancedTab({
  specs,
  addSpecField,
  removeSpecField,
  updateSpec,
  faqs, // New: Array of {question, answer}
  addFaqField, // New: Handler to add row
  removeFaqField, // New: Handler to remove row
  updateFaq, // New: Handler to update specific field
  formData,
  handleInputChange,
}) {
  return (
    <div className="space-y-16 animate-in slide-in-from-left-2 pb-10">
      {/* 1. Custom Specification Builder */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <FiSettings className="text-[#3A5A40]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-black">
            Specifications
          </h3>
        </div>
        <div className="space-y-4">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <input
                  className={inputClass}
                  placeholder="SPECIFICATION LABEL (E.G. STORAGE)"
                  value={s.key}
                  onChange={e => updateSpec(i, 'key', e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  className={inputClass}
                  placeholder="SPECIFICATION VALUE (E.G. BELOW 30°C)"
                  value={s.value}
                  onChange={e => updateSpec(i, 'value', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSpecField(i)}
                className="h-14 px-5 bg-gray-50 text-red-500 hover:bg-red-600 hover:text-white transition-all border-2 border-gray-100 hover:border-red-600 cursor-pointer"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpecField}
            className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#3A5A40] hover:text-black transition-colors cursor-pointer underline underline-offset-4"
          >
            <FiPlus /> Add Specification Entry
          </button>
        </div>
      </div>

      {/* 2. Medical Classification Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-50/50 p-8 border-2 border-gray-100">
        <div>
          <label className={labelClass}>Recommended Storage</label>
          <input
            name="storage_conditions"
            placeholder="E.G. KEEP IN COOL DRY PLACE"
            className={inputClass}
            value={formData.storage_conditions}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className={labelClass}>Therapeutic Class</label>
          <input
            name="therapeutic_class"
            placeholder="E.G. ANALGESICS & ANTIPYRETICS"
            className={inputClass}
            value={formData.therapeutic_class}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* 3. Dynamic FAQ Builder (Question & Answer) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <FiHelpCircle className="text-[#3A5A40]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-black">
            Product Q&A (FAQ Builder)
          </h3>
        </div>

        <div className="space-y-8">
          {faqs &&
            faqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 border-2 border-gray-100 bg-white space-y-4 relative group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    Entry #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaqField(i)}
                    className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove FAQ"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Question</label>
                    <input
                      className={inputClass}
                      placeholder="ENTER COMMON CUSTOMER QUESTION..."
                      value={faq.question}
                      onChange={e => updateFaq(i, 'question', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Detailed Answer</label>
                    <textarea
                      className={textAreaClass}
                      placeholder="ENTER AUTHORITATIVE MEDICAL ANSWER..."
                      value={faq.answer}
                      onChange={e => updateFaq(i, 'answer', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

          <button
            type="button"
            onClick={addFaqField}
            className="w-full h-14 border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#3A5A40] hover:text-[#3A5A40] transition-all font-mono text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer"
          >
            <FiPlus /> Append New FAQ Entry
          </button>
        </div>
      </div>
    </div>
  );
}
