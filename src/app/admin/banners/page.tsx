"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, Loader2, Pencil } from "lucide-react";
import type { Banner } from "@/types";

const EMPTY = {
  title: "",
  subtitle: "",
  image_url: "",
  button_text: "Explore Collection",
  button_link: "/products",
  is_active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = editingId !== null;

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/banners").then((r) => r.json());
    if (!res.success) alert(res.message || "Failed to load banners.");
    setBanners(res.banners || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      image_url: b.image_url || "",
      button_text: b.button_text || "Explore Collection",
      button_link: b.button_link || "/products",
      is_active: b.is_active ?? true,
    });
    setOpen(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file); fd.append("folder", "banners");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (res.success) setForm((p) => ({ ...p, image_url: res.url }));
    else alert(res.message || "Upload failed.");
    setUploading(false);
  }

  async function handleSave() {
    if (!form.image_url) return;
    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/banners/${editingId}` : "/api/admin/banners",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      ).then((r) => r.json());
      if (!res.success) {
        alert(res.message || "Failed to save banner.");
        return;
      }
      setOpen(false);
      setEditingId(null);
      setForm(EMPTY);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(b: Banner) {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !(b.is_active ?? true) }),
    }).then((r) => r.json());
    if (!res.success) alert(res.message || "Failed to update banner.");
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (!res.success) alert(res.message || "Failed to delete banner.");
    load();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Banners</h1>
          <p className="text-neutral-400 text-sm mt-1">Homepage hero banners & slides</p>
        </div>
        <Button onClick={openAdd} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      <p className="text-neutral-500 text-xs mb-4">
        The homepage hero uses the first <span className="text-neutral-300">active</span> banner.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 py-10"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.length === 0 && <p className="text-neutral-500 text-sm py-6 col-span-full">No banners yet.</p>}
          {banners.map((b) => (
            <div key={b.id} className="relative rounded-xl overflow-hidden border border-neutral-800 group">
              <div className="relative aspect-[16/9]">
                {b.image_url ? <Image src={b.image_url} alt={b.title || "Banner"} fill className="object-cover" /> : <div className="bg-neutral-800 w-full h-full" />}
                <div className="absolute top-2 left-2">
                  <Badge variant={b.is_active ?? true ? "gold" : "secondary"} className="text-[10px]">
                    {b.is_active ?? true ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-neutral-900">
                <p className="text-white text-sm font-medium truncate">{b.title || "(No title)"}</p>
                <p className="text-neutral-400 text-xs truncate">{b.subtitle}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="adminSecondary" onClick={() => openEdit(b)} className="flex-1 text-xs gap-1.5">
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="adminSecondary" onClick={() => toggleActive(b)} className="text-xs">
                    {b.is_active ?? true ? "Hide" : "Show"}
                  </Button>
                  <Button size="sm" variant="adminSecondary" onClick={() => handleDelete(b.id)} className="border-red-800/60 text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-neutral-900 border-neutral-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-white">{isEdit ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {form.image_url && <div className="relative h-40 rounded-xl overflow-hidden border border-neutral-700"><Image src={form.image_url} alt="Preview" fill className="object-cover" /></div>}
            <div>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} className="hidden" />
              <Button type="button" variant="adminSecondary" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? "Uploading..." : form.image_url ? "Replace Image" : "Upload Banner Image"}
              </Button>
            </div>
            {([["Title", "title", "e.g. New Collection 2025"], ["Subtitle", "subtitle", "Luxury Bridal Couture"], ["Button Text", "button_text", "Explore Collection"], ["Button Link", "button_link", "/products"]] as const).map(([label, key, ph]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-neutral-300">{label}</Label>
                <Input value={(form as any)[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded accent-gold-500" />
              <span className="text-sm text-neutral-300">Active (eligible to be shown as the hero)</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.image_url} className="flex-1 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} {isEdit ? "Save Changes" : "Add Banner"}
              </Button>
              <Button variant="adminSecondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
