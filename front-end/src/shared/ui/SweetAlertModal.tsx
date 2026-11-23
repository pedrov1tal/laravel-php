import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './sweetalert-modal.css'

interface SweetAlertModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}

export function SweetAlertModal({
  open,
  title,
  onClose,
  children,
  width = 720,
}: SweetAlertModalProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const titleRef = useRef(title)
  const onCloseRef = useRef(onClose)
  const targetRef = useRef<HTMLElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    titleRef.current = title
    onCloseRef.current = onClose
  }, [title, onClose])

  useEffect(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    if (!open) {
      if (targetRef.current && Swal.isVisible()) Swal.close()
      return
    }

    if (targetRef.current && Swal.isVisible()) {
      setPortalTarget(targetRef.current)
      return () => {
        openRef.current = false
        closeTimerRef.current = window.setTimeout(() => {
          closeTimerRef.current = null
          if (!openRef.current && targetRef.current && Swal.isVisible()) Swal.close()
        }, 0)
      }
    }

    const target = document.createElement('div')
    target.className = 'app-swal-react-content'
    targetRef.current = target

    void Swal.fire({
      title: titleRef.current,
      html: target,
      width,
      showCloseButton: true,
      showConfirmButton: false,
      showCancelButton: false,
      focusConfirm: false,
      customClass: {
        popup: 'app-swal-modal',
        title: 'app-swal-modal-title',
        htmlContainer: 'app-swal-modal-content',
        closeButton: 'app-swal-modal-close',
      },
      didOpen: () => setPortalTarget(target),
      didClose: () => {
        if (targetRef.current !== target) return
        targetRef.current = null
        setPortalTarget(null)
        onCloseRef.current()
      },
    })

    return () => {
      openRef.current = false
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null
        if (!openRef.current && targetRef.current === target && Swal.isVisible()) Swal.close()
      }, 0)
    }
  }, [open, width])

  return portalTarget ? createPortal(children, portalTarget) : null
}
