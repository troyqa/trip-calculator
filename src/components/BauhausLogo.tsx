/** Three primaries as pure geometry — brand mark for the Bauhaus shell. */
export function BauhausLogo({
  className = '',
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'onDark'
}) {
  const edge =
    variant === 'onDark' ? 'border-2 border-white' : 'border-2 border-bauhaus-ink'
  return (
    <span
      className={`inline-flex items-end gap-1.5 ${className}`}
      aria-hidden
    >
      <span className={`size-3 rounded-full bg-bauhaus-red ${edge}`} />
      <span className={`size-3 rounded-none bg-bauhaus-blue ${edge}`} />
      <span
        className={`inline-block size-3 bg-bauhaus-yellow ${edge}`}
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      />
    </span>
  )
}
