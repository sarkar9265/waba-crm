"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Button, Input, Badge, Card,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@algo-matrix/ui";
import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, AlertCircle, Clock, Loader2, RefreshCw, Trash, Eye, Filter } from "lucide-react";
import { useTemplatesStore, Template } from "@/store/useTemplatesStore";
import { format } from "date-fns";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";

export default function TemplatesPage() {
  const { templates, total, page, limit, totalPages, loading, fetchTemplates, deleteTemplate, syncTemplate } = useTemplatesStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [language, setLanguage] = useState("ALL");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates({ page: 1, limit, search, status, category, language });
  }, [search, status, category, language]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate(id);
    }
  };

  const handleSync = async (id: string) => {
    await syncTemplate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "PENDING":
      case "SUBMITTED":
        return <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "DRAFT":
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "MARKETING":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100/80">Marketing</Badge>;
      case "UTILITY":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100/80">Utility</Badge>;
      case "AUTHENTICATION":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100/80">Authentication</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
          <p className="text-[var(--muted-foreground)]">Manage your WhatsApp message templates for business-initiated conversations.</p>
        </div>
        <Link href="/templates/create" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-4 bg-[var(--accent)]/30 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[var(--background)]"
            />
          </div>
          
          <div className="flex gap-4 items-center">
            <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px] bg-[var(--background)]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px] bg-[var(--background)]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="UTILITY">Utility</SelectItem>
                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
              </SelectContent>
            </Select>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] bg-[var(--background)]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Languages</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="pt_BR">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <Table>
          <TableHeader className="bg-[var(--accent)]/30">
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)] mx-auto" />
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[var(--muted-foreground)]">
                  No templates found.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="font-medium">{template.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(template.category)}</TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">{template.language}</TableCell>
                  <TableCell>{getStatusBadge(template.status)}</TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {format(new Date(template.updatedAt), "PPp")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSync(template.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" /> Sync with Meta
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(template.id)}>
                          <Trash className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)] bg-[var(--accent)]/20">
          <div>
            Showing {templates.length} of {total} entries
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => fetchTemplates({ page: page - 1, limit, search })}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => fetchTemplates({ page: page + 1, limit, search })}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {previewTemplate && (
        <TemplatePreviewModal 
          template={previewTemplate} 
          open={!!previewTemplate} 
          onOpenChange={(open: boolean) => !open && setPreviewTemplate(null)} 
        />
      )}
    </div>
  );
}
