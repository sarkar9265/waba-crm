"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Button, Card, Input, Badge,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@algo-matrix/ui";
import { Plus, Search, Megaphone, PlayCircle, PauseCircle, RefreshCw, MoreHorizontal, Loader2, Clock, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import { format } from "date-fns";
import { api } from "@/lib/api";

export default function CampaignsPage() {
  const { campaigns, total, page, limit, totalPages, loading, fetchCampaigns, launchCampaign, pauseCampaign, resumeCampaign, retryCampaign } = useCampaignsStore();
  const [search, setSearch] = useState("");
  const [queueStatus, setQueueStatus] = useState({ waiting: 0, active: 0, failed: 0 });

  useEffect(() => {
    fetchCampaigns({ page: 1, limit, search });
  }, [search]);

  useEffect(() => {
    const fetchQueue = () => api.get('/campaigns/queue-status').then(res => setQueueStatus(res.data)).catch(console.error);
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "RUNNING":
        return <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50"><PlayCircle className="h-3 w-3 mr-1" /> Running</Badge>;
      case "PAUSED":
        return <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50"><PauseCircle className="h-3 w-3 mr-1" /> Paused</Badge>;
      case "SCHEDULED":
        return <Badge variant="outline" className="text-purple-600 border-purple-600 bg-purple-50"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "DRAFT":
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAction = async (action: 'launch' | 'pause' | 'resume' | 'retry', id: string) => {
    try {
      if (action === 'launch') await launchCampaign(id);
      if (action === 'pause') await pauseCampaign(id);
      if (action === 'resume') await resumeCampaign(id);
      if (action === 'retry') await retryCampaign(id);
    } catch (error) {
      alert(`Failed to ${action} campaign`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-[var(--muted-foreground)]">Create and manage your WhatsApp broadcast campaigns.</p>
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto">

          
          <Link href="/campaigns/create" passHref>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          </Link>
        </div>
      </div>


      <Card className="p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex gap-4 bg-[var(--accent)]/30">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input 
              placeholder="Search campaigns..." 
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
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Read</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)] mx-auto" />
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-[var(--muted-foreground)]">
                  No campaigns found.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link href={`/campaigns/${campaign.id}`} className="flex items-center gap-2 hover:underline">
                      <Megaphone className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="font-medium text-[var(--primary)]">{campaign.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-[var(--muted-foreground)] truncate max-w-[150px]">
                    {campaign.template?.name || "None"}
                  </TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">
                    {campaign.audience?.type === 'ALL' ? 'All Contacts' : campaign.audience?.tags?.join(', ') || 'Draft'}
                  </TableCell>
                  <TableCell>{campaign.sent}</TableCell>
                  <TableCell>{campaign.delivered}</TableCell>
                  <TableCell>{campaign.read}</TableCell>
                  <TableCell className="text-red-500">{campaign.failed}</TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {format(new Date(campaign.updatedAt), "PPp")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {campaign.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleAction('launch', campaign.id)}>
                            <PlayCircle className="h-4 w-4 mr-2 text-blue-500" /> Launch Now
                          </DropdownMenuItem>
                        )}
                        {(campaign.status === "RUNNING" || campaign.status === "SCHEDULED") && (
                          <DropdownMenuItem onClick={() => handleAction('pause', campaign.id)}>
                            <PauseCircle className="h-4 w-4 mr-2 text-amber-500" /> Pause
                          </DropdownMenuItem>
                        )}
                        {campaign.status === "PAUSED" && (
                          <DropdownMenuItem onClick={() => handleAction('resume', campaign.id)}>
                            <PlayCircle className="h-4 w-4 mr-2 text-blue-500" /> Resume
                          </DropdownMenuItem>
                        )}
                        {(campaign.status === "COMPLETED" || campaign.status === "FAILED") && campaign.failed > 0 && (
                          <DropdownMenuItem onClick={() => handleAction('retry', campaign.id)}>
                            <RefreshCw className="h-4 w-4 mr-2 text-orange-500" /> Retry Failed
                          </DropdownMenuItem>
                        )}
                        {/* More actions like Edit, Duplicate, Delete could go here */}
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
            Showing {campaigns.length} of {total} entries
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => fetchCampaigns({ page: page - 1, limit, search })}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => fetchCampaigns({ page: page + 1, limit, search })}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
