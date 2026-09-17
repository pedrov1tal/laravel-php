import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import './circular-testimonials.css'

export interface CircularTestimonial {
  quote: string
  name: string
  designation: string
  src: string
}

interface CircularTestimonialsProps {
  testimonials: CircularTestimonial[]
  autoplay?: boolean
}

function calculateGap(width: number) {
  const minWidth = 320
  const maxWidth = 560
  const minGap = 42
  const maxGap = 72

  if (width <= minWidth) return minGap
  if (width >= maxWidth) return maxGap
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
}: CircularTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState(480)
  const [autoplayPaused, setAutoplayPaused] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const testimonialsLength = testimonials.length

  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials],
  )

  const handleNext = useCallback(() => {
    if (!testimonialsLength) return
    setActiveIndex((current) => (current + 1) % testimonialsLength)
    setAutoplayPaused(true)
  }, [testimonialsLength])

  const handlePrevious = useCallback(() => {
    if (!testimonialsLength) return
    setActiveIndex((current) => (current - 1 + testimonialsLength) % testimonialsLength)
    setAutoplayPaused(true)
  }, [testimonialsLength])

  useEffect(() => {
    const imageContainer = imageContainerRef.current
    if (!imageContainer) return

    const updateWidth = () => setContainerWidth(imageContainer.offsetWidth)
    updateWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    const observer = new ResizeObserver(updateWidth)
    observer.observe(imageContainer)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!autoplay || autoplayPaused || reduceMotion || testimonialsLength < 2) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonialsLength)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [autoplay, autoplayPaused, reduceMotion, testimonialsLength])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') handlePrevious()
    if (event.key === 'ArrowRight') handleNext()
  }

  function getImageStyle(index: number): CSSProperties {
    const gap = calculateGap(containerWidth)
    const lift = gap * 0.72
    const isActive = index === activeIndex
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index
    const isRight = (activeIndex + 1) % testimonialsLength === index

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1) rotateY(0deg)',
      }
    }

    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 0.72,
        transform: `translate3d(-${gap}px, -${lift}px, 0) scale(.84) rotateY(12deg)`,
      }
    }

    if (isRight) {
      return {
        zIndex: 2,
        opacity: 0.72,
        transform: `translate3d(${gap}px, -${lift}px, 0) scale(.84) rotateY(-12deg)`,
      }
    }

    return { zIndex: 1, opacity: 0, pointerEvents: 'none' }
  }

  if (!activeTestimonial) return null

  return (
    <div
      className="circular-testimonials"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Depoimentos de clientes"
    >
      <div className="circular-testimonials__grid">
        <div className="circular-testimonials__images" ref={imageContainerRef}>
          {testimonials.map((testimonial, index) => (
            <Button
              variant="unstyled"
              className="circular-testimonials__image-button"
              type="button"
              key={testimonial.name}
              style={getImageStyle(index)}
              onClick={() => {
                setActiveIndex(index)
                setAutoplayPaused(true)
              }}
              aria-label={`Mostrar depoimento de ${testimonial.name}`}
              aria-current={index === activeIndex}
            >
              <img src={testimonial.src} alt="" loading="lazy" />
            </Button>
          ))}
        </div>

        <div className="circular-testimonials__content" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <p className="circular-testimonials__quote">
                “{activeTestimonial.quote.split(' ').map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    initial={reduceMotion ? false : { filter: 'blur(8px)', opacity: 0, y: 5 }}
                    animate={{ filter: 'blur(0)', opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: reduceMotion ? 0 : 0.02 * index }}
                  >
                    {word}
                  </motion.span>
                ))}”
              </p>
              <div className="circular-testimonials__person">
                <strong>{activeTestimonial.name}</strong>
                <span>{activeTestimonial.designation}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="circular-testimonials__controls">
            <Button variant="unstyled" type="button" onClick={handlePrevious} aria-label="Depoimento anterior">
              <FaArrowLeft aria-hidden="true" />
            </Button>
            <Button variant="unstyled" type="button" onClick={handleNext} aria-label="Próximo depoimento">
              <FaArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
