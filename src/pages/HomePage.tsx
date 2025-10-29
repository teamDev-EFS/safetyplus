// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO, organizationJSONLD, websiteJSONLD } from "../components/SEO";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Award,
  Headset,
  CheckCircle2,
  Boxes,
  Building2,
  Wrench,
  RefreshCw,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Carousel } from "../components/ui/Carousel";
import { PartnerLogos } from "../components/ui/PartnerLogos";
import { ProductRail } from "../components/ui/ProductRail";

import { productsAPI } from "../lib/api";
import { formatCurrency, getImageUrl } from "../lib/utils";

/* ---------- helpers ---------- */
function price(v?: number) {
  const n = Number.isFinite(v) ? Number(v) : 0;
  return formatCurrency(n);
}

/* ---------- hero slides (6s) ---------- */
const heroSlides = [
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1564236659931-a05602303f8e?auto=format&fit=crop&w=2070&q=80",
];

/* ---------- services content ---------- */
const servicePills = [
  { icon: ClipboardList, title: "PPE Inspection & Revalidation", desc: "" },
  { icon: RefreshCw, title: "Service & Repair of Fall Arrestors", desc: "" },
  { icon: ShieldCheck, title: "Fixed Line System Revalidation", desc: "" },
];

// You can use absolute URLs or relative backend paths like "/gallery/albums/xxxxx.jpeg".
// getImageUrl() will handle both and prefix /uploads + base URL for local files.
const serviceSlides = [
  {
    img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80",
    title: "Servicing of Retractable Fall Arrestor Blocks",
    body: "Our team inspects and services SRLs on a regular schedule, enhancing trust, uptime, and lifespan while ensuring uncompromised worker safety.",
  },
  {
    img: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1600&q=80",
    title: "Inspection & Revalidation of PPE",
    body: "From harnesses to lanyards, each unit is evaluated, tested, and documented against EN/ANSI/ISI standards for audit-ready compliance.",
  },
  {
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1600&q=80",
    title: "Fixed Line Systems (FLS) Maintenance",
    body: "Comprehensive line health checks, repairs, and revalidation to keep your permanent systems certified and incident-ready.",
  },
];

/* ---------- page ---------- */
export function HomePage() {
  const { data } = useQuery({
    queryKey: ["elite-products"],
    queryFn: () => productsAPI.getAll({ limit: 12 }),
  });

  const products = useMemo(
    () => (data?.items ?? data?.products ?? []) as any[],
    [data]
  );

  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % serviceSlides.length);
  const prev = () =>
    setIdx((i) => (i - 1 + serviceSlides.length) % serviceSlides.length);
  const slide = serviceSlides[idx];

  return (
    <Layout>
      <SEO
        title="Home"
        description="India's largest safety equipment supplier with 1,322+ partner suppliers and 250+ dedicated professionals. Shop certified PPE, fire safety, and industrial safety solutions."
        jsonLd={[organizationJSONLD(), websiteJSONLD()]}
      />
      {/* ========================== HERO ========================== */}
      <section className="relative isolate h-[72vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Carousel
            images={heroSlides}
            autoPlay
            interval={6000}
            showIndicators
            showArrows
            className="h-full"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-emerald-700/60" />
        <div
          className="pointer-events-none absolute inset-0 z-20 opacity-[0.12]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(#fff 1px,transparent 1px), radial-gradient(#fff 1px,transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0,12px 12px",
          }}
        />

        <div className="relative z-30 h-full container mx-auto px-4">
          <div className="h-full grid place-items-center text-center text-white">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/25 text-sm font-medium mb-6">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Trusted by 12,500+ Customers Nationwide
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight drop-shadow-2xl mb-6">
                YOUR SAFETY,
                <br className="hidden md:block" />
                OUR PRIORITY
              </h1>

              <p className="text-xl md:text-2xl text-white/95 drop-shadow-xl max-w-3xl mx-auto mb-10">
                India’s largest safety equipment supplier with 1,322+ partner
                suppliers and 250+ dedicated professionals.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/shop">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-700 hover:bg-gray-100 font-extrabold px-8 py-6 text-lg shadow-2xl hover:shadow-3xl transform hover:scale-[1.03] transition-all"
                  >
                    Shop Now <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/15 backdrop-blur px-8 py-6 text-lg font-semibold"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
                {[
                  { Icon: ShieldCheck, label: "Certified PPE" },
                  { Icon: Truck, label: "Nationwide Delivery" },
                  { Icon: Award, label: "Trusted Brand" },
                  { Icon: Headset, label: "24/7 Support" },
                ].map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/12 ring-1 ring-white/20 px-3 py-3 backdrop-blur-md flex items-center justify-center gap-2"
                  >
                    <div className="rounded-lg bg-emerald-500/25 p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== PARTNER LOGOS ===================== */}
      <PartnerLogos />

      {/* ======================= CREDIBILITY ====================== */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { k: "30+", v: "Years Expertise" },
            { k: "12.5k+", v: "Happy Customers" },
            { k: "3k+", v: "SKU Coverage" },
            { k: "24/7", v: "Customer Care" },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-800 px-6 py-5 text-center"
            >
              <div className="text-2xl font-extrabold text-emerald-700">
                {s.k}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================== PRODUCT RAIL ====================== */}
      <section className="container mx-auto px-4 pt-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Elite Products</h2>
            <p className="text-sm text-gray-500">
              Handpicked premium safety equipment across categories.
            </p>
          </div>
          <Link to="/shop">
            <Button size="sm" variant="outline" className="text-emerald-700">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <ProductRail
            products={products.map((p: any) => ({
              id: p._id ?? p.id,
              name: p.name,
              category:
                typeof p.categoryId === "string"
                  ? undefined
                  : p.categoryId?.name || "",
              price: price(p.priceSell),
              mrp: p.priceMrp ? price(p.priceMrp) : undefined,
              image: getImageUrl(
                p.images?.[0]?.path || "/placeholder-product.png"
              ),
              to: `/product/${p.slug ?? p._id}`,
            }))}
            emptyText="No products available yet."
          />
        ) : (
          <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200/60 dark:ring-gray-800 p-10 text-center text-gray-500">
            No products available yet.
          </div>
        )}
      </section>

      {/* ======================= OUR SERVICES ===================== */}
      <section className="container mx-auto px-4 pt-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">
              Overview
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              After-sales service covers warranty, training, inspection and
              repair delivered after purchase. Life-saving equipment must be
              inspected annually and re-certified by competent personnel. This
              builds user confidence and ensures devices work correctly and keep
              teams safe.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {servicePills.map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="rounded-xl ring-1 ring-gray-200/70 dark:ring-gray-800 p-4 bg-white dark:bg-gray-900 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center ring-1 ring-emerald-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium">{title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden ring-1 ring-gray-200/70 dark:ring-gray-800 aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80"
              alt="After-sales overview"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      </section>

      {/* Service spotlight slider (image left, copy right) */}
      <section className="mt-10 bg-gray-50 dark:bg-gray-900/40">
        <div className="container mx-auto px-4 py-14">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-extrabold">
              Our Services
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Elevating customer satisfaction through exceptional after-sales
              support
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Service image carousel */}
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-gray-200/70 dark:ring-gray-800 aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700">
              <img
                key={idx}
                src={slide.img}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10"
                loading="eager"
                decoding="async"
                onLoad={(e) => {
                  // Ensure image is visible on load
                  (e.currentTarget as HTMLImageElement).style.opacity = "1";
                }}
                onError={(e) => {
                  // Show fallback text if image fails
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                  const parent = img.parentElement;
                  if (parent && !parent.querySelector(".fallback-text")) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "fallback-text absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 z-20";
                    fallback.textContent = slide.title;
                    parent.appendChild(fallback);
                  }
                }}
              />
              {/* nav buttons */}
              <div className="absolute inset-y-0 left-0 flex items-center p-2">
                <button
                  onClick={prev}
                  className="rounded-full bg-white/90 hover:bg-white p-2 shadow"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center p-2">
                <button
                  onClick={next}
                  className="rounded-full bg-white/90 hover:bg-white p-2 shadow"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs font-semibold mb-3">
                <Wrench className="h-3.5 w-3.5" /> After-Sales & AMC
              </div>
              <h4 className="text-2xl md:text-3xl font-bold mb-3">
                {slide.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{slide.body}</p>

              <ul className="mt-6 grid sm:grid-cols-3 gap-3">
                {[
                  { Icon: ClipboardList, t: "Certified Checks" },
                  { Icon: RefreshCw, t: "Faster Turnaround" },
                  { Icon: ShieldCheck, t: "Audit-Ready Docs" },
                ].map(({ Icon, t }) => (
                  <li
                    key={t}
                    className="rounded-xl bg-white dark:bg-gray-900 ring-1 ring-gray-200/70 dark:ring-gray-800 px-4 py-3 flex items-center gap-2 text-sm"
                  >
                    <div className="h-8 w-8 grid place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== VALUE PROPS ====================== */}
      <section className="container mx-auto px-4 pt-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Compliant & Certified",
              desc: "Global standards – EN, ANSI, ISI across product lines.",
              icon: CheckCircle2,
            },
            {
              title: "Project Fulfilment",
              desc: "B2B bulk fulfilment with committed SLAs and support.",
              icon: Boxes,
            },
            {
              title: "After-Sales & AMC",
              desc: "Training, workshops and preventive service options.",
              icon: Building2,
            },
          ].map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200/60 dark:ring-gray-800 p-5 flex gap-4 items-start"
            >
              <div className="rounded-xl bg-emerald-600/10 text-emerald-700 p-3">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= BIG CTA ======================== */}
      <section className="mt-14 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-14 text-center text-white">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/20 ring-1 ring-emerald-500/30 mb-4">
            <Building2 className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">
            Ready to Secure Your Workforce?
          </h3>
          <p className="mt-2 text-white/80">
            Get tailored recommendations for PPE kits, fire safety and
            compliance for your site.
          </p>
          <div className="mt-6 flex items-center gap-3 justify-center">
            <Link to="/contact">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Talk to an Expert
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="border-white/40 text-white">
                Browse Catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
