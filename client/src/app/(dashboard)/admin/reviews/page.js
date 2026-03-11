'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ReviewsTable from '@/components/admin/reviews/ReviewsTable';
import ReviewsFilter from '@/components/admin/reviews/ReviewsFilter';
import ReviewDetailModal from '@/components/admin/reviews/ReviewDetailModal';
import adminService from '@/services/adminService';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        rating: '',
        isVisible: '',
        search: '',
        sortBy: 'newest'
    });

    const [selectedReview, setSelectedReview] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // ── Fetch Reviews ──
    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await adminService.getAllReviews(params);
            if (response.success) {
                setReviews(response.data || []);
                setTotal(response.total || 0);
                setPages(response.pages || 1);
            }
        } catch (error) {
            toast.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // ── Handlers ──
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleView = (review) => {
        setSelectedReview(review);
        setShowDetailModal(true);
    };

    const handleToggleVisibility = async (review) => {
        try {
            await adminService.toggleReviewVisibility(review._id);
            toast.success(
                review.isVisible
                    ? 'Review hidden'
                    : 'Review made visible'
            );
            fetchReviews();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to update review'
            );
        }
    };

    // ── Stats ──
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length
    }));

    const visibleCount = reviews.filter(r => r.isVisible !== false).length;
    const hiddenCount = reviews.filter(r => r.isVisible === false).length;

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            Management
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white">
                            Reviews
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <Star className="w-4 h-4" />
                        <span className="text-xs tracking-widest uppercase">
                            {total} total reviews
                        </span>
                    </div>
                </div>

                {/* ── Stats Bar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {/* Overall */}
                    <div className="bg-neutral-950 border border-neutral-800 p-4 col-span-2 sm:col-span-1">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                            Average
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-light text-white">
                                {loading ? (
                                    <span className="inline-block h-7 w-8 bg-neutral-800 animate-pulse rounded" />
                                ) : (
                                    avgRating
                                )}
                            </p>
                            <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-neutral-950 border border-neutral-800 p-4">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                            Total
                        </p>
                        <p className="text-2xl font-light text-white">
                            {loading ? (
                                <span className="inline-block h-7 w-8 bg-neutral-800 animate-pulse rounded" />
                            ) : (
                                total
                            )}
                        </p>
                    </div>

                    {/* Visible */}
                    <div className="bg-neutral-950 border border-neutral-800 p-4">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                            Visible
                        </p>
                        <p className="text-2xl font-light text-white">
                            {loading ? (
                                <span className="inline-block h-7 w-8 bg-neutral-800 animate-pulse rounded" />
                            ) : (
                                visibleCount
                            )}
                        </p>
                    </div>

                    {/* Rating Breakdown */}
                    {ratingCounts.map(({ star, count }) => (
                        <div
                            key={star}
                            className="bg-neutral-950 border border-neutral-800 p-4"
                        >
                            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                                {star} ★
                            </p>
                            <p className="text-2xl font-light text-white">
                                {loading ? (
                                    <span className="inline-block h-7 w-8 bg-neutral-800 animate-pulse rounded" />
                                ) : (
                                    count
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <ReviewsFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* ── Table ── */}
                <ReviewsTable
                    reviews={reviews}
                    loading={loading}
                    total={total}
                    pages={pages}
                    currentPage={filters.page}
                    onPageChange={handlePageChange}
                    onView={handleView}
                    onToggleVisibility={handleToggleVisibility}
                />
            </div>

            {/* ── Modals ── */}
            {showDetailModal && selectedReview && (
                <ReviewDetailModal
                    review={selectedReview}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedReview(null);
                    }}
                    onToggleVisibility={async () => {
                        await handleToggleVisibility(selectedReview);
                        setShowDetailModal(false);
                        setSelectedReview(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}