"use client"

import { useEffect, useState, memo, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Sparkles,
} from "lucide-react"
import { getPublicServices, getCategories } from "@/lib/services.api"

// ── Constants ──────────────────────────────────────────────
const PHONE_NUMBER = "6900706456"

// ── Helper Functions ───────────────────────────────────────
const getImageUrl = (image) => {
  if (!image) return null
  if (typeof image === "string") return image
  if (typeof image === "object" && image.url) return image.url
  return null
}

// ── Image Component ────────────────────────────────────────
const ServiceImage = memo(function ServiceImage({ src, alt, fallbackIcon }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-5xl">{fallbackIcon || "📦"}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
})

// ── Skeleton ───────────────────────────────────────────────
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-32 bg-gray-100 animate-pulse rounded" />
        <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
        <div className="h-12 w-full bg-gray-100 animate-pulse rounded-xl mt-4" />
      </div>
    </div>
  )
})

// ══════════════════════════════════════════════════════════
// ── CLEAN BLACK HERO ─────────────────────────────────────
// ══════════════════════════════════════════════════════════

const Hero = memo(function Hero({ activeCategoryData, onBack }) {
  const isCategory = !!activeCategoryData

  return (
    <section className="relative bg-black pt-24 pb-12 md:pt-32 md:pb-16">
      {/* Simple grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
             backgroundSize: "60px 60px",
           }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        {isCategory && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to all services</span>
          </button>
        )}

        <h1
          className="text-white mb-4"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            lineHeight: 1.1,
          }}
        >
          {isCategory ? (
            <>
              {activeCategoryData.icon} {activeCategoryData.name}
            </>
          ) : (
            "Our Services"
          )}
        </h1>

        <p className="text-white/50 max-w-2xl" style={{ fontSize: "17px" }}>
          {isCategory
            ? activeCategoryData.description || "Browse all services in this category"
            : "Professional car care and home cleaning at your doorstep"}
        </p>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// ── SIMPLE CATEGORY CARD ─────────────────────────────────
// ══════════════════════════════════════════════════════════

const CategoryCard = memo(function CategoryCard({ category, onClick }) {
  const image = getImageUrl(category.image)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onClick={() => onClick(category._id)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100
                 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <ServiceImage src={image} alt={category.name} fallbackIcon={category.icon} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{category.icon}</span>
          {category.totalServices > 0 && (
            <span className="text-gray-400 text-sm">{category.totalServices} services</span>
          )}
        </div>

        <h3
          className="text-black mb-2"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "22px",
            fontWeight: 400,
          }}
        >
          {category.name}
        </h3>

        {category.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-black text-sm font-medium group-hover:gap-3 transition-all">
          <span>Explore</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  )
})

// ══════════════════════════════════════════════════════════
// ── SIMPLE SERVICE CARD ──────────────────────────────────
// ══════════════════════════════════════════════════════════

const ServiceCard = memo(function ServiceCard({ service }) {
  const image = getImageUrl(service.primaryImage) || getImageUrl(service.images?.[0])
  const categoryIcon = service.category?.icon || ""
  const categoryName = service.category?.name || ""

  const activeVariants = useMemo(
    () => service.variants?.filter((v) => v.isActive !== false) || [],
    [service.variants]
  )

  const lowestPrice = activeVariants.length > 0
    ? Math.min(...activeVariants.map(v => v.discountPrice || v.price))
    : service.startingPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100
                 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <ServiceImage src={image} alt={service.name} fallbackIcon={categoryIcon} />
        
        {/* Price badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "16px" }}>
            ₹{lowestPrice?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">
          {categoryIcon} {categoryName}
        </p>

        <h3
          className="text-black mb-3"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "20px",
            fontWeight: 400,
          }}
        >
          {service.name}
        </h3>

        <p className="text-gray-500 text-sm mb-5 line-clamp-2">
          {service.description || service.shortDescription}
        </p>

        <a
          href={`/bookings?service=${encodeURIComponent(service._id)}`}
          className="flex items-center justify-center gap-2 h-12 bg-black text-white rounded-xl
                     hover:bg-gray-900 transition-colors no-underline"
        >
          <span className="text-sm font-medium">Book Now</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </motion.div>
  )
})

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT ───────────────────────────────────────
// ══════════════════════════════════════════════════════════

export default function ServicesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryId = searchParams.get("category")

  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [activeCategoryData, setActiveCategoryData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)

      try {
        if (categoryId) {
          const [servicesData, categoriesData] = await Promise.all([
            getPublicServices({ category: categoryId }),
            getCategories(),
          ])

          if (isMounted) {
            setServices(Array.isArray(servicesData) ? servicesData : [])
            const found = categoriesData?.find((c) => c._id === categoryId)
            setActiveCategoryData(found || null)
          }
        } else {
          const data = await getCategories()
          if (isMounted) {
            setCategories(Array.isArray(data) ? data : [])
            setActiveCategoryData(null)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [categoryId])

  const handleCategoryClick = useCallback(
    (catId) => {
      router.push(`/services?category=${encodeURIComponent(catId)}`)
    },
    [router]
  )

  const handleBack = useCallback(() => {
    router.push("/services")
  }, [router])

  const isViewingCategory = !!categoryId

  return (
    <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <Hero activeCategoryData={activeCategoryData} onBack={handleBack} />

      <section className="bg-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isViewingCategory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {!loading && (
        <section className="bg-black py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-5 text-center">
            <Sparkles size={32} className="mx-auto mb-6 text-white/30" />
            
            <h2
              className="text-white mb-8"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: "clamp(2rem, 4vw, 3rem)",
              }}
            >
              Ready to Book?
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/bookings"
                className="inline-flex items-center gap-3 h-14 px-10 bg-white text-black rounded-full no-underline hover:bg-gray-100"
              >
                <span className="text-sm font-medium">Book Now</span>
                <ArrowRight size={16} />
              </a>

              <a
                href={`tel:${PHONE_NUMBER}`}
                className="inline-flex items-center gap-3 h-14 px-10 border border-white/20 text-white rounded-full no-underline hover:bg-white/5"
              >
                <Phone size={16} />
                <span className="text-sm">{PHONE_NUMBER}</span>
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}