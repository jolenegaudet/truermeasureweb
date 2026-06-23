import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2
        className="font-heading mt-12 mb-5 font-medium text-bark"
        style={{ fontSize: "clamp(28px,3.5vw,38px)", lineHeight: 1.15 }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-heading mt-8 mb-3 text-[22px] font-medium text-bark">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-5 text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mb-5 space-y-2 pl-5 text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-5 space-y-2 pl-5 list-decimal text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="list-disc">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-bark">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="font-heading italic text-bark not-italic" style={{ fontStyle: "italic" }}>
        {children}
      </em>
    ),
    a: ({ href, children }) => (
      <Link
        href={href ?? "#"}
        className="text-rose underline underline-offset-2 hover:text-bark transition-colors"
      >
        {children}
      </Link>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-rose pl-5 font-heading italic text-dusk" style={{ fontSize: "clamp(20px,2.5vw,26px)", lineHeight: 1.45 }}>
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-12 border-border" />,
    ...components,
  };
}
