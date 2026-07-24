"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Button, Input, Badge, Card,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@algo-matrix/ui";
import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";

type Template = {
  id: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  lastUpdated: string;
};

export default function TemplatesPage() {
  const [templates] = useState<Template[]>([
    {
      id: "t_1",
      name: "welcome_message_v1",
      category: "MARKETING",
      language: "en_US",
      status: "APPROVED",
      lastUpdated: "Oct 12, 2023"
    },
    {
      id: "t_2",
      name: "order_update_receipt",
      category: "UTILITY",
      language: "en_US",
      status: "APPROVED",
      lastUpdated: "Oct 15, 2023"
    },
    {
      id: "t_3",
      name: "holiday_promo_2024",
      category: "MARKETING",
      language: "es",
      status: "PENDING",
      lastUpdated: "2 hours ago"
    },
    {
      id: "t_4",
      name: "account_verification_otp",
      category: "AUTHENTICATION",
      language: "en_US",
      status: "REJECTED",
      lastUpdated: "Yesterday"
    }
  ]);

  const [search, setSearch] = useState("");

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
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
        <div className="p-4 border-b border-[var(--border)] flex gap-4 bg-[var(--accent)]/30">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[var(--background)]"
            />
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
            {filteredTemplates.map((template) => (
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
                <TableCell className="text-sm text-[var(--muted-foreground)]">{template.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredTemplates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[var(--muted-foreground)]">
                  No templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
