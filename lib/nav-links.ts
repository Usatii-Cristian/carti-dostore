export type NavLink = {
  label: string;
  href: string;
};

export const secondaryNavLinks: NavLink[] = [
  { label: "Categorii", href: "/categorii" },
  { label: "Noutăți", href: "/carti/noutati" },
  { label: "Bestsellers", href: "/carti/bestsellers" },
  { label: "Top recomandări", href: "/carti/recomandate" },
  { label: "Edituri", href: "/edituri" },
  { label: "Colecții", href: "/colectii" },
  { label: "Reduceri", href: "/carti/reduceri" },
  { label: "Librării", href: "/librarii" },
  { label: "Livrare și plată", href: "/livrare-si-plata" },
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
