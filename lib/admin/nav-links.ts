import { LayoutDashboard, BookOpen, FolderTree, Building2, ShoppingCart } from "lucide-react";

export const adminNavLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Cărți", href: "/admin/carti", icon: BookOpen },
  { label: "Categorii", href: "/admin/categorii", icon: FolderTree },
  { label: "Edituri", href: "/admin/edituri", icon: Building2 },
  { label: "Comenzi", href: "/admin/comenzi", icon: ShoppingCart },
];
