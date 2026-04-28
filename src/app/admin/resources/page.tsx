"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, Text, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

type Category = "Video" | "Article" | "Exercise";

interface AdminResource {
  id: string;
  title: string;
  url: string;
  category: Category;
  duration?: string | null;
  source?: string | null;
  description?: string | null;
  created_at?: string;
}

const CATEGORIES: Category[] = ["Video", "Article", "Exercise"];

const EMPTY_FORM = {
  title: "",
  url: "",
  category: "Video" as Category,
  duration: "",
  source: "",
  description: "",
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resources", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setResources(json.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to add resource");
      } else {
        setSuccess("Resource added.");
        setForm(EMPTY_FORM);
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/resources?id=${encodeURIComponent(deleteId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const inputCls =
    "w-full h-10 bg-surface border border-border rounded-md px-3 typo-base text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none";

  return (
    <div className="w-full pb-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Text variant="h1" className="mb-3 text-balance">
              Resource <span className="text-primary">Library</span>
            </Text>
            <Text color="secondary" weight="medium">
              Add curated videos, articles, and exercises that students see in their hub.
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add form */}
          <form onSubmit={handleSubmit} className="card-raised p-8 lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Icon icon="tabler:plus" className="text-lg" />
              </div>
              <Text variant="h3">Add a resource</Text>
            </div>

            <div>
              <label className="typo-ui text-text-dim mb-2 block">Category</label>
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: c }))}
                    className={cn(
                      "h-9 px-4 rounded-md typo-ui font-medium border transition-all",
                      form.category === c
                        ? "bg-white text-black border-white"
                        : "border-border text-text-muted hover:text-white hover:border-white/20"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="typo-ui text-text-dim mb-2 block">Title *</label>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. 4-7-8 Breathing Exercise"
                required
              />
            </div>

            <div>
              <label className="typo-ui text-text-dim mb-2 block">URL *</label>
              <input
                className={inputCls}
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="typo-ui text-text-dim mb-2 block">Duration</label>
                <input
                  className={inputCls}
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="5 min"
                />
              </div>
              <div>
                <label className="typo-ui text-text-dim mb-2 block">Source</label>
                <input
                  className={inputCls}
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  placeholder="YouTube, NHS, Healthline..."
                />
              </div>
            </div>

            <div>
              <label className="typo-ui text-text-dim mb-2 block">Description</label>
              <textarea
                className={cn(inputCls, "h-24 py-2 leading-relaxed")}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="One short sentence to help students decide if it's right for them."
              />
            </div>

            {error && (
              <div className="text-danger typo-ui font-medium border border-danger/20 bg-danger/10 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="text-success typo-ui font-medium border border-success/20 bg-success/10 rounded-md px-3 py-2">
                {success}
              </div>
            )}

            <Button type="submit" size="md" className="gap-2" disabled={submitting}>
              <Icon icon={submitting ? "tabler:loader-2" : "tabler:plus"} className={cn("text-lg", submitting && "animate-spin")} />
              {submitting ? "Adding..." : "Add resource"}
            </Button>
          </form>

          {/* List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <Text variant="h3">Admin-added resources</Text>
              <Text variant="small" color="muted" weight="medium">
                {resources.length} {resources.length === 1 ? "item" : "items"}
              </Text>
            </div>

            {loading ? (
              <div className="card p-8 text-center text-text-dim">
                <Icon icon="tabler:loader-2" className="animate-spin text-2xl mx-auto mb-3" />
                Loading...
              </div>
            ) : resources.length === 0 ? (
              <div className="card p-10 text-center text-text-dim border border-dashed">
                <Icon icon="tabler:books-off" className="text-4xl mx-auto mb-3 opacity-30" />
                <Text color="secondary">No admin-added resources yet. The student hub still shows the curated set.</Text>
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((r) => (
                  <div key={r.id} className="card p-5 flex items-start gap-4 group hover:border-white/20 transition-colors">
                    <div className="size-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                      <Icon
                        icon={
                          r.category === "Video"
                            ? "tabler:video"
                            : r.category === "Article"
                              ? "tabler:article"
                              : "tabler:run"
                        }
                        className="text-lg text-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="typo-ui font-medium px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20">
                          {r.category}
                        </span>
                        {r.duration && (
                          <Text variant="small" color="muted" weight="medium" className="tabular-nums">
                            {r.duration}
                          </Text>
                        )}
                        {r.source && (
                          <Text variant="small" color="muted" weight="medium">
                            · {r.source}
                          </Text>
                        )}
                      </div>
                      <Text weight="semibold" className="truncate">
                        {r.title}
                      </Text>
                      {r.description && (
                        <Text variant="small" color="secondary" className="mt-1 line-clamp-2">
                          {r.description}
                        </Text>
                      )}
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="typo-ui text-text-dim hover:text-primary transition-colors truncate block mt-2"
                      >
                        {r.url}
                      </a>
                    </div>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="size-8 rounded flex items-center justify-center text-text-dim hover:text-danger hover:bg-danger/10 transition-colors"
                      aria-label="Delete resource"
                    >
                      <Icon icon="tabler:trash" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="p-6">
          <Text color="secondary" className="mb-6">
            Are you sure you want to delete this resource? This action cannot be undone.
          </Text>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Resource"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
