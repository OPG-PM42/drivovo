import type { CarEntity } from "./car";

import type { Image } from "../value-object/image";

export interface SEO {
    title: string;
    description: string;
}

export interface Review {
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
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