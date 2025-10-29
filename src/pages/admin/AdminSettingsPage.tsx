// src/pages/admin/AdminSettingsPage.tsx
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsAPI } from "../../lib/apiAdmin";
import ImageDropzone from "../../components/admin/ImageDropZone";
import { Button } from "../../components/ui/Button";

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsAPI.get,
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => setFiles([]), [data?._id]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (files[0]) fd.append("hero", files[0]);
    await settingsAPI.update(fd);
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Company Name</label>
            <input
              name="companyName"
              defaultValue={data?.companyName || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Support Email</label>
            <input
              name="supportEmail"
              type="email"
              defaultValue={data?.supportEmail || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Support Phone</label>
            <input
              name="supportPhone"
              defaultValue={data?.supportPhone || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">GST No</label>
            <input
              name="gstNo"
              defaultValue={data?.gstNo || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Address Lines (one per line)
            </label>
            <textarea
              name="addressLines"
              rows={3}
              defaultValue={(data?.addressLines || []).join("\n")}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">LinkedIn</label>
            <input
              name="socials.linkedin"
              defaultValue={data?.socials?.linkedin || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Homepage Hero Banner</label>
          <ImageDropzone
            onFiles={setFiles}
            max={1}
            existing={
              data?.heroBannerPath ? [{ url: data.heroBannerPath }] : []
            }
          />
        </div>

        <div className="flex justify-end">
          <Button className="bg-emerald-600 hover:bg-emerald-700" type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
