import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <SEOElements />
        <link rel="icon" href="/onetech-logo.png" />
        <link rel="apple-touch-icon" href="/onetech-logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
