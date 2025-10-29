import { useEffect, useState } from "react";

interface PartnerLogosProps {
  className?: string;
}

export function PartnerLogos({ className = "" }: PartnerLogosProps) {
  const [logos, setLogos] = useState<string[]>([]);

  useEffect(() => {
    // List of partner logos from the public/partners directory
    const partnerLogos = [
      "/partners/3MIndiaLogo.svg",
      "/partners/Abrigo-logo.png",
      "/partners/AcmeUniversal_logo.png",
      "/partners/AGARSON-LOGO.png",
      "/partners/Dands-Safety-Logo.gif",
      "/partners/HillSon-home-logo.webp",
      "/partners/kanex-fire-solutions-limited-logo.png",
      "/partners/karam-logo-.png",
      "/partners/mallcom-Logo.avif",
      "/partners/VENUS-LOGO.jpg",
    ];
    setLogos(partnerLogos);
  }, []);

  return (
    <>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className={`bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 md:py-16 ${className}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Authorized Partners
            </h3>
            <div className="w-20 h-1 bg-emerald-500/80 mx-auto rounded-full"></div>
          </div>

          <div className="relative overflow-hidden py-4">
            <div className="flex space-x-6 md:space-x-10 animate-scroll">
              {/* First set of logos */}
              {logos.map((logo, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 flex items-center justify-center h-32 w-56 md:h-36 md:w-64 bg-white/95 dark:bg-white rounded-xl shadow-md ring-1 ring-gray-200/60 dark:ring-gray-700/50 p-5 md:p-6 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <img
                    src={logo}
                    alt={`Partner ${index + 1}`}
                    className="max-h-full max-w-full object-contain w-full h-full brightness-100 dark:brightness-100"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {logos.map((logo, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 flex items-center justify-center h-32 w-56 md:h-36 md:w-64 bg-white/95 dark:bg-white rounded-xl shadow-md ring-1 ring-gray-200/60 dark:ring-gray-700/50 p-5 md:p-6 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <img
                    src={logo}
                    alt={`Partner ${index + 1}`}
                    className="max-h-full max-w-full object-contain w-full h-full brightness-100 dark:brightness-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
