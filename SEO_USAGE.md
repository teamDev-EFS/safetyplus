# SEO Component Usage Guide

## Basic Usage

```tsx
import { SEO } from "../components/SEO";

export function MyPage() {
  return (
    <Layout>
      <SEO
        title="Page Title"
        description="Page description for SEO"
        image="/path/to/og-image.jpg"
      />
      {/* Page content */}
    </Layout>
  );
}
```

## With JSON-LD

### Organization & Website (Homepage)

```tsx
import { SEO, organizationJSONLD, websiteJSONLD } from "../components/SEO";

<SEO
  title="Home"
  description="..."
  jsonLd={[organizationJSONLD(), websiteJSONLD()]}
/>;
```

### Product Page

```tsx
import { SEO, productJSONLD, breadcrumbJSONLD } from "../components/SEO";

<SEO
  title={product.name}
  description={product.description}
  image={product.image}
  type="product"
  url={`/product/${product.slug}`}
  jsonLd={[
    productJSONLD({
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      currency: "INR",
      sku: product.sku,
      url: `/product/${product.slug}`,
      brand: "SafetyPlus",
    }),
    breadcrumbJSONLD([
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: product.name, url: `/product/${product.slug}` },
    ]),
  ]}
/>;
```

### Blog Post

```tsx
<SEO
  title={post.title}
  description={post.excerpt}
  image={post.image}
  type="article"
  url={`/blog/${post.slug}`}
  jsonLd={[
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.image,
      datePublished: post.publishedAt,
      author: {
        "@type": "Organization",
        name: "SafetyPlus",
      },
    },
  ]}
/>
```

### Team Member

```tsx
import { SEO, personJSONLD } from "../components/SEO";

<SEO
  title={`${member.name} - ${member.role}`}
  description={member.bio}
  image={member.photo}
  type="profile"
  jsonLd={[
    personJSONLD({
      name: member.name,
      jobTitle: member.role,
      image: member.photo,
      email: member.email,
    }),
  ]}
/>;
```

## Props Reference

| Prop          | Type                                               | Default             | Description                        |
| ------------- | -------------------------------------------------- | ------------------- | ---------------------------------- |
| `title`       | `string?`                                          | Default title       | Page title (will append site name) |
| `description` | `string?`                                          | Default description | Meta description                   |
| `image`       | `string?`                                          | `/og-image.jpg`     | OG/Twitter image (1200×630)        |
| `type`        | `"website" \| "article" \| "product" \| "profile"` | `"website"`         | Open Graph type                    |
| `url`         | `string?`                                          | Current URL         | Canonical URL                      |
| `siteName`    | `string?`                                          | `"SafetyPlus"`      | OG site name                       |
| `jsonLd`      | `object \| object[]?`                              | -                   | JSON-LD schema(s)                  |
| `noindex`     | `boolean?`                                         | `false`             | Set `noindex,nofollow`             |
| `canonical`   | `string?`                                          | Current URL         | Custom canonical URL               |

## Helper Functions

### `organizationJSONLD(name?, url?, logo?, contactPoint?)`

Returns Organization schema with contact info.

### `websiteJSONLD(url?)`

Returns WebSite schema with SearchAction.

### `productJSONLD(product)`

Returns Product schema with offers.

### `breadcrumbJSONLD(items)`

Returns BreadcrumbList schema.

### `personJSONLD(person)`

Returns Person schema.

## Notes

- Images should be absolute URLs or relative to public folder
- Keep descriptions under 160 characters
- OG images should be 1200×630px
- JSON-LD is automatically stringified and injected
- Canonical URLs are automatically generated from current route
