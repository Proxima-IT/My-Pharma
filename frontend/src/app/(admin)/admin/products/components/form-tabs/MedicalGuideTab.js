'use client';
import React from 'react';
import RichTextEditor from '../RichTextEditor';

// Tailwind style constants for industrial "Sharp" design
const labelClass =
  'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3';

/**
 * MedicalGuideTab
 * Updated: Replaced all medical textareas with the professional RichTextEditor.
 * Ensures all medical metadata is stored in consistent Markdown (README) format.
 */
export default function MedicalGuideTab({ formData, handleInputChange }) {
  const medicalFields = [
    { id: 'indications', label: 'Indications (নির্দেশনা)' },
    {
      id: 'dosage_administration',
      label: 'Dosage & Administration',
    },
    { id: 'pharmacology', label: 'Pharmacology Details' },
    { id: 'side_effects', label: 'Side Effects' },
    { id: 'contraindications', label: 'Contraindications' },
    { id: 'precautions_warnings', label: 'Warnings & Precautions' },
    { id: 'interaction', label: 'Drug Interactions' },
    { id: 'pregnancy_lactation', label: 'Pregnancy & Lactation' },
  ];

  /**
   * Adapts the RichTextEditor's output to the parent's generic state handler.
   * @param {string} fieldId - The specific medical metadata field name.
   * @param {string} value - The Markdown content from the editor.
   */
  const handleEditorUpdate = (fieldId, value) => {
    handleInputChange({
      target: {
        name: fieldId,
        value: value,
      },
    });
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-left-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
        {medicalFields.map(field => (
          <div key={field.id} className="space-y-0">
            <label className={labelClass}>{field.label}</label>
            <RichTextEditor
              value={formData[field.id] || ''}
              onChange={val => handleEditorUpdate(field.id, val)}
              placeholder={`Enter ${field.label.toLowerCase()} details...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
