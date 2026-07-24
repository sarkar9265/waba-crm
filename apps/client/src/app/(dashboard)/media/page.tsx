"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Badge } from "@algo-matrix/ui";
import {
  ImageIcon,
  Video,
  Music,
  Mic,
  FileText,
  Upload,
  Trash2,
  Loader2,
  Filter,
  Grid3X3,
  List,
  X,
  File,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "VOICE" | "DOCUMENT";

interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaType;
  provider: string;
  url: string;
  createdAt: string;
}

const MEDIA_TYPE_CONFIG: Record<MediaType, { label: string; icon: any; color: string }> = {
  IMAGE: { label: "Images", icon: ImageIcon, color: "text-blue-500" },
  VIDEO: { label: "Videos", icon: Video, color: "text-purple-500" },
  AUDIO: { label: "Audio", icon: Music, color: "text-amber-500" },
  VOICE: { label: "Voice", icon: Mic, color: "text-emerald-500" },
  DOCUMENT: { label: "Documents", icon: FileText, color: "text-red-500" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getMediaIcon(type: MediaType) {
  const cfg = MEDIA_TYPE_CONFIG[type];
  const Icon = cfg?.icon ?? File;
  return <Icon className={`h-5 w-5 ${cfg?.color ?? "text-[var(--muted-foreground)]"}`} />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MediaManagerPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<MediaType | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDragOver, setIsDragOver] = useState(false);
  const { token } = useAuthStore();

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeFilter ? `?type=${activeFilter}` : "";
      const res = await api.get(`/storage${params}`);
      setMedia(res.data);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (token) fetchMedia();
  }, [token, fetchMedia]);

  // -----------------------------------------------------------------------
  // Upload
  // -----------------------------------------------------------------------
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        await api.post("/storage/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
      fetchMedia();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file permanently?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/storage/${id}`);
      setMedia((prev) => prev.filter((m) => m.id !== id));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------------------------------------------------
  // Drag & Drop
  // -----------------------------------------------------------------------
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleUpload(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // -----------------------------------------------------------------------
  // Stats
  // -----------------------------------------------------------------------
  const stats = {
    total: media.length,
    totalSize: media.reduce((acc, m) => acc + m.size, 0),
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Media Manager</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            {stats.total} files &middot; {formatFileSize(stats.totalSize)} total
          </p>
        </div>

        <label>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button asChild disabled={uploading} className="gap-2 cursor-pointer">
            <span>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Files
            </span>
          </Button>
        </label>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              !activeFilter
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                : "bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--accent)]"
            }`}
          >
            All
          </button>
          {(Object.keys(MEDIA_TYPE_CONFIG) as MediaType[]).map((type) => {
            const cfg = MEDIA_TYPE_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors flex items-center gap-1.5 ${
                  activeFilter === type
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                    : "bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--accent)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1 border border-[var(--border)] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-[var(--accent)]" : ""}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-[var(--accent)]" : ""}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drop Zone / Content */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`min-h-[400px] rounded-xl border-2 border-dashed transition-colors ${
          isDragOver
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--border)]"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <Upload className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {activeFilter ? `No ${MEDIA_TYPE_CONFIG[activeFilter].label.toLowerCase()} found` : "No media uploaded yet"}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">
              Drag &amp; drop files here, or click the Upload button above.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {media.map((item) => (
              <MediaCard key={item.id} item={item} onDelete={handleDelete} deleting={deletingId === item.id} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {media.map((item) => (
              <MediaRow key={item.id} item={item} onDelete={handleDelete} deleting={deletingId === item.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MediaCard({
  item,
  onDelete,
  deleting,
}: {
  item: Media;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const isImage = item.type === "IMAGE";

  return (
    <Card className="group relative overflow-hidden border-[var(--border)] hover:shadow-md transition-shadow">
      <div className="aspect-square bg-[var(--accent)] flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={item.url}
            alt={item.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {getMediaIcon(item.type)}
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase">
              {item.mimeType.split("/")[1]?.substring(0, 6) ?? "file"}
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-1">
        <p className="text-xs font-medium truncate text-[var(--foreground)]" title={item.originalName}>
          {item.originalName}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--muted-foreground)]">{formatFileSize(item.size)}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {item.provider}
          </Badge>
        </div>
      </CardContent>

      {/* Delete overlay */}
      <button
        onClick={() => onDelete(item.id)}
        disabled={deleting}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </Card>
  );
}

function MediaRow({
  item,
  onDelete,
  deleting,
}: {
  item: Media;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--accent)]/50 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
        {item.type === "IMAGE" ? (
          <img src={item.url} alt="" className="h-full w-full rounded-lg object-cover" />
        ) : (
          getMediaIcon(item.type)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-[var(--foreground)]">{item.originalName}</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {formatFileSize(item.size)} &middot; {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Badge variant="outline" className="text-[10px] shrink-0">{item.type}</Badge>
      <Badge variant="outline" className="text-[10px] shrink-0">{item.provider}</Badge>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(item.id)}
        disabled={deleting}
        className="text-[var(--muted-foreground)] hover:text-red-500 shrink-0"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
