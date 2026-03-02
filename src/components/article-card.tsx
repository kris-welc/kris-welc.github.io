"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WastelandBadge } from "@/components/wasteland-badge";
import { GitHubStarButton } from "@/components/github-star-button";
import type { Article } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  readonly article: Article;
}

export function ArticleCard({
  article,
}: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="panel-hover group border-waste-border bg-waste-panel transition-all duration-300">
      <CardHeader>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {article.tags.map((tag) => (
              <WastelandBadge
                key={tag}
                variant={article.accent}
                className="text-[0.55rem]"
              >
                {tag}
              </WastelandBadge>
            ))}
            <span className="font-mono text-[0.6rem] text-waste-ash">
              {article.readTime} / {article.topicCount} topics
            </span>
          </div>
          <CardTitle className="font-display text-xl tracking-wide text-waste-bone transition-colors group-hover:text-waste-amber">
            {article.slug ? (
              <Link href={`/articles/${article.slug}`} className="hover:underline">
                {article.title}
              </Link>
            ) : (
              article.title
            )}
          </CardTitle>
          {article.date && (
            <span className="font-mono text-[0.6rem] text-waste-ash">
              {new Date(article.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        {article.repoUrl && (
          <CardAction>
            <GitHubStarButton variant="compact" />
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-waste-sand">{article.hook}</p>

        {expanded && (
          <div className="space-y-3 border-t border-waste-border pt-4">
            {article.topics.map((topic, i) => (
              <div
                key={topic.title}
                className="rounded-md bg-waste-bg/50 px-4 py-3"
              >
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-mono text-[0.6rem] text-waste-ash">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-display text-sm font-semibold tracking-wide text-waste-bone">
                    {topic.title}
                  </h4>
                </div>
                <p className="pl-6 text-xs leading-relaxed text-waste-sand">
                  {topic.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            "font-mono text-xs tracking-wider text-waste-dim transition-colors hover:text-waste-amber",
            article.slug && !article.repoUrl ? "flex-1" : article.slug ? "" : "w-full"
          )}
        >
          {expanded
            ? "COLLAPSE"
            : `EXPAND ${article.topicCount} TOPICS`}
          <svg
            className={cn(
              "ml-2 h-3 w-3 transition-transform",
              expanded && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
        {article.repoUrl && (
          <a
            href={article.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs tracking-wider text-waste-bone transition-colors hover:text-waste-amber"
            >
              <svg className="mr-1.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              SOURCE
            </Button>
          </a>
        )}
        {article.slug && (
          <Link href={`/articles/${article.slug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs tracking-wider text-waste-amber transition-colors hover:text-waste-amber-light"
            >
              READ ARTICLE
              <svg
                className="ml-2 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
