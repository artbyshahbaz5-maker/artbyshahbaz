"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import type { GalleryItem } from "@/types";

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/gallery").then((r) => r.json());
    setGallery(res.gallery || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "gallery");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (res.success) setImageUrl(res.url);
    setUploading(false);
  }

  async function handleAdd() {
    if (!imageUrl) return;
    setSaving(true);
    await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, title }),
    });
    setSaving(false);
    setOpen(false);
    setImageUrl("");
    setTitle("");
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this gallery photo?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Gallery</h1>
          <p className="text-neutral-400 text-sm mt-1">{gallery.length} photos</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          <Plus className="h-4 w-4" /> Add Photo
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 py-10">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading gallery...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden border border-neutral-800">
              <div className="relative aspect-square">
                <Image src={item.image_url} alt={item.title || "Gallery"} fill className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} className="gap-1.5 text-xs">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
              {item.title && (
                <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1.5">
                  <p className="text-white text-xs truncate">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-white">Add Gallery Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            {imageUrl && (
              <div className="relative h-48 rounded-xl overflow-hidden border border-neutral-700">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
            <div>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} className="hidden" />
              <Button type="button" variant="adminSecondary" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Choose & Upload Photo"}
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-neutral-300">Caption (optional)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bridal Lehenga – 2024" className="bg-neutral-800 border-neutral-700 text-white" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAdd} disabled={saving || !imageUrl} className="flex-1 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Add to Gallery
              </Button>
              <Button variant="adminSecondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
