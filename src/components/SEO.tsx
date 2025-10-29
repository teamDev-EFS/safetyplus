import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product" | "profile";
  url?: string;
  siteName?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
  canonical?: string;
}

const DEFAULT_TITLE = "SafetyPlus - India's Leading Safety Equipment Supplier";
const DEFAULT_DESCRIPTION =
  "Premier safety equipment supplier with 1,300+ partners, 250+ professionals, and 10+ years of trusted delivery across India. Certified PPE, fire safety, and industrial safety solutions.";
const DEFAULT_IMAGE = "/og-image.jpg"; // 1200×630
const SITE_NAME = "SafetyPlus";

export function SEO({
  title,
  description,
  image,
  type = "website",
  url,
  siteName = SITE_NAME,
  jsonLd,
  noindex = false,
  canonical,
}: SEOProps) {
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_PUBLIC_URL || "https://safetyplus.co.in";
  const fullUrl = url || `${baseUrl}${location.pathname}`;
  const fullImage =
    image?.startsWith("http") || image?.startsWith("/")
      ? image
      : image
      ? `${baseUrl}${image}`
      : `${baseUrl}${DEFAULT_IMAGE}`;
  const finalTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, attribute = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const updateProperty = (property: string, content: string) => {
      updateMeta(property, content, "property");
    };

    // Basic meta
    updateMeta("description", finalDescription);
    updateMeta("robots", noindex ? "noindex,nofollow" : "index,follow");

    // Open Graph
    updateProperty("og:title", finalTitle);
    updateProperty("og:description", finalDescription);
    updateProperty("og:image", fullImage);
    updateProperty("og:type", type);
    updateProperty("og:url", fullUrl);
    updateProperty("og:site_name", siteName);

    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", finalTitle);
    updateMeta("twitter:description", finalDescription);
    updateMeta("twitter:image", fullImage);

    // Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonical || fullUrl);

    // JSON-LD
    const existingScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    if (jsonLd) {
      const scripts = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      scripts.forEach((ld) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(ld);
        document.head.appendChild(script);
      });
    }
  }, [
    finalTitle,
    finalDescription,
    fullImage,
    type,
    fullUrl,
    siteName,
    jsonLd,
    noindex,
    canonical,
  ]);

  return null;
}

// Helper functions for common JSON-LD schemas

export function organizationJSONLD(
  name: string = SITE_NAME,
  url: string = "https://safetyplus.co.in",
  logo: string = "https://safetyplus.co.in/logo.png",
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
    sameAs: [
      // Add social media links here
    ],
    ...(contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: contactPoint.telephone || "+91-9424836076",
        email: contactPoint.email || "marketing@safetyplus.co.in",
        contactType: contactPoint.contactType || "Customer Service",
      },
    }),
  };
}

export function websiteJSONLD(url: string = "https://safetyplus.co.in") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJSONLD(product: {
  name: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  sku?: string;
  url: string;
  brand?: string;
}) {
  const baseUrl = import.meta.env.VITE_PUBLIC_URL || "https://safetyplus.co.in";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: product.image
      ? product.image.startsWith("http")
        ? product.image
        : `${baseUrl}${product.image}`
      : undefined,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || SITE_NAME,
    },
    offers: product.price
      ? {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency || "INR",
          availability: "https://schema.org/InStock",
          url: product.url,
        }
      : undefined,
    url: product.url,
  };
}

export function breadcrumbJSONLD(items: Array<{ name: string; url: string }>) {
  const baseUrl = import.meta.env.VITE_PUBLIC_URL || "https://safetyplus.co.in";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export function personJSONLD(person: {
  name: string;
  jobTitle?: string;
  image?: string;
  url?: string;
  email?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    image: person.image,
    url: person.url,
    email: person.email,
    sameAs: person.sameAs || [],
  };
}
