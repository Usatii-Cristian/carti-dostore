import {
  Baby,
  BookOpen,
  BookText,
  Brain,
  Briefcase,
  Feather,
  Globe,
  Landmark,
  Microscope,
  Palette,
  Sprout,
  type LucideProps,
} from "lucide-react";
import { createElement, type ComponentType } from "react";

type IconType = ComponentType<LucideProps>;

// Mapare directă slug → iconiță lucide, pentru categoriile din seed.
const BY_SLUG: Record<string, IconType> = {
  "literatura-romana": BookText,
  "literatura-universala": Globe,
  "dezvoltare-personala": Sprout,
  psihologie: Brain,
  istorie: Landmark,
  afaceri: Briefcase,
  "copii-si-adolescenti": Baby,
  spiritualitate: Feather,
  stiinta: Microscope,
  "arte-si-hobby": Palette,
};

// Fallback pe cuvinte-cheie, pentru categoriile create din admin cu slug-uri noi.
const BY_KEYWORD: [string, IconType][] = [
  ["copii", Baby],
  ["istor", Landmark],
  ["psiho", Brain],
  ["afacer", Briefcase],
  ["business", Briefcase],
  ["stiin", Microscope],
  ["scien", Microscope],
  ["art", Palette],
  ["hobby", Palette],
  ["spiritual", Feather],
  ["religi", Feather],
  ["dezvolt", Sprout],
  ["univers", Globe],
  ["roman", BookText],
  ["litera", BookText],
];

export function pickCategoryIcon(slug: string, name = ""): IconType {
  if (BY_SLUG[slug]) return BY_SLUG[slug];
  const haystack = `${slug} ${name}`.toLowerCase();
  for (const [keyword, Icon] of BY_KEYWORD) {
    if (haystack.includes(keyword)) return Icon;
  }
  return BookOpen;
}

export function CategoryIcon({
  slug,
  name,
  className,
}: {
  slug: string;
  name?: string;
  className?: string;
}) {
  return createElement(pickCategoryIcon(slug, name), {
    className,
    "aria-hidden": true,
  });
}
