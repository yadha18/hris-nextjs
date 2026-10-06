const VARIANT_CLASSES = {
  primary: 'bg-accent text-white hover:bg-accent-light',
  secondary: 'border border-line-strong bg-surface2 text-fg hover:border-accent hover:text-accent-light',
  success: 'bg-success text-white hover:opacity-90',
  danger: 'border border-danger bg-transparent text-danger hover:bg-danger hover:text-white',
  purple: 'border border-purple bg-transparent text-purple hover:bg-purple hover:text-white',
};
const SIZE_CLASSES = { md: 'px-4 py-2 text-[13px]', sm: 'px-2.5 py-[5px] text-xs' };

export default function Button({ variant = 'primary', size = 'md', className = '', ...buttonProps }) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...buttonProps}
    />
  );
}