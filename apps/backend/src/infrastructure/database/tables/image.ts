import type { Image } from '@drivovo/domain';

export interface ImageJson {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export function createImage(json: ImageJson): Image {
  return {
    url: json.url,
    alt: json.alt ?? '',
    width: json.width ?? 0,
    height: json.height ?? 0,
  };
}

export function createImageJson(image: Image): ImageJson {
  return {
    url: image.url,
    alt: image.alt || null,
    width: image.width || null,
    height: image.height || null,
  };
}
