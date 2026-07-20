import { redirect, notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/categories";

// Categoriile nu mai au pagină proprie: filtrarea trăiește în catalogul unic
// /carti, cu aceleași fațete peste tot. Păstrăm ruta doar ca redirect, ca
// link-urile vechi (indexate de Google, trimise pe WhatsApp) să nu dea 404.

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryRedirectPage({ params }: PageProps) {
  const { slug } = await params;

  // Verificăm că există categoria, altfel am redirecta către un filtru gol.
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  redirect(`/carti?categorii=${slug}`);
}
