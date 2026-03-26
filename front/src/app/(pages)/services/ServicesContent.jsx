"use client"

import { useEffect, useState, memo, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Check,
  Clock,
  Tag,
} from "lucide-react"
import { getPublicServices, getCategories, getSubcategoriesByCategoryId } from "@/lib/services.api"

// ── Constants ──────────────────────────────────────────────
const PHONE_NUMBER = "6900706456"
const SKELETON_COUNT = 6

// ── Animation Variants ─────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// ── Helper Functions ───────────────────────────────────────
const getImageUrl = (image) => {
  if (!image) return null
  if (typeof image === "string") return image
  if (typeof image === "object" && image.url) return image.url
  return null
}

const calculateLowestPrice = (variants, fallbackPrice) => {
  if (!variants || variants.length === 0) return fallbackPrice
  const activeVariants = variants.filter((v) => v.isActive !== false)
  if (activeVariants.length === 0) return fallbackPrice
  return Math.min(...activeVariants.map(v => v.discountPrice || v.price))
}

// ── Image Component ────────────────────────────────────────
const ServiceImage = memo(function ServiceImage({ src, alt, fallbackIcon }) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = useCallback(() => setIsLoading(false), [])
  const handleError = useCallback(() => { setHasError(true); setIsLoading(false) }, [])

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-5xl">{fallbackIcon || "📦"}</span>
      </div>
    )
  }

  return (
    <>
      {isLoading && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
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
        <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded" />
        <div className="h-12 w-full bg-gray-100 animate-pulse rounded-xl mt-4" />
      </div>
    </div>
  )
})

// ── Loading Spinner ────────────────────────────────────────
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-gray-300" />
    </div>
  )
})

// ── Error Message ──────────────────────────────────────────
const ErrorMessage = memo(function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">
        {message || "Failed to load services. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 h-12 px-6 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
        >
          <span className="text-sm font-medium">Try Again</span>
        </button>
      )}
    </div>
  )
})

// ── Empty State ────────────────────────────────────────────
const EmptyState = memo(function EmptyState({ message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5">
      <span className="text-6xl mb-4">{icon || "📭"}</span>
      <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
      <p className="text-gray-500 text-center max-w-md">
        {message || "There are no services available right now."}
      </p>
    </div>
  )
})

// ══════════════════════════════════════════════════════════
// ── SERVICE DETAIL POPUP ─────────────────────────────────
// ══════════════════════════════════════════════════════════

