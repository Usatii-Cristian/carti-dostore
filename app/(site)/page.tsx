import { Hero } from "@/components/home/Hero";
import { Benefits } from "@/components/home/Benefits";
import { BestsellersSection } from "@/components/home/BestsellersSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { PromoBanners } from "@/components/home/PromoBanners";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <BestsellersSection />
      <CategoriesSection />
      <PromoBanners />
      <NewsletterForm />
    </>
  );
}
