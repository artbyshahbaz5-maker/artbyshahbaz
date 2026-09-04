"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import type { FAQ } from "@/types";

const EMPTY = { question: "", answer: "" };

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FAQ>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/faqs").then((r) => r.json());
    if (!res.success) alert(res.message || "Failed to load FAQs.");
    setFaqs(res.faqs || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(EMPTY); setIsEdit(false); setOpen(true); }
  function openEdit(f: FAQ) { setEditing({ ...f }); setIsEdit(true); setOpen(true); }

  async function handleSave() {
    if (!editing.question || !editing.answer) return;
    setSaving(true);
    try {
      const payload = { question: editing.question, answer: editing.answer };
      const res = await fetch(
        isEdit && editing.id ? `/api/admin/faqs/${editing.id}` : "/api/admin/faqs",
        {
          method: isEdit && editing.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      ).then((r) => r.json());
      if (!res.success) {
        alert(res.message || "Failed to save FAQ.");
        return;
      }
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (!res.success) alert(res.message || "Failed to delete FAQ.");
    load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">FAQs</h1>
          <p className="text-neutral-400 text-sm mt-1">{faqs.length} questions</p>
        </div>
        <Button onClick={openAdd} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>
      {loading ? <div className="flex items-center gap-2 text-neutral-400 py-10"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div> : (
        <div className="space-y-3">
          {faqs.length === 0 && <p className="text-neutral-500 text-sm py-6">No FAQs yet.</p>}
          {faqs.map((f, i) => (
            <div key={f.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
              <div className="flex items-start gap-4">
                <span className="text-gold-400 text-sm font-mono mt-0.5 flex-shrink-0">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium mb-2">{f.question}</p>
                  <p className="text-neutral-400 text-sm leading-relaxed">{f.answer}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(f)} className="h-7 w-7 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(f.id)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader><DialogTitle className="font-serif text-xl text-white">{isEdit ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-neutral-300">Question *</Label><Input value={editing.question || ""} onChange={(e) => setEditing((p) => ({ ...p, question: e.target.value }))} placeholder="e.g. Do you offer custom orders?" className="bg-neutral-800 border-neutral-700 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-neutral-300">Answer *</Label><Textarea value={editing.answer || ""} onChange={(e) => setEditing((p) => ({ ...p, answer: e.target.value }))} rows={4} className="bg-neutral-800 border-neutral-700 text-white" /></div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !editing.question || !editing.answer} className="flex-1 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} {isEdit ? "Save Changes" : "Add FAQ"}
              </Button>
              <Button variant="adminSecondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
