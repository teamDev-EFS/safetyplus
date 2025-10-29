import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";

export function BlogDetailPage() {
  const { slug } = useParams();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Blog Post: {slug}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Blog detail page content coming soon...
        </p>
      </div>
    </Layout>
  );
}
