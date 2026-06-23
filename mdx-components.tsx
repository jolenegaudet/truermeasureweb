import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="font-heading mt-12 mb-4 text-2xl font-bold text-bark">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-heading mt-8 mb-3 text-xl font-semibold text-bark">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-5 leading-relaxed text-ink/80">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mb-5 space-y-2 pl-5 list-disc text-ink/80">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-5 space-y-2 pl-5 list-decimal text-ink/80">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-bark">{children}</strong>
    ),
    a: ({ href, children }) => (
      <Link
        href={href ?? "#"}
        className="text-ember underline underline-offset-2 hover:text-bark transition-colors"
      >
        {children}
      </Link>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-ember pl-5 italic text-stone">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-bark/10" />,
    ...components,
  };
}
