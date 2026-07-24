"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Card, Input, Button, Badge, 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@algo-matrix/ui";
import { Search, Filter, MoreHorizontal, ShieldAlert, CheckCircle2, Building, Eye, Edit, Power, PowerOff } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "Active" | "Suspended";
  wabaConnected: boolean;
  messagesSent: number;
  joinedAt: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "ten_1",
      name: "Acme Corp",
      email: "admin@acme.com",
      plan: "Pro",
      status: "Active",
      wabaConnected: true,
      messagesSent: 45200,
      joinedAt: "2024-03-15",
    },
    {
      id: "ten_2",
      name: "Global Tech",
      email: "it@global.tech",
      plan: "Enterprise",
      status: "Active",
      wabaConnected: true,
      messagesSent: 1250000,
      joinedAt: "2024-01-10",
    },
    {
      id: "ten_3",
      name: "Stark Industries",
      email: "tony@stark.com",
      plan: "Basic",
      status: "Suspended",
      wabaConnected: false,
      messagesSent: 0,
      joinedAt: "2024-07-01",
    },
    {
      id: "ten_4",
      name: "Wayne Enterprises",
      email: "bruce@wayne.com",
      plan: "Pro",
      status: "Active",
      wabaConnected: false,
      messagesSent: 120,
      joinedAt: "2024-07-10",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id: string) => {
    setClients(clients.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Suspended" : "Active" } : c));
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddOpen(false);
    // Submit logic
  };

  const handleEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditOpen(false);
    setEditingClient(null);
    // Edit logic
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-[var(--muted-foreground)]">Manage your tenants, their subscriptions, and WhatsApp connections.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Building className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddClient}>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>Create a new tenant workspace in the CRM.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input required placeholder="Acme Inc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Email</label>
                    <Input required type="email" placeholder="admin@acme.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subscription Plan</label>
                    <Select defaultValue="Basic">
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Client</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 bg-[var(--accent)]/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9 bg-[var(--background)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[var(--background)]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Table>
          <TableHeader className="bg-[var(--accent)]/30">
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>WABA Integration</TableHead>
              <TableHead className="text-right">Messages Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="font-medium text-[var(--foreground)]">{client.name}</div>
                  <div className="text-[var(--muted-foreground)] text-xs mt-0.5">{client.email}</div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)] ring-1 ring-inset ring-[var(--primary)]/20">
                    {client.plan}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={client.status === "Active" ? "default" : "destructive"} className={client.status === "Active" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" : ""}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.wabaConnected ? (
                    <div className="flex items-center text-emerald-500 gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-500 gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-xs font-medium">Pending Setup</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium text-[var(--muted-foreground)]">
                  {client.messagesSent.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/clients/${client.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setEditingClient(client);
                        setIsEditOpen(true);
                      }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Client
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => toggleStatus(client.id)}
                        className={client.status === "Active" ? "text-amber-500 focus:text-amber-600" : "text-emerald-500 focus:text-emerald-600"}
                      >
                        {client.status === "Active" ? (
                          <><PowerOff className="mr-2 h-4 w-4" /> Suspend Client</>
                        ) : (
                          <><Power className="mr-2 h-4 w-4" /> Activate Client</>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[var(--muted-foreground)]">
                  No clients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)] bg-[var(--accent)]/20">
          <div>Showing {filteredClients.length} entries</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      {/* Edit Client Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEditClient}>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update details for {editingClient?.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input required defaultValue={editingClient?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <Input required type="email" defaultValue={editingClient?.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Plan</label>
                <Select defaultValue={editingClient?.plan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
