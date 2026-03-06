'use client';
import React, { useState, useEffect } from 'react';

const CategoryForm = ({ initialData, categoryTree, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        parent: initialData.parent || '',
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData]);

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      ...formData,
      parent: formData.parent === '' ? null : parseInt(formData.parent),
    };
    onSubmit(payload);
  };

  const renderOptions = (nodes, depth = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;
    return nodes.map(node => (
      <React.Fragment key={node.id}>
        <option value={node.id}>
          {'\u00A0'.repeat(depth * 4)}
          {depth > 0 ? '↳ ' : ''}
          {node.name.toUpperCase()}
        </option>
        {node.children && renderOptions(node.children, depth + 1)}
      </React.Fragment>
    ));
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all uppercase';

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-10 items-stretch"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Name */}
        <div>
          <label className={labelClass}>GROUP NAME / TYPE</label>
          <input
            type="text"
            placeholder="E.G. TABLETS OR SYRUP"
            className={inputClass}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Parent Selection */}
        <div>
          <label className={labelClass}>UNDER WHICH GROUP? (OPTIONAL)</label>
          <select
            value={formData.parent}
            onChange={e => setFormData({ ...formData, parent: e.target.value })}
            className={inputClass + ' cursor-pointer appearance-none'}
          >
            <option value="">NONE (THIS IS A MAIN GROUP)</option>
            {renderOptions(categoryTree)}
          </select>
        </div>
      </div>

      {/* Status Toggle */}
      <div className="w-full flex items-center justify-between px-6 py-6 bg-white border border-(--color-admin-border) rounded-none">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[13px] font-bold text-(--color-admin-navy) uppercase">
            SHOW IN SHOP?
          </span>
          <span className="font-mono text-[10px] text-(--color-text-secondary) uppercase">
            IF OFF, CUSTOMERS CANNOT SEE THIS GROUP
          </span>
        </div>
        <input
          type="checkbox"
          className="w-8 h-8 border-2 border-(--color-admin-border) rounded-none bg-white accent-(--color-admin-primary) cursor-pointer"
          checked={formData.is_active}
          onChange={e =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-16 bg-(--color-admin-primary) text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer border border-(--color-admin-border) rounded-none disabled:opacity-50"
      >
        {isLoading ? (
          <span className="animate-pulse font-mono">SAVING...</span>
        ) : (
          <span className="font-mono">
            {initialData ? 'SAVE CHANGES' : 'CREATE GROUP'}
          </span>
        )}
      </button>
    </form>
  );
};

export default CategoryForm;
