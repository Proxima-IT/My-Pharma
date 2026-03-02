'use client';

export default function UiInput({
  label,
  type = 'text',
  error,
  icon, // Right icon
  leftIcon, // Leading icon
  ...props
}) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && (
        <label className="text-[13px] font-bold text-gray-600 group-focus-within:text-primary-500 transition-colors duration-300 ml-5">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300 z-10">
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          className={`
            w-full
            py-3.5
            rounded-full
            outline-none
            text-sm
            text-gray-900
            placeholder:text-gray-400
            transition-all
            duration-300
            ${leftIcon ? 'pl-12' : 'pl-6'}
            ${icon ? 'pr-12' : 'pr-6'}
            ${
              error
                ? 'bg-red-50 border border-red-200 focus:ring-4 focus:ring-red-100'
                : 'bg-white border border-gray-200 focus:bg-white focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500'
            }
          `}
          {...props}
        />

        {icon && (
          <div className="absolute right-5 flex items-center cursor-pointer select-none text-gray-400 hover:text-primary-500 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[12px] font-medium text-red-500 mt-1 ml-5 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
