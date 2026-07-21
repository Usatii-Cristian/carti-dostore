import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { BestsellersSection } from "@/components/home/BestsellersSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { BlogHighlights } from "@/components/home/BlogHighlights";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export default function Home() {
  return (
    <>
      <Hero />
      <BestsellersSection />
      {/* Beneficiile (Livrare rapidă, Plată sigură etc.) stau după bestsellers. */}
      <Benefits />
      <CategoriesSection />
      <BlogHighlights />
      <NewsletterForm />
    </>
  );
}
