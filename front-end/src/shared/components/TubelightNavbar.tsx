import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import './tubelight-navbar.css'

export interface TubelightNavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface TubelightNavbarProps {
  items: TubelightNavItem[]
}

function itemFromLocation(items: TubelightNavItem[]) {
  if (typeof window === 'undefined') return items[0]?.name ?? ''

  const activeItem = items.find((item) => {
    const target = new URL(item.url, window.location.origin)
    if (target.pathname !== window.location.pathname) return false
    return target.hash ? target.hash === window.location.hash : true
  })

  if (activeItem) return activeItem.name
  return window.location.pathname === '/' ? items[0]?.name ?? '' : ''
}

export function TubelightNavbar({ items }: TubelightNavbarProps) {
  const [activeItem, setActiveItem] = useState(() => itemFromLocation(items))

  useEffect(() => {
    const updateActiveItem = () => setActiveItem(itemFromLocation(items))
    window.addEventListener('hashchange', updateActiveItem)
    window.addEventListener('popstate', updateActiveItem)
    return () => {
      window.removeEventListener('hashchange', updateActiveItem)
      window.removeEventListener('popstate', updateActiveItem)
    }
  }, [items])

  return (
    <nav className="tubelight-navbar" aria-label="Navegação principal">
      <div className="tubelight-navbar__track">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.name

          return (
            <a
              className={`tubelight-navbar__item${isActive ? ' is-active' : ''}`}
              href={item.url}
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
            >
              <span className="tubelight-navbar__label">{item.name}</span>
              <Icon className="tubelight-navbar__icon" size={18} strokeWidth={2.2} aria-hidden="true" />

              {isActive && (
                <motion.span
                  className="tubelight-navbar__active"
                  layoutId="tubelight-active-item"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  aria-hidden="true"
                >
                  <span className="tubelight-navbar__lamp">
                    <span />
                    <span />
                    <span />
                  </span>
                </motion.span>
              )}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