const ServiceDetailPopup = memo(function ServiceDetailPopup({ service, onClose }) {
  const image = useMemo(
    () => getImageUrl(service.primaryImage) || getImageUrl(service.images?.[0]),
    [service.primaryImage, service.images]
  )

  const price = service.finalPrice || service.price
  const discountPrice = service.discountPrice
  const hasDiscount = discountPrice && discountPrice < price

  const bookingUrl = `/bookings?service=${encodeURIComponent(service._id)}`

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="
            relative bg-white w-full sm:max-w-lg
            rounded-t-3xl sm:rounded-2xl
            overflow-hidden shadow-2xl
            max-h-[92vh] flex flex-col
          "
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative h-52 sm:h-60 bg-gray-100 shrink-0">
            <ServiceImage src={image} alt={service.name} fallbackIcon={service.category?.icon} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Price on image */}
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2">
                {hasDiscount ? (
                  <>
                    <span
                      className="bg-white text-black px-4 py-1.5 rounded-xl font-medium"
                      style={{ fontFamily: 'Georgia, serif', fontSize: "18px" }}
                    >
                      ₹{discountPrice.toLocaleString("en-IN")}
                    </span>
                    <span
                      className="text-white/60 line-through text-sm"
                    >
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                  </>
                ) : (
                  <span
                    className="bg-white text-black px-4 py-1.5 rounded-xl font-medium"
                    style={{ fontFamily: 'Georgia, serif', fontSize: "18px" }}
                  >
                    ₹{price?.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Category breadcrumb */}
            {(service.category?.name || service.subcategory?.name) && (
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                {service.category?.icon && <span className="mr-1">{service.category.icon}</span>}
                {service.category?.name}
                {service.subcategory?.name && ` › ${service.subcategory.name}`}
              </p>
            )}

            {/* Title */}
            <h2
              className="text-black mb-2"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "24px",
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              {service.name}
            </h2>

            {/* Duration */}
            {service.duration && (
              <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                <Clock size={14} />
                <span>{service.duration} min</span>
              </div>
            )}

            {/* Description */}
            {(service.description || service.shortDescription) && (
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {service.description || service.shortDescription}
              </p>
            )}

            {/* Features */}
            {service.features?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">
                  What's included
                </p>
                <ul className="space-y-2.5">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} className="text-white" />
                      </div>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
            <a
              href={bookingUrl}
              className="flex items-center justify-center gap-2 h-13 py-3.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors no-underline w-full"
            >
              <span className="text-sm font-medium">Book Now</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// ══════════════════════════════════════════════════════════
// ── HERO SECTION ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════

const Hero = memo(function Hero({ activeCategoryData, activeSubcategoryData, onBack }) {
  const isSubcategory = !!activeSubcategoryData
  const isCategory = !!activeCategoryData

  return (
    <section className="relative bg-black pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} 
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
        <AnimatePresence mode="wait">
          {(isCategory || isSubcategory) && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              onClick={onBack}
              className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">
                {isSubcategory ? "Back to service types" : "Back to all services"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {isSubcategory && activeCategoryData && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/40 text-sm mb-4"
          >
            {activeCategoryData.icon} {activeCategoryData.name} &gt; {activeSubcategoryData?.icon} {activeSubcategoryData?.name}
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-white mb-4"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            lineHeight: 1.1,
          }}
        >
          {isSubcategory ? (
            <><span className="mr-3">{activeSubcategoryData?.icon}</span>{activeSubcategoryData?.name}</>
          ) : isCategory ? (
            <><span className="mr-3">{activeCategoryData?.icon}</span>{activeCategoryData?.name}</>
          ) : (
            "Our Services"
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/50 max-w-2xl"
          style={{ fontSize: "17px" }}
        >
          {isSubcategory
            ? activeSubcategoryData?.description || "Browse all services in this category"
            : isCategory
            ? activeCategoryData?.description || "Browse all services in this category"
            : "Professional car care and home cleaning at your doorstep"}
        </motion.p>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// ── CATEGORY CARD ────────────────────────────────────────
// ══════════════════════════════════════════════════════════

const CategoryCard = memo(function CategoryCard({ category, onClick }) {
  const image = useMemo(() => getImageUrl(category.image), [category.image])
  const handleClick = useCallback(() => onClick(category._id), [category._id, onClick])

  return (
    <motion.div
      variants={fadeInUp}
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100
                 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <ServiceImage src={image} alt={category.name} fallbackIcon={category.icon} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl" aria-hidden="true">{category.icon}</span>
          {category.totalServices > 0 && (
            <span className="text-gray-400 text-sm">
              {category.totalServices} service{category.totalServices !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <h3
          className="text-black mb-2"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "22px", fontWeight: 400 }}
        >
          {category.name}
        </h3>
        {category.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{category.description}</p>
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
// ── SUBCATEGORY CARD ─────────────────────────────────────
// ══════════════════════════════════════════════════════════

const SubcategoryCard = memo(function SubcategoryCard({ subcategory, onClick }) {
  const image = useMemo(() => getImageUrl(subcategory.image), [subcategory.image])
  const handleClick = useCallback(() => onClick(subcategory._id), [subcategory._id, onClick])

  return (
    <motion.div
      variants={fadeInUp}
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100
                 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <ServiceImage src={image} alt={subcategory.name} fallbackIcon={subcategory.icon} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl" aria-hidden="true">{subcategory.icon}</span>
          {subcategory.totalServices > 0 && (
            <span className="text-gray-400 text-sm">
              {subcategory.totalServices} service{subcategory.totalServices !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <h3
          className="text-black mb-2"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "22px", fontWeight: 400 }}
        >
          {subcategory.name}
        </h3>
        {subcategory.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{subcategory.description}</p>
        )}
        <div className="flex items-center gap-2 text-black text-sm font-medium group-hover:gap-3 transition-all">
          <span>View Services</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  )
})

// ══════════════════════════════════════════════════════════
// ── SERVICE CARD ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════

const ServiceCard = memo(function ServiceCard({ service, onBookClick }) {
  const image = useMemo(
    () => getImageUrl(service.primaryImage) || getImageUrl(service.images?.[0]),
    [service.primaryImage, service.images]
  )

  const categoryIcon = service.category?.icon || ""
  const categoryName = service.category?.name || ""
  const subcategoryName = service.subcategory?.name || ""

  const lowestPrice = useMemo(
    () => calculateLowestPrice(service.variants, service.finalPrice || service.price),
    [service.variants, service.finalPrice, service.price]
  )

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100
                 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <ServiceImage src={image} alt={service.name} fallbackIcon={categoryIcon} />
        {lowestPrice && (
          <div className="absolute top-4 right-4">
            <span
              className="bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "16px" }}
            >
              ₹{lowestPrice.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {(categoryName || subcategoryName) && (
          <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">
            {categoryIcon && <span className="mr-1">{categoryIcon}</span>}
            {categoryName}
            {subcategoryName && ` > ${subcategoryName}`}
          </p>
        )}

        <h3
          className="text-black mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "20px", fontWeight: 400 }}
        >
          {service.name}
        </h3>

        {/* Features preview */}
        {service.features?.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {service.features.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                {feature}
              </li>
            ))}
            {service.features.length > 3 && (
              <li className="text-gray-400 text-xs pl-3">
                +{service.features.length - 3} more
              </li>
            )}
          </ul>
        )}

        {(service.description || service.shortDescription) && !service.features?.length && (
          <p className="text-gray-500 text-sm mb-5 line-clamp-2">
            {service.description || service.shortDescription}
          </p>
        )}

        <button
          onClick={() => onBookClick(service)}
          className="flex items-center justify-center gap-2 h-12 w-full bg-black text-white rounded-xl
                     hover:bg-gray-900 transition-colors"
        >
          <span className="text-sm font-medium">Book Now</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
})

// ══════════════════════════════════════════════════════════
// ── CTA SECTION ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════

const CTASection = memo(function CTASection() {
  return (
    <section className="bg-black py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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
              className="inline-flex items-center gap-3 h-14 px-10 bg-white text-black rounded-full no-underline hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium">Book Now</span>
              <ArrowRight size={16} />
            </a>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex items-center gap-3 h-14 px-10 border border-white/20 text-white rounded-full no-underline hover:bg-white/5 transition-colors"
            >
              <Phone size={16} />
              <span className="text-sm">{PHONE_NUMBER}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
})

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT ───────────────────────────────────────
// ══════════════════════════════════════════════════════════

export default function ServicesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryId = searchParams.get("category")
  const subcategoryId = searchParams.get("subcategory")

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [services, setServices] = useState([])
  const [activeCategoryData, setActiveCategoryData] = useState(null)
  const [activeSubcategoryData, setActiveSubcategoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedService, setSelectedService] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (subcategoryId) {
        const [servicesData, categoriesData] = await Promise.all([
          getPublicServices({ subcategory: subcategoryId }),
          getCategories(),
        ])
        setServices(Array.isArray(servicesData) ? servicesData : [])
        const category = categoriesData?.find((c) => c._id === categoryId)
        setActiveCategoryData(category || null)
        if (category) {
          const subcatsData = await getSubcategoriesByCategoryId(categoryId)
          const subcat = subcatsData?.find((s) => s._id === subcategoryId)
          setActiveSubcategoryData(subcat || null)
        }
      } else if (categoryId) {
        const [subcatsData, categoriesData] = await Promise.all([
          getSubcategoriesByCategoryId(categoryId),
          getCategories(),
        ])
        setSubcategories(Array.isArray(subcatsData) ? subcatsData : [])
        const found = categoriesData?.find((c) => c._id === categoryId)
        setActiveCategoryData(found || null)
        setActiveSubcategoryData(null)
      } else {
        const data = await getCategories()
        setCategories(Array.isArray(data) ? data : [])
        setActiveCategoryData(null)
        setActiveSubcategoryData(null)
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError(err.message || "Failed to load services")
    } finally {
      setLoading(false)
    }
  }, [categoryId, subcategoryId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCategoryClick = useCallback(
    (catId) => router.push(`/services?category=${encodeURIComponent(catId)}`),
    [router]
  )

  const handleSubcategoryClick = useCallback(
    (subcatId) => router.push(`/services?category=${encodeURIComponent(categoryId)}&subcategory=${encodeURIComponent(subcatId)}`),
    [router, categoryId]
  )

  const handleBack = useCallback(() => {
    if (subcategoryId) {
      router.push(`/services?category=${categoryId}`)
    } else if (categoryId) {
      router.push("/services")
    }
  }, [router, categoryId, subcategoryId])

  const handleRetry = useCallback(() => fetchData(), [fetchData])
  const handleBookClick = useCallback((service) => setSelectedService(service), [])
  const handleClosePopup = useCallback(() => setSelectedService(null), [])

  const isViewingServices = !!subcategoryId
  const isViewingSubcategories = !!categoryId && !subcategoryId
  const isViewingCategories = !categoryId

  let hasContent = false
  let contentToShow = null

  if (isViewingServices) {
    hasContent = services.length > 0
    contentToShow = services.map((service) => (
      <ServiceCard key={service._id} service={service} onBookClick={handleBookClick} />
    ))
  } else if (isViewingSubcategories) {
    hasContent = subcategories.length > 0
    contentToShow = subcategories.map((subcategory) => (
      <SubcategoryCard key={subcategory._id} subcategory={subcategory} onClick={handleSubcategoryClick} />
    ))
  } else {
    hasContent = categories.length > 0
    contentToShow = categories.map((category) => (
      <CategoryCard key={category._id} category={category} onClick={handleCategoryClick} />
    ))
  }

  return (
    <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <Hero
        activeCategoryData={activeCategoryData}
        activeSubcategoryData={activeSubcategoryData}
        onBack={handleBack}
      />

      <section className="bg-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12">
          {error ? (
            <ErrorMessage message={error} onRetry={handleRetry} />
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : !hasContent ? (
            <EmptyState
              message={
                isViewingServices
                  ? "No services available in this category"
                  : isViewingSubcategories
                  ? "No service types available in this category"
                  : "No categories available"
              }
              icon={isViewingServices ? "🔍" : "📦"}
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {contentToShow}
            </motion.div>
          )}
        </div>
      </section>

      {!loading && !error && <CTASection />}

      {/* Service Detail Popup */}
      {selectedService && (
        <ServiceDetailPopup service={selectedService} onClose={handleClosePopup} />
      )}
    </main>
  )
}