'use client'

import { useEffect, useRef } from 'react'

export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`
        glowRef.current.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      ref={glowRef} 
      className="mouse-glow hidden md:block" 
      style={{ position: 'fixed', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
