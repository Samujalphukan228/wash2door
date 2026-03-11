"use client"

export default function BookButton({ variant = "mobile" }) {
  if (variant === "desktop") {
    return (
      <a
        href="https://wash2door.in/bookin/"
        className="relative text-[10px] tracking-[0.2em] uppercase text-black border border-black px-5 py-2.5 no-underline overflow-hidden group rounded-[5px]"
      >
        <span className="absolute inset-0 bg-black transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
        <span className="relative z-10 group-hover:text-white transition-colors duration-500">
          Book Now
        </span>
      </a>
    )
  }

  return (
    <a
      href="https://wash2door.in/bookin/"
      className="md:hidden relative text-[10px] tracking-[0.18em] uppercase text-black border border-black px-3 py-2 no-underline overflow-hidden group rounded-[5px]"
    >
      <span className="absolute inset-0 bg-black transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
      <span className="relative z-10 group-hover:text-white transition-colors duration-500">
        Book
      </span>
    </a>
  )
}