import { Layout } from "../components/layout/Layout";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";

export function AccountPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          My Account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-xl mb-4">Profile Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Name
                </dt>
                <dd className="font-medium">{user?.name || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </dt>
                <dd className="font-medium">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Phone
                </dt>
                <dd className="font-medium">{user?.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Role
                </dt>
                <dd className="font-medium capitalize">
                  {user?.role || "Customer"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}
