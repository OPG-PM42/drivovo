import type { Review } from '@drivovo/domain';

export interface ReviewJson {
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  authorImage: string;
}

export function createReview(json: ReviewJson): Review {
  return {
    rating: json.rating,
    comment: json.comment,
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
    author: json.author,
    authorImage: json.authorImage,
  };
}

export function createReviewJson(review: Review): ReviewJson {
  return {
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    author: review.author,
    authorImage: review.authorImage,
  };
}
