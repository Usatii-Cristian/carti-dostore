export type NavLink = {
  label: string;
  href: string;
};

export const secondaryNavLinks: NavLink[] = [
  { label: "Categorii", href: "/categorii" },
  { label: "Toate produsele", href: "/carti" },
  // „Noutăți" arăta produse; utilizatorul a cerut ca locul din meniu să ducă la blog.
  // Pagina /carti/noutati rămâne activă (link din catalog + filtrul „Noutăți").
  { label: "Blog", href: "/blog" },
  { label: "Bestsellers", href: "/carti/bestsellers" },
  { label: "Reduceri", href: "/carti/reduceri" },
  { label: "Livrare și plată", href: "/livrare-si-plata" },
];

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
