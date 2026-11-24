import './brand-logo.css'

interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  const classes = className ? `brand-logo ${className}` : 'brand-logo'

  return (
    <span className={classes} aria-hidden="true">
      <img
        className="brand-logo__image brand-logo__image--escura"
        src="/images/corte-rapido-logo-escura.png"
        alt=""
      />
      <img
        className="brand-logo__image brand-logo__image--clara"
        src="/images/corte-rapido-logo-clara.png"
        alt=""
      />
    </span>
  )
}
