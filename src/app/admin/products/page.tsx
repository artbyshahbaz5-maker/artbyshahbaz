"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, Loader2, Search } from "lucide-react";
import type { Product, Category } from "@/types";

const EMPTY: Partial<Product> = {
  name: "", description: "", price: "", image_url: "",
  category_id: "", is_featured: false, is_active: true, sort_order: 0,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const [pr, cr] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]);
    setProducts(pr.products || []);
    setCategories(cr.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(EMPTY); setIsEditMode(false); setOpen(true); }
  function openEdit(p: Product) { setEditing({ ...p }); setIsEditMode(true); setOpen(true); }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (res.success) setEditing((prev) => ({ ...prev, image_url: res.url }));
    setUploading(false);
  }

  async function handleSave() {
    if (!editing.name?.trim() || !editing.image_url) {
      alert("Please add a product name and an image before saving.");
      return;
    }
    setSaving(true);

    // Send only real, editable columns — the fetched row also carries a nested
    // `categories` object and read-only fields that Postgres rejects on update.
    const payload = {
      name: editing.name.trim(),
      description: editing.description ?? "",
      price: editing.price ?? "",
      image_url: editing.image_url,
      category_id: editing.category_id || null,
      gallery_urls: editing.gallery_urls ?? [],
      is_featured: editing.is_featured ?? false,
      is_active: editing.is_active ?? true,
      sort_order: editing.sort_order ?? 0,
    };

    const isEdit = isEditMode && !!editing.id;
    const url = isEdit ? `/api/admin/products/${editing.id}` : "/api/admin/products";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (!res?.success) {
        alert(res?.message || "Failed to save product.");
        return;
      }
      setOpen(false);
      load();
    } catch (err: any) {
      alert(err?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Products</h1>
          <p className="text-neutral-400 text-sm mt-1">{products.length} total outfits</p>
        </div>
        <Button onClick={openAdd} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 py-10">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading products...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
              {p.image_url && (
                <div className="relative aspect-[3/4]">
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                  {p.is_featured && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="gold" className="text-xs">Featured</Badge>
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <p className="text-white text-sm font-medium line-clamp-2 mb-1">{p.name}</p>
                <p className="text-gold-400 text-xs mb-3">{p.price}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="adminSecondary" onClick={() => openEdit(p)} className="flex-1 text-xs gap-1.5">
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="adminSecondary" onClick={() => handleDelete(p.id)} className="border-red-800/60 text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-neutral-900 border-neutral-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-white">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-1.5">
              <Label className="text-neutral-300">Product Name *</Label>
              <Input value={editing.name || ""} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} className="bg-neutral-800 border-neutral-700 text-white" placeholder="e.g. Crimson Bridal Lehenga" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-neutral-300">Price</Label>
              <Input value={editing.price || ""} onChange={(e) => setEditing((p) => ({ ...p, price: e.target.value }))} className="bg-neutral-800 border-neutral-700 text-white" placeholder="e.g. PKR 45,000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-neutral-300">Category</Label>
              <Select value={editing.category_id || ""} onValueChange={(v) => setEditing((p) => ({ ...p, category_id: v }))}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-neutral-300">Description</Label>
              <Textarea value={editing.description || ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} className="bg-neutral-800 border-neutral-700 text-white" rows={3} />
            </div>
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Main Image</Label>
              {editing.image_url && (
                <div className="relative h-40 w-32 rounded-lg overflow-hidden border border-neutral-700">
                  <Image src={editing.image_url} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} className="hidden" />
              <Button type="button" variant="adminSecondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_featured || false} onChange={(e) => setEditing((p) => ({ ...p, is_featured: e.target.checked }))} className="h-4 w-4 rounded accent-gold-500" />
                <span className="text-sm text-neutral-300">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing((p) => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded accent-gold-500" />
                <span className="text-sm text-neutral-300">Active</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Product"}
              </Button>
              <Button variant="adminSecondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
