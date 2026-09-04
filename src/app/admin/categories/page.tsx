"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories").then((r) => r.json());
    setCategories(res.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), sort_order: categories.length }),
    });
    setNewName("");
    setAdding(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products in this category won't be deleted.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl font-bold text-white mb-2">Categories</h1>
      <p className="text-neutral-400 text-sm mb-8">Manage product categories for your collections.</p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name..."
          className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
        />
        <Button type="submit" disabled={adding || !newName.trim()} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2 shrink-0">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="space-y-2">
          {categories.length === 0 && (
            <p className="text-neutral-500 text-sm py-4">No categories yet. Add your first one above.</p>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors">
              <div>
                <p className="text-white text-sm font-medium">{cat.name}</p>
                <p className="text-neutral-500 text-xs">/{cat.slug}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(cat.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
