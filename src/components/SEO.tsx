import type { ReactElement } from "react";
import Head from "next/head";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

// SEO elements that can be used in _document.tsx (returns JSX without Head wrapper)
export function SEOElements({
  title = "O.N.E.Tech AI Assistant - Capture & Convert More Leads Automatically",
  description = "AI-powered chat assistant that helps businesses capture, qualify, and convert website visitors into leads 24/7. Built by O.N.E.Tech Automation.",
  image = "/og-image.png",
  url = "https://onetechautomation.com",
}: SEOProps): ReactElement {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}

// SEO component for use in pages/_app.tsx or individual pages (uses next/head)
// Note: Flattened structure (no fragment) for better Next.js Head compatibility during hot reload
export function SEO({
  title = "O.N.E.Tech AI Assistant - Capture & Convert More Leads Automatically",
  description = "AI-powered chat assistant that helps businesses capture, qualify, and convert website visitors into leads 24/7. Built by O.N.E.Tech Automation.",
  image = "/og-image.png",
  url = "https://onetechautomation.com",
}: SEOProps): ReactElement {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
