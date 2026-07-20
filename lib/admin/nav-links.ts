import { LayoutDashboard, BookOpen, FolderTree, ShoppingCart, Newspaper } from "lucide-react";

export const adminNavLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Cărți", href: "/admin/carti", icon: BookOpen },
  { label: "Categorii", href: "/admin/categorii", icon: FolderTree },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Comenzi", href: "/admin/comenzi", icon: ShoppingCart },
];
