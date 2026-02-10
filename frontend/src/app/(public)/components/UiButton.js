'use client';
export default function UiButton({
  children,
  variant = 'primary',
  isLoading,
  ...props
}) {
  const isPrimary = variant === 'primary';
  // Inline styles to guarantee rendering regardless of Tailwind compiler state
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: '16px',
    paddingBottom: '16px',
    paddingLeft: '32px',
    paddingRight: '32px',
    borderRadius: '9999px',
    border: isPrimary ? 'none' : '1px solid var(--color-gray-200)',
    backgroundColor: isPrimary ? 'var(--color-primary-500)' : 'transparent',
    color: isPrimary ? 'var(--color-white)' : 'var(--color-gray-700)',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  };

  return (
    <button
      style={baseStyle}
      disabled={isLoading}
      className="font-bold text-[13px] uppercase tracking-[0.15em] hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          viewBox="0 0 24 24"
          style={{ color: 'inherit' }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
