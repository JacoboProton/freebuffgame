'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, MessageSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Textarea is not available, use regular textarea with styling
// Using a styled div as textarea replacement
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className || ''}`} {...props} />
);
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface CourseReviewsProps {
  courseId: string;
  isEnrolled?: boolean;
}

export function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({});

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/course/${courseId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setReviews(data.data.reviews);
        setAverageRating(data.data.averageRating);
        setTotalReviews(data.data.totalReviews);
        setDistribution(data.data.ratingDistribution);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-start gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold mb-1">{averageRating.toFixed(1)}</div>
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-4 h-4',
                  star <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">{totalReviews} reseñas</p>
        </div>

        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-3">{rating}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-gray-500 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review */}
      {isEnrolled && <WriteReviewForm courseId={courseId} onReviewAdded={loadReviews} />}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No hay reseñas todavía. ¡Sé el primero en dejar una!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
}

function WriteReviewForm({ courseId, onReviewAdded }: { courseId: string; onReviewAdded: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/course/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title: title || undefined, content: content || undefined }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSubmitted(true);
        onReviewAdded();
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 text-center">
          <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="font-semibold text-green-700">¡Gracias por tu reseña!</p>
          <p className="text-sm text-green-600">Tu reseña será visible después de ser aprobada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold">Escribe una reseña</h3>

      {/* Star Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'w-8 h-8 transition-colors',
                star <= (hoverRating || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Título de tu reseña (opcional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      <Textarea
        placeholder="Cuéntanos tu experiencia con este curso..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      <Button type="submit" disabled={submitting || rating === 0} className="gap-2">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Publicar Reseña
          </>
        )}
      </Button>
    </form>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {review.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold">{review.user.name}</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-3 h-3',
                        star <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {new Date(review.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          {review.title && (
            <h4 className="font-semibold mb-1">{review.title}</h4>
          )}

          {review.content && (
            <p className="text-gray-600 text-sm">{review.content}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}