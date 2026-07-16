import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublisherBySlug, getBooksByPublisher } from "@/lib/publishers";
import { SimpleBookListing } from "@/components/catalog/SimpleBookListing";

type PageProps = { params: Promise<{ slug: string }> };

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
