"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from "@algo-matrix/ui";

export function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [campaignReports, setCampaignReports] = useState(true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what we can email you about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Critical Security Alerts</p>
              <p className="text-sm text-[var(--muted-foreground)]">Receive emails about your account security.</p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Campaign Reports</p>
              <p className="text-sm text-[var(--muted-foreground)]">Weekly summaries of your campaign performances.</p>
            </div>
            <Switch checked={campaignReports} onCheckedChange={setCampaignReports} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Marketing & Updates</p>
              <p className="text-sm text-[var(--muted-foreground)]">Receive product updates and marketing materials.</p>
            </div>
            <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>Manage how you receive alerts within the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">System Alerts</p>
              <p className="text-sm text-[var(--muted-foreground)]">Notifications about billing, limits, and system health.</p>
            </div>
            <Switch checked={systemAlerts} onCheckedChange={setSystemAlerts} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
