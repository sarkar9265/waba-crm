"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Button, Input, Badge, Card,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
  Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@algo-matrix/ui";
import { Search, Filter, Plus, Upload, Download, MoreHorizontal, Phone, Mail, Edit, Trash, Loader2, Activity } from "lucide-react";
import { useContactsStore, Contact } from "@/store/useContactsStore";
import { format } from "date-fns";
import { api } from "@/lib/api";

export default function ContactsPage() {
  const { 
    contacts, total, page, limit, totalPages, loading, 
    fetchContacts, bulkAction, deleteContact, createContact, updateContact, importContacts, exportContacts, mergeContacts 
  } = useContactsStore();

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Sheet state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactActivity, setContactActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchContacts({ page: 1, limit, search, status: statusFilter });
  }, [search, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      await deleteContact(id);
      setSelectedIds(new Set([...selectedIds].filter(sid => sid !== id)));
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} contacts?`)) {
      await bulkAction(Array.from(selectedIds), "delete");
      setSelectedIds(new Set());
    }
  };

  const handleBulkTags = async (action: "addTags" | "removeTags") => {
    const tag = prompt(`Enter tag to ${action === 'addTags' ? 'add' : 'remove'}:`);
    if (tag) {
      await bulkAction(Array.from(selectedIds), action, { tags: [tag] });
      setSelectedIds(new Set());
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importContacts(file);
      e.target.value = ''; // Reset
      alert("Contacts imported successfully!");
    }
  };

  const handleExport = async () => {
    const csv = await exportContacts();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const handleMerge = async () => {
    if (selectedIds.size !== 2) {
      alert("Please select exactly 2 contacts to merge.");
      return;
    }
    const ids = Array.from(selectedIds);
    const primaryId = prompt(`Merging ${ids[1]} INTO ${ids[0]}.\nType 'YES' to confirm and KEEP ${ids[0]} as primary.`);
    if (primaryId === 'YES') {
      await mergeContacts(ids[0], ids[1]);
      setSelectedIds(new Set());
      alert("Contacts merged!");
    }
  };

  const fetchActivity = async (id: string) => {
    setLoadingActivity(true);
    try {
      const { data } = await api.get(`/contacts/${id}/activity`);
      setContactActivity(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const ContactForm = ({ contact, onSubmit, onCancel, showActivity }: { contact?: Contact | null, onSubmit: (e: React.FormEvent, data: any) => void, onCancel: () => void, showActivity?: boolean }) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        status: formData.get("status") as string,
        tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
      };
      onSubmit(e, data);
    };

    const FormContent = (
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="space-y-6 py-6 flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input name="firstName" required defaultValue={contact?.firstName || contact?.name || ""} placeholder="John" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input name="lastName" defaultValue={contact?.lastName || ""} placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number (with Country Code)</label>
            <Input name="phone" required defaultValue={contact?.phone} placeholder="+1 555 000 0000" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input name="email" type="email" defaultValue={contact?.email || ""} placeholder="john@example.com" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select name="status" defaultValue={contact?.status || "OPTED_IN"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPTED_IN">Opted-in</SelectItem>
                <SelectItem value="OPTED_OUT">Opted-out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input name="tags" defaultValue={contact?.tags?.join(", ")} placeholder="VIP, Lead, Support" />
          </div>
        </div>
        <SheetFooter className="pt-4 border-t border-[var(--border)] shrink-0 px-4 sm:px-6">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Contact</Button>
        </SheetFooter>
      </form>
    );

    if (!showActivity) return FormContent;

    return (
      <Tabs defaultValue="details" className="flex flex-col h-full overflow-hidden">
        <div className="px-6 pt-4 border-b border-[var(--border)]">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="details" className="flex-1 flex flex-col h-full overflow-hidden m-0">
          {FormContent}
        </TabsContent>
        <TabsContent value="activity" className="flex-1 overflow-y-auto p-6 m-0 bg-[var(--muted)]/20">
          {loadingActivity ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" /></div>
          ) : contactActivity.length === 0 ? (
            <p className="text-sm text-center text-[var(--muted-foreground)] py-8">No conversations found.</p>
          ) : (
            <div className="space-y-6">
              {contactActivity.map((conv: any) => (
                <div key={conv.id} className="relative pl-6 border-l-2 border-[var(--border)] pb-2">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-[var(--background)] border-2 border-[var(--primary)]" />
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Conversation #{conv.id.substring(0,6)}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{format(new Date(conv.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="space-y-3 bg-[var(--background)] p-3 rounded-md border border-[var(--border)] shadow-sm">
                    {conv.messages?.map((msg: any) => (
                      <div key={msg.id} className={`text-sm flex flex-col ${msg.direction === 'OUTBOUND' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3 py-1.5 rounded-lg max-w-[85%] ${msg.direction === 'OUTBOUND' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--accent)] text-[var(--foreground)]'}`}>
                          {msg.content || `[${msg.type}]`}
                        </div>
                        <span className="text-[10px] text-[var(--muted-foreground)] mt-1">{format(new Date(msg.createdAt), "h:mm a")}</span>
                      </div>
                    ))}
                    {conv.messages?.length === 0 && <span className="text-xs text-[var(--muted-foreground)]">No messages</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleImport} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-[var(--muted-foreground)]">Manage your audience, create segments, and track engagement.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col sm:max-w-md w-full p-0">
              <SheetHeader className="shrink-0 p-6 pb-0">
                <SheetTitle>Add New Contact</SheetTitle>
                <SheetDescription>Create a new contact in your CRM.</SheetDescription>
              </SheetHeader>
              <ContactForm 
                onSubmit={async (e, data) => { 
                  await createContact(data); 
                  setIsAddOpen(false); 
                }} 
                onCancel={() => setIsAddOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 bg-[var(--accent)]/30 justify-between items-center">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input 
              placeholder="Search by name, phone, or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[var(--background)]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            {selectedIds.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedIds.size}) <MoreHorizontal className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleBulkTags('addTags')}>Add Tags</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkTags('removeTags')}>Remove Tags</DropdownMenuItem>
                  {selectedIds.size === 2 && (
                    <DropdownMenuItem onClick={handleMerge}>Merge Contacts</DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-red-500" onClick={handleBulkDelete}>Delete Selected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="OPTED_IN">Opted In</SelectItem>
                <SelectItem value="OPTED_OUT">Opted Out</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        {/* Data Table */}
        <Table>
          <TableHeader className="bg-[var(--accent)]/30">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox 
                  checked={contacts.length > 0 && selectedIds.size === contacts.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)] mx-auto" />
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-[var(--muted-foreground)]">
                  No contacts found.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} data-state={selectedIds.has(contact.id) ? "selected" : undefined}>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={() => toggleSelect(contact.id)}
                      aria-label={`Select ${contact.firstName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-semibold text-sm shrink-0 uppercase">
                        {(contact.firstName?.[0] || contact.name?.[0] || "U")}
                      </div>
                      <div className="font-medium text-[var(--foreground)]">
                        {contact.firstName || contact.name || "Unknown"} {contact.lastName || ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center gap-1.5"><Phone className="h-3 w-3 text-[var(--muted-foreground)]" /> {contact.phone}</div>
                    {contact.email && (
                      <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 mt-1"><Mail className="h-3 w-3" /> {contact.email}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="font-normal text-xs bg-[var(--primary)]/5 text-[var(--primary)] hover:bg-[var(--primary)]/10">
                          {tag}
                        </Badge>
                      ))}
                      {(!contact.tags || contact.tags.length === 0) && <span className="text-xs text-[var(--muted-foreground)]">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={contact.status === "OPTED_IN" ? "text-emerald-600 border-emerald-600 bg-emerald-50" : "text-[var(--muted-foreground)]"}>
                      {contact.status === "OPTED_IN" ? "Opted-in" : "Opted-out"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {contact.lastActive ? format(new Date(contact.lastActive), "PPp") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingContact(contact);
                          setIsEditOpen(true);
                          fetchActivity(contact.id);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-red-500 focus:text-red-600">
                          <Trash className="mr-2 h-4 w-4" /> Delete Contact
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
            {selectedIds.size > 0 
              ? `${selectedIds.size} of ${total} row(s) selected.`
              : `Showing ${contacts.length} of ${total} entries`
            }
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => fetchContacts({ page: page - 1, limit, search, status: statusFilter })}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => fetchContacts({ page: page + 1, limit, search, status: statusFilter })}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Contact Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="flex flex-col sm:max-w-md w-full p-0">
          <SheetHeader className="shrink-0 p-6 pb-0">
            <SheetTitle>Edit Contact</SheetTitle>
            <SheetDescription>Update information for {editingContact?.firstName || editingContact?.name}.</SheetDescription>
          </SheetHeader>
          <ContactForm 
            contact={editingContact}
            showActivity={true}
            onSubmit={async (e, data) => { 
              if (editingContact) {
                await updateContact(editingContact.id, data);
              }
              setIsEditOpen(false); 
              setEditingContact(null); 
            }} 
            onCancel={() => { setIsEditOpen(false); setEditingContact(null); }} 
          />
        </SheetContent>
      </Sheet>

    </div>
  );
}
