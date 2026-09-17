import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleLayout } from "@/components/article-layout";
import { ViewTracker } from "@/components/view-tracker";
import { ARTICLES } from "@/lib/data";
import { ControlHierarchyContent } from "@/lib/articles/control-hierarchy";
import { AgentAlgebraContent } from "@/lib/articles/agent-algebra";
import { DualLayerRegimeContent } from "@/lib/articles/dual-layer-regime";
import { VpinConvictionContent } from "@/lib/articles/vpin-conviction";
import { ProductionAgentsContent } from "@/lib/articles/production-agents";
import { AstraFieldTestContent } from "@/lib/articles/astra-field-test";
import { MemoryThreeJobsContent } from "@/lib/articles/memory-three-jobs";

const CONTENT_MAP: Record<string, React.ComponentType> = {
  "memory-three-jobs": MemoryThreeJobsContent,
  "astra-field-test": AstraFieldTestContent,
  "production-agents": ProductionAgentsContent,
  "control-hierarchy": ControlHierarchyContent,
  "agent-algebra": AgentAlgebraContent,
  "dual-layer-regime": DualLayerRegimeContent,
  "vpin-conviction": VpinConvictionContent,
};

interface PageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.filter((a) => a.slug).map((a) => ({ slug: a.slug! }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: "Not Found" };

  return {
    title: article.title,
    description: article.hook,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.hook,
      url: `/articles/${slug}`,
      publishedTime: article.date,
      authors: ["Kris Welc"],
      tags: [...article.tags],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.hook,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  const Content = CONTENT_MAP[slug];

  if (!article || !Content) {
    notFound();
  }

  return (
    <ArticleLayout article={article}>
      <ViewTracker slug={slug} />
      <Content />
    </ArticleLayout>
  );
}
