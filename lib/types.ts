export type BookCardData = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
};
