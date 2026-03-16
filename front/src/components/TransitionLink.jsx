"use client"

import { useNavigate } from "@/hooks/useNavigate"

export default function TransitionLink({ href, children, className, style, onClick, ...props }) {
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    onClick?.()
    navigate(href)
  }

  return (
    <a href={href} onClick={handleClick} className={className} style={style} {...props}>
      {children}
    </a>
  )
}