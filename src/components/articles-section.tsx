"use client";

import { SectionLabel } from "@/components/section-label";
import { ArticleCard } from "@/components/article-card";
import { ARTICLES } from "@/lib/data";
import { useArticleStats } from "@/hooks/use-article-stats";

export function ArticlesSection() {
  const { getStats } = useArticleStats();

  return (
    <section id="articles" className="relative px-6 pt-16 pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <SectionLabel code="SEC_01" label="FIELD NOTES" />
          <h2 className="gradient-bone font-display text-3xl font-bold tracking-wide md:text-4xl">
            Dispatches
          </h2>
          <p className="mt-3 max-w-2xl text-waste-sand">
            Expand any piece for the full breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ARTICLES.filter((article) => article.slug).map((article) => {
            const slug = article.slug!;
            const articleStats = getStats(slug);
            return (
              <ArticleCard
                key={article.id}
                article={article}
                views={articleStats.views}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
