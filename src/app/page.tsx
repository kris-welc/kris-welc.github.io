import { Hero } from "@/components/hero";
import { ContactSection } from "@/components/contact-section";
import { ArticlesSection } from "@/components/articles-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <ContactSection />
        <ArticlesSection />
      </main>
      <Footer />
    </>
  );
}
