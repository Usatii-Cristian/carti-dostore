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
  // `stock` vine din Prisma ca `number | null` (câmp opțional pe BookVariant),
  // deci tipul trebuie să accepte null — altfel build-ul de producție pică.
  variants?: { label: string; price?: number | null; stock?: number | null }[];
  /**
   * Disponibilitatea, setată din admin. Opțional pentru compatibilitate cu
   * coșul salvat în localStorage înainte de introducerea câmpului: acolo lipsa
   * lui înseamnă „nu știm", nu „epuizat", iar verificarea reală se face oricum
   * pe server, la plasarea comenzii.
   */
  inStock?: boolean;
  stock?: number | null;
};
