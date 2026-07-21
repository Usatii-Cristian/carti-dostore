export type NavLink = {
  label: string;
  href: string;
};

export const secondaryNavLinks: NavLink[] = [
  { label: "Categorii", href: "/categorii" },
  { label: "Toate produsele", href: "/carti" },
  { label: "Bestsellers", href: "/carti/bestsellers" },
  { label: "Livrare și plată", href: "/livrare-si-plata" },
];
// Notă: „Blog" și „Reduceri" au fost scoase din meniu la cererea utilizatorului.
// Paginile /blog și /carti/reduceri rămân accesibile prin URL direct, doar
// butoanele din nav au dispărut.

// Aliniate la dreapta în bara de navigație (restul stau la stânga).
export const secondaryNavRightLinks: NavLink[] = [
  { label: "Contact", href: "/contact" },
  { label: "Despre noi", href: "/despre-noi" },
];

export const footerInfoLinks: NavLink[] = [
  { label: "Despre noi", href: "/despre-noi" },
  { label: "Cariere", href: "/cariere" },
  { label: "Blog", href: "/blog" },
  { label: "Termeni și condiții", href: "/termeni-si-conditii" },
  { label: "Politica de confidențialitate", href: "/confidentialitate" },
];

export const footerHelpLinks: NavLink[] = [
  { label: "Contact", href: "/contact" },
  { label: "Întrebări frecvente", href: "/intrebari-frecvente" },
  { label: "Livrare și plată", href: "/livrare-si-plata" },
  { label: "Retur și rambursare", href: "/retur-si-rambursare" },
];
