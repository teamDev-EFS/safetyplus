import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import {
  Search,
  Grid3X3,
  List,
  FileText,
  Download,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "../lib/utils";

interface Document {
  id: string;
  name: string;
  category: string;
  description: string;
  filePath: string;
  fileSize: string;
  uploadDate: string;
  type: string;
}

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch documents from API
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["documents", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(
        `http://localhost:5000/api/documents?${params}`
      );
      const data = await response.json();
      return data.documents || [];
    },
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["document-categories"],
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:5000/api/documents/categories"
      );
      const data = await response.json();
      return data.categories || [];
    },
  });

  const documents = documentsData || [];
  const categories = categoriesData || [];

  const handleDownload = (doc: Document) => {
    // Create download link
    const link = document.createElement("a");
    link.href = `http://localhost:5000/api/documents/download/${doc.id}`;
    link.download = doc.name;
    link.click();
  };

  const formatFileSize = (size: string) => size;
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Safety Documents & Brochures
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Download comprehensive guides, brochures, and technical documents
            for all safety equipment categories.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategory === category
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {category === "all" ? "All Categories" : category}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {documents.length} document
            {documents.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Documents Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md animate-pulse"
              >
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-xl">
                      <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {document.type}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {document.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {document.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(document.uploadDate)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Size: {formatFileSize(document.fileSize)}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(document)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden">
              {documents.map((document, index) => (
                <div
                  key={document.id}
                  className={`p-6 border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index === 0 ? "rounded-t-2xl" : ""
                  } ${index === documents.length - 1 ? "rounded-b-2xl" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-xl">
                        <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {document.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {document.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {document.type}
                          </span>
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(document.uploadDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(document)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search criteria or filters."
                : "No documents are available at the moment."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
