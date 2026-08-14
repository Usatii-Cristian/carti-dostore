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
  /**
   * Tipurile în care se vinde produsul. Cardul din listă are nevoie doar să
   * știe DACĂ există: un produs cu variante nu se poate adăuga direct în coș,
   * fiindcă n-am ști ce tip vrea clientul — butonul duce la pagina produsului.
   */
  variants?: { label: string }[];
};
