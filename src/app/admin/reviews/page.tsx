"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Star } from "lucide-react";
import type { Review } from "@/types";

const EMPTY = { client_name: "", review_text: "", rating: 5, event_type: "Bridal" };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews").then((r) => r.json());
    setReviews(res.reviews || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.client_name || !form.review_text) return;
    setSaving(true);
    await fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setOpen(false); setForm(EMPTY); load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Reviews</h1>
          <p className="text-neutral-400 text-sm mt-1">{reviews.length} client testimonials</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          <Plus className="h-4 w-4" /> Add Review
        </Button>
      </div>
      {loading ? <div className="flex items-center gap-2 text-neutral-400 py-10"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.length === 0 && <p className="text-neutral-500 text-sm py-6">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />)}</div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
              <p className="text-neutral-300 text-sm italic leading-relaxed mb-3">&ldquo;{r.review_text}&rdquo;</p>
              <p className="text-white text-sm font-medium">— {r.client_name}</p>
              {r.event_type && <p className="text-gold-400 text-xs mt-0.5">{r.event_type}</p>}
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader><DialogTitle className="font-serif text-xl text-white">Add Review</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-neutral-300">Client Name *</Label><Input value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} placeholder="e.g. Fatima Khan" className="bg-neutral-800 border-neutral-700 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-neutral-300">Review *</Label><Textarea value={form.review_text} onChange={(e) => setForm((p) => ({ ...p, review_text: e.target.value }))} rows={3} className="bg-neutral-800 border-neutral-700 text-white" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-neutral-300">Rating (1–5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))} className="bg-neutral-800 border-neutral-700 text-white" /></div>
              <div className="space-y-1.5"><Label className="text-neutral-300">Event Type</Label><Input value={form.event_type} onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))} placeholder="Bridal" className="bg-neutral-800 border-neutral-700 text-white" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.client_name || !form.review_text} className="flex-1 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Add Review
              </Button>
              <Button variant="adminSecondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
