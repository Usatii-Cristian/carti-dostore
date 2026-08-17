import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublisherBySlug, getBooksByPublisher, getAllPublishers } from "@/lib/publishers";
import { SimpleBookListing } from "@/components/catalog/SimpleBookListing";

type PageProps = { params: Promise<{ slug: string }> };

// Pagina depinde doar de slug, deci se poate prerandă și servi din CDN, cu
// aceeași fereastră de 5 minute ca restul magazinului.
export const revalidate = 300;

export async function generateStaticParams() {
  const publishers = await getAllPublishers();
  return publishers.map((publisher) => ({ slug: publisher.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);
  if (!publisher) return { title: "Editură negăsită" };
  return {
    title: publisher.name,
    description: `Cărți publicate de editura ${publisher.name}, disponibile pe Dostore Carti.`,
  };
}

export default async function PublisherPage({ params }: PageProps) {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);

  if (!publisher) notFound();

  const books = await getBooksByPublisher(publisher.name);

  return (
    <SimpleBookListing
      title={publisher.name}
      subtitle={`Cărți publicate de ${publisher.name}`}
      books={books}
      emptyMessage="Momentan nu avem cărți de la această editură."
    />
  );
}
