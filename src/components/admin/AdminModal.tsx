// src/components/admin/AdminModal.tsx
import { ReactNode } from "react";

export default function AdminModal({
  open,
  title,
  children,
  onClose,
  width = "max-w-2xl",
}: {
  open: boolean;
  title: string | ReactNode;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${width} rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
