"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Button, Card, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@algo-matrix/ui";
import { ArrowLeft, Megaphone, PlayCircle, PauseCircle, CheckCircle2, AlertCircle, Clock, Loader2, BarChart3, Users, Mail, Eye, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data } = await api.get(`/campaigns/${id}`);
        setCampaign(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
    // Poll for updates if running
    const interval = setInterval(fetchCampaign, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" /></div>;
  }

  if (!campaign) {
    return <div className="text-center py-12">Campaign not found</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "RUNNING": return <Badge className="bg-blue-50 text-blue-600 border-blue-600"><PlayCircle className="h-3 w-3 mr-1" /> Running</Badge>;
      case "PAUSED": return <Badge className="bg-amber-50 text-amber-600 border-amber-600"><PauseCircle className="h-3 w-3 mr-1" /> Paused</Badge>;
      case "SCHEDULED": return <Badge className="bg-purple-50 text-purple-600 border-purple-600"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case "FAILED": return <Badge className="bg-red-50 text-red-600 border-red-600"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalProcessed = campaign.sent + campaign.failed;
  const deliveryRate = campaign.sent > 0 ? ((campaign.delivered / campaign.sent) * 100).toFixed(1) : 0;
  const readRate = campaign.delivered > 0 ? ((campaign.read / campaign.delivered) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            {getStatusBadge(campaign.status)}
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Created on {format(new Date(campaign.createdAt), "PPP")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-[var(--background)]">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-[var(--muted-foreground)]">Sent</div>
            <div className="text-2xl font-bold">{campaign.sent}</div>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4 bg-[var(--background)]">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-[var(--muted-foreground)]">Delivered</div>
            <div className="text-2xl font-bold">{campaign.delivered} <span className="text-xs font-normal text-emerald-600">({deliveryRate}%)</span></div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-[var(--background)]">
          <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-[var(--muted-foreground)]">Read</div>
            <div className="text-2xl font-bold">{campaign.read} <span className="text-xs font-normal text-purple-600">({readRate}%)</span></div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-[var(--background)]">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-[var(--muted-foreground)]">Failed</div>
            <div className="text-2xl font-bold">{campaign.failed}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-6"><BarChart3 className="h-5 w-5" /> Delivery Funnel</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Sent ({campaign.sent})</span>
                <span className="text-[var(--muted-foreground)]">100% of Processed</span>
              </div>
              <div className="h-4 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Delivered ({campaign.delivered})</span>
                <span className="text-[var(--muted-foreground)]">{deliveryRate}% of Sent</span>
              </div>
              <div className="h-4 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${deliveryRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Read ({campaign.read})</span>
                <span className="text-[var(--muted-foreground)]">{readRate}% of Delivered</span>
              </div>
              <div className="h-4 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${readRate}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Campaign Details</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-[var(--muted-foreground)]">Template Used</div>
              <div className="font-medium mt-1">{campaign.template?.name || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--muted-foreground)]">Audience Segment</div>
              <div className="font-medium mt-1">{campaign.audience?.type === 'ALL' ? 'All Contacts' : `Tags: ${campaign.audience?.tags?.join(', ')}`}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--muted-foreground)]">Scheduled For</div>
              <div className="font-medium mt-1">
                {campaign.scheduledAt ? format(new Date(campaign.scheduledAt), "PPp") : 'Immediate'}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--muted-foreground)]">Total Processed</div>
              <div className="font-medium mt-1">{totalProcessed} records</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
