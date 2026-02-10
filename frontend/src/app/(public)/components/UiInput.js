'use client';
export default function UiInput({
  label,
  type = 'text',
  error,
  icon, // Right icon (Action)
  leftIcon, // Leading icon (Visual context)
  ...props
}) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && (
        <label className="text-[13px] font-bold text-(--color-gray-600) group-focus-within:text-(--color-primary-500) transition-colors duration-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-4 flex items-center pointer-events-none text-(--color-gray-400) group-focus-within:text-(--color-primary-500) transition-colors duration-300">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={`w-full py-3.5 bg-(--color-gray-50) border border-(--color-gray-200) rounded-xl outline-none transition-all duration-300
            text-(--color-gray-900) text-sm placeholder:text-(--color-gray-400)
            ${leftIcon ? 'pl-11' : 'pl-4'}
            ${icon ? 'pr-11' : 'pr-4'}
            ${
              error
                ? 'border-(--color-info-500) bg-(--color-info-25) focus:ring-(--color-info-50)'
                : 'focus:border-(--color-primary-500) focus:ring-(--color-primary-50)'
            }
            focus:bg-white focus:ring-4`}
          {...props}
        />
        {icon && (
          <div className="absolute right-4 flex items-center cursor-pointer select-none text-(--color-gray-400) hover:text-(--color-primary-500) transition-colors">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] font-bold text-(--color-info-600) uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
