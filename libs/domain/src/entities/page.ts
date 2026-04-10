import { z } from "zod";
import type { CarEntity } from "./car";

import type { Image } from "../value-object/image";

export interface SEO {
    title: string;
    description: string;
}

export interface Review {
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    author: string;
    authorImage: string;
}

export interface CarPageEntity {
    id: string;
    title: string;
    description: string;
    rating: number;
    car: CarEntity;
    reviews: Review[];
    banners: Image[];
    seo: SEO;
}

const imageSchema = z.object({
    url: z.string().url(),
    alt: z.string(),
    width: z.number().positive(),
    height: z.number().positive(),
});

const reviewSchema = z.object({
    rating: z.number().min(0).max(5),
    comment: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    author: z.string().min(1),
    authorImage: z.string(),
});

const seoSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
});

export const carPageSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    description: z.string(),
    rating: z.number().min(0).max(5),
    reviews: z.array(reviewSchema),
    banners: z.array(imageSchema),
    seo: seoSchema,
});