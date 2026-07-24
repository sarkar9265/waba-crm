"use client";

import { useState } from "react";
import { 
  Button, Input, Badge, Card,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
  Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@algo-matrix/ui";
import { Search, Filter, Plus, Upload, Download, MoreHorizontal, User, Phone, Mail, Tag, Edit, Trash } from "lucide-react";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  tags: string[];
  status: "Opted-in" | "Opted-out";
  lastActive: string;
  attributes: Record<string, string>;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "c_1",
      firstName: "John",
      lastName: "Doe",
      phone: "+1 555 123 4567",
      email: "john.doe@example.com",
      tags: ["VIP", "Lead"],
      status: "Opted-in",
      lastActive: "2 mins ago",
      attributes: { Company: "Acme Corp", LTV: "$12,500" }
    },
    {
      id: "c_2",
      firstName: "Sarah",
      lastName: "Smith",
      phone: "+1 555 987 6543",
      email: "sarah.s@tech.inc",
      tags: ["Enterprise"],
      status: "Opted-in",
      lastActive: "Yesterday",
      attributes: { Company: "Tech Inc" }
    },
    {
      id: "c_3",
      firstName: "Mike",
      lastName: "Johnson",
      phone: "+1 555 222 1111",
      email: "mike@domain.com",
      tags: ["Support"],
      status: "Opted-out",
      lastActive: "1 week ago",
      attributes: {}
    },
    {
      id: "c_4",
      firstName: "Emma",
      lastName: "Wilson",
      phone: "+1 555 444 3333",
      email: "emma.w@gmail.com",
      tags: ["Lead"],
      status: "Opted-in",
      lastActive: "2 hours ago",
      attributes: { Source: "Webinar" }
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Sheet state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(c => {
    const term = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
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

  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const ContactForm = ({ contact, onSubmit, onCancel }: { contact?: Contact | null, onSubmit: (e: React.FormEvent) => void, onCancel: () => void }) => (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <div className="space-y-6 py-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input required defaultValue={contact?.firstName} placeholder="John" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <Input required defaultValue={contact?.lastName} placeholder="Doe" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number (with Country Code)</label>
          <Input required defaultValue={contact?.phone} placeholder="+1 555 000 0000" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input type="email" defaultValue={contact?.email} placeholder="john@example.com" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select defaultValue={contact?.status || "Opted-in"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Opted-in">Opted-in</SelectItem>
              <SelectItem value="Opted-out">Opted-out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <Input defaultValue={contact?.tags?.join(", ")} placeholder="VIP, Lead, Support" />
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          <h4 className="text-sm font-medium mb-4">Custom Attributes</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Key (e.g. Company)" className="flex-1" />
              <Input placeholder="Value (e.g. Acme)" className="flex-1" />
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Attribute
            </Button>
          </div>
        </div>
      </div>
      <SheetFooter className="pt-4 border-t border-[var(--border)] shrink-0">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Contact</Button>
      </SheetFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-[var(--muted-foreground)]">Manage your audience, create segments, and track engagement.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col sm:max-w-md w-full">
              <SheetHeader className="shrink-0">
                <SheetTitle>Add New Contact</SheetTitle>
                <SheetDescription>Create a new contact in your CRM.</SheetDescription>
              </SheetHeader>
              <ContactForm 
                onSubmit={(e) => { e.preventDefault(); setIsAddOpen(false); }} 
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
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedIds.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedIds.size}) <MoreHorizontal className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Add Tags</DropdownMenuItem>
                  <DropdownMenuItem>Remove Tags</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">Delete Selected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Table>
          <TableHeader className="bg-[var(--accent)]/30">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox 
                  checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
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
            {filteredContacts.map((contact) => (
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
                    <div className="h-8 w-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-semibold text-sm shrink-0">
                      {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                    </div>
                    <div className="font-medium text-[var(--foreground)]">{contact.firstName} {contact.lastName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm flex items-center gap-1.5"><Phone className="h-3 w-3 text-[var(--muted-foreground)]" /> {contact.phone}</div>
                  <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 mt-1"><Mail className="h-3 w-3" /> {contact.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="font-normal text-xs bg-[var(--primary)]/5 text-[var(--primary)] hover:bg-[var(--primary)]/10">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length === 0 && <span className="text-xs text-[var(--muted-foreground)]">-</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={contact.status === "Opted-in" ? "text-emerald-600 border-emerald-600 bg-emerald-50" : "text-[var(--muted-foreground)]"}>
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-[var(--muted-foreground)]">
                  {contact.lastActive}
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
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-[var(--muted-foreground)]">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)] bg-[var(--accent)]/20">
          <div>
            {selectedIds.size > 0 
              ? `${selectedIds.size} of ${filteredContacts.length} row(s) selected.`
              : `Showing ${filteredContacts.length} entries`
            }
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      {/* Edit Contact Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="flex flex-col sm:max-w-md w-full">
          <SheetHeader className="shrink-0">
            <SheetTitle>Edit Contact</SheetTitle>
            <SheetDescription>Update information for {editingContact?.firstName} {editingContact?.lastName}.</SheetDescription>
          </SheetHeader>
          <ContactForm 
            contact={editingContact}
            onSubmit={(e) => { e.preventDefault(); setIsEditOpen(false); setEditingContact(null); }} 
            onCancel={() => { setIsEditOpen(false); setEditingContact(null); }} 
          />
        </SheetContent>
      </Sheet>

    </div>
  );
}
