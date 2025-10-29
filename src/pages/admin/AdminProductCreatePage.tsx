import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { productsAPI, categoriesAPI } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import { CategoryDialog } from "../../components/admin/CategoryDialog";
import { Plus } from "lucide-react";

type Category = { _id: string; name: string; slug?: string };

export function AdminProductCreatePage() {
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const browseRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
  const MAX_FILES = 8;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file

  // Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoriesAPI.getAll(),
    staleTime: 60_000,
  });
  const categories: Category[] = useMemo(
    () =>
      Array.isArray(categoriesData)
        ? categoriesData
        : (categoriesData?.items as Category[]) || [],
    [categoriesData]
  );

  const handleCategoryCreated = (newCategory: Category) => {
    // Invalidate and refetch categories
    queryClient.invalidateQueries({ queryKey: ["categories-all"] });

    toast({
      title: "Category created",
      description: `${newCategory.name} has been added successfully.`,
    });
  };

  // Build previews + revoke on change/unmount
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => {
      if (!accept.split(",").includes(f.type)) return false;
      if (f.size > MAX_SIZE) {
        toast({
          title: "File too large",
          description: `${f.name} exceeds 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    const next = [...files, ...valid].slice(0, MAX_FILES);
    setFiles(next);
    setTotalSize(next.reduce((s, f) => s + f.size, 0));
  };

  const removeFile = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    setTotalSize(next.reduce((s, f) => s + f.size, 0));
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    addFiles(list);
    dropRef.current?.classList.remove("ring-2", "ring-emerald-500");
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dropRef.current?.classList.add("ring-2", "ring-emerald-500");
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("ring-2", "ring-emerald-500");
  };

  // simple inline validation for prices
  const validateNumbers = (fd: FormData) => {
    const errors: Record<string, string> = {};
    const mrp = Number(fd.get("priceMrp") || 0);
    const sell = Number(fd.get("priceSell") || 0);
    if (!(mrp > 0)) errors.priceMrp = "MRP must be a positive number";
    if (!(sell > 0))
      errors.priceSell = "Selling Price must be a positive number";
    if (sell > mrp) errors.priceSell = "Selling Price cannot exceed MRP";
    if (!fd.get("categoryId")) errors.categoryId = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (!validateNumbers(fd)) return;

    files.forEach((f) => fd.append("images", f));
    setSaving(true);
    try {
      await productsAPI.adminCreate(fd);
      // Invalidate the admin products cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      // Invalidate public product queries to update shop and home pages
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      toast({
        title: "Product created",
        description: "Your product has been added.",
      });
      navigate("/admin/products");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const errorText = "mt-1 text-xs text-red-600";
  const fmtMB = (b: number) => `${(b / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Add Product
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
        Create a new safety item with pricing, inventory and images.
      </p>

      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 space-y-8 shadow-sm"
      >
        {/* Name + Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="e.g., Industrial Safety Helmet"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (HTML or plain text)
            </label>
            <textarea
              name="descriptionHtml"
              rows={7}
              placeholder="safety helmet for construction workers… (You may paste simple HTML lists)"
              className={inputClass + " min-h-[140px]"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Stored in <code>descriptionHtml</code>. Make sure the server
              sanitizes it before rendering.
            </p>
          </div>
        </div>

        {/* Category + SKU + Prices */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                name="categoryId"
                required
                className={inputClass + " flex-1"}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowCategoryDialog(true)}
                className="px-3 py-2"
                title="Add new category"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formErrors.categoryId && (
              <p className={errorText}>{formErrors.categoryId}</p>
            )}
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No categories found. Click the + button to create one.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              SKU (optional)
            </label>
            <input
              name="sku"
              placeholder="e.g., SP-HELM-001"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              MRP <span className="text-red-500">*</span>
            </label>
            <input
              name="priceMrp"
              type="number"
              step="0.01"
              min="0"
              required
              className={inputClass}
            />
            {formErrors.priceMrp && (
              <p className={errorText}>{formErrors.priceMrp}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Selling Price <span className="text-red-500">*</span>
            </label>
            <input
              name="priceSell"
              type="number"
              step="0.01"
              min="0"
              required
              className={inputClass}
            />
            {formErrors.priceSell && (
              <p className={errorText}>{formErrors.priceSell}</p>
            )}
          </div>
        </div>

        {/* Inventory + Flags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Stock Qty</label>
            <input
              name="stockQty"
              type="number"
              min="0"
              defaultValue={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Low Stock Threshold
            </label>
            <input
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={10}
              className={inputClass}
            />
          </div>
          <div className="flex items-end gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked />
              <span className="text-sm">Active</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="isFeatured" />
              <span className="text-sm">Featured</span>
            </label>
          </div>
        </div>

        {/* Images with thumbnails & remove */}
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <input
            ref={browseRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.currentTarget.files || []))}
          />
          <div
            ref={dropRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="w-full border-2 border-dashed rounded-xl px-4 py-10 text-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <div className="font-medium">
              Drag &amp; drop images here,&nbsp;
              <button
                type="button"
                onClick={() => browseRef.current?.click()}
                className="text-emerald-600 hover:underline"
              >
                or browse
              </button>
            </div>
            <div className="text-xs mt-1">
              First image becomes primary. Max {MAX_FILES} images, 5MB each.
            </div>
            <div className="text-xs mt-1">
              {files.length} selected • {fmtMB(totalSize)}
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <img
                    src={previews[i]}
                    alt={f.name}
                    className="h-28 w-full object-cover"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 rounded-full bg-white/90 hover:bg-white text-gray-700 text-xs px-2 py-1 shadow"
                    title="Remove"
                  >
                    ×
                  </button>
                  <div className="px-2 py-1 text-[11px] truncate text-gray-600 dark:text-gray-300">
                    {f.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Create Product"}
          </Button>
        </div>
      </form>

      {/* Category Creation Dialog */}
      <CategoryDialog
        isOpen={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
