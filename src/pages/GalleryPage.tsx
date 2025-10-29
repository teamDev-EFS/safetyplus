import { Layout } from "../components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { albumsAPI } from "../lib/api";
import { getImageUrl } from "../lib/utils"; // ← use the fixed helper
import { Calendar, Tag, Images } from "lucide-react";
import { Link } from "react-router-dom";

export function GalleryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["albums"],
    queryFn: () => albumsAPI.getAll(),
    staleTime: 60_000,
  });

  const albums = (data?.albums || []).filter((a: any) => a?.isActive !== false);

  // ...loading & error UI unchanged...

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* header ... */}

        {albums.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album: any) => {
              const cover = album.coverPath ? getImageUrl(album.coverPath) : "";
              const imgCount = album.images?.length || 0;
              return (
                <article
                  key={album._id}
                  className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        crossOrigin="anonymous"
                        alt={album.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-gray-400">
                        <Images className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  {/* info block ... unchanged */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {album.title}
                    </h3>

                    {album.eventDate && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(album.eventDate).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {Array.isArray(album.tags) && album.tags.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-3">
                        <Tag className="w-4 h-4 shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {album.tags
                            .slice(0, 3)
                            .map((t: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800"
                              >
                                {t}
                              </span>
                            ))}
                          {album.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{album.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {imgCount} images
                      </span>
                      <Link
                        to="#"
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                        onClick={(e) => e.preventDefault()}
                      >
                        View Album →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
