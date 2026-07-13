import { LayoutDashboard, BookOpen, FolderTree, ShoppingCart } from "lucide-react";

export const adminNavLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Cărți", href: "/admin/carti", icon: BookOpen },
  { label: "Categorii", href: "/admin/categorii", icon: FolderTree },
  { label: "Comenzi", href: "/admin/comenzi", icon: ShoppingCart },
];
