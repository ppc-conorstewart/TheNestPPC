// src/components/Footer.jsx


export default function Footer() {
  return (
    <footer
      className="mt-auto w-full bg-transparent   text-white font-erbaum text-xs"
      style={{
        minHeight: '1.5rem',
        lineHeight: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <div className="flex items-center justify-center gap-3 px-3">
        <img
          src="/assets/Paloma_Logo_White_Rounded.png"
          alt="Paloma Logo"
          className="h-5 w-auto"
          draggable={false}
        />
        <span className="uppercase font-semibold tracking-wide">
          Paloma Pressure Control ™
        </span>
      </div>
    </footer>
  )
}
