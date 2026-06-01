'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Flag, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/input';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content?: string;
  createdAt: string;
  helpfulCount: number;
}

interface CourseRatingProps {
  courseId: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  onSubmitReview?: (rating: number, title: string, content: string) => Promise<void>;
  onMarkHelpful?: (reviewId: string) => Promise<void>;
}

export function CourseRating({
  courseId,
  averageRating,
  totalReviews,
  reviews,
  onSubmitReview,
  onMarkHelpful,
}: CourseRatingProps) {
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmitReview?.(selectedRating, reviewTitle, reviewContent);
      setShowForm(false);
      setSelectedRating(0);
      setReviewTitle('');
      setReviewContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">{totalReviews} reseñas</p>
        </div>

        {/* Rating bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const percentage = totalReviews > 0
              ? (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100
              : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-3">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{Math.round(percentage)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full"
          variant="outline"
        >
          <Send className="w-4 h-4 mr-2" />
          Escribir una reseña
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-lg">Tu reseña</h3>

          {/* Star Rating Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tu rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setSelectedRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= (hoverRating || selectedRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                    )}
                  />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <span className="text-sm text-yellow-600 font-medium ml-2">
                {selectedRating}/5
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Título (opcional)
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Resumen de tu experiencia..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Tu reseña
            </label>
            <Textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Cuéntales a otros estudiantes sobre tu experiencia con este curso..."
              className="min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={selectedRating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setSelectedRating(0);
                setReviewTitle('');
                setReviewContent('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Reseñas de estudiantes</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Este curso aún no tiene reseñas.</p>
            <p className="text-sm">¡Sé el primero en compartir tu experiencia!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-primary">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.userName}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-4 h-4',
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              {review.title && (
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {review.title}
                </h4>
              )}

              {/* Content */}
              {review.content && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {review.content}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onMarkHelpful?.(review.id)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>¿Fue útil? ({review.helpfulCount})</span>
                </button>
                <button className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// Mini rating display for cards
export function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizes[size],
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          )}
        />
      ))}
    </div>
  );
}