import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import {
  Award,
  Factory,
  Globe2,
  Handshake,
  ShieldCheck,
  Users2,
  FlameKindling,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600" />
        <div className="container relative mx-auto px-4 py-20 text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold">
            About SafetyPlus
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl">
            From Industrial Trading Corporation (est. 1985) to Safety Plus
            Protection Pvt. Ltd., our mission is simple: enable safe, productive
            workplaces through world-class PPE & firefighting solutions.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Our Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              Starting in 1985 as ITC, we have grown into a nationwide provider
              of PPE and firefighting solutions. Rebranded as Safety Plus
              Protection Pvt. Ltd., our teams are driven to solve customer
              safety challenges with compliant, reliable products and responsive
              service.
            </p>
            <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Life
                member, National Safety Council.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Regular
                presence at global safety expos (Germany, UAE, Malaysia, China).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Client
                workshops & on-site trainings.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Industries We Serve
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              General Industry, Oil & Gas, Atomic Energy, Transportation,
              Hospitals, Railways, Aerospace, Construction, Highways, Defense,
              Security, Mining, Telecom, Hospitality, Residential and
              more—across India.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: Factory, label: "Manufacturing" },
                { icon: FlameKindling, label: "Fire Safety" },
                { icon: Globe2, label: "Govt. & PSU" },
                { icon: Users2, label: "Healthcare" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-950 p-3"
                >
                  <s.icon className="w-5 h-5 text-emerald-700" />
                  <span className="text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats + Values */}
      <section className="py-10 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-6">
          {[
            { k: "1985", v: "Founded as ITC" },
            { k: "10+ yrs", v: "SafetyPlus legacy" },
            { k: "Nationwide", v: "Delivery & support" },
            { k: "Top Brands", v: "Trusted portfolio" },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center"
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

        <div className="container mx-auto px-4 mt-8 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              t: "Compliance First",
              d: "EN / ANSI / ISI aligned product lines.",
            },
            {
              icon: Award,
              t: "Quality Assured",
              d: "Manufacture & import from vetted suppliers.",
            },
            {
              icon: Handshake,
              t: "Service Excellence",
              d: "Workshops, AMC, and responsive support.",
            },
          ].map((b) => (
            <div
              key={b.t}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
            >
              <div className="flex items-center gap-3">
                <b.icon className="w-6 h-6 text-emerald-700" />
                <div className="font-semibold text-gray-900 dark:text-white">
                  {b.t}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clients / CTA */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-wide text-gray-500">
            Trusted By
          </p>
          <h3 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900 dark:text-white">
            Leading enterprises across India
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Our portfolio has served marquee names like BHEL, CAT, Eicher,
            Bridgestone, L&amp;T Group, Aditya Birla, Tata Group, Ranbaxy and
            more.
          </p>
          <div className="mt-8">
            <Link to="/contact">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
