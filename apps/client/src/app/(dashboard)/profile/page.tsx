"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@algo-matrix/ui";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { NotificationSettings } from "@/components/profile/NotificationSettings";
import { ApiKeysSettings } from "@/components/profile/ApiKeysSettings";

export default function ProfilePage() {
  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex flex-row md:flex-col justify-start h-auto bg-transparent p-0 space-x-2 md:space-x-0 md:space-y-1 w-full md:w-64 shrink-0 overflow-x-auto">
          <TabsTrigger 
            value="profile" 
            className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-[var(--muted)] data-[state=active]:shadow-none rounded-md"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-[var(--muted)] data-[state=active]:shadow-none rounded-md"
          >
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-[var(--muted)] data-[state=active]:shadow-none rounded-md"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="api-keys" 
            className="w-full justify-start px-4 py-2 text-left data-[state=active]:bg-[var(--muted)] data-[state=active]:shadow-none rounded-md"
          >
            API Keys
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 max-w-3xl min-w-0">
          <TabsContent value="profile" className="mt-0 outline-none">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="security" className="mt-0 outline-none">
            <SecuritySettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0 outline-none">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="api-keys" className="mt-0 outline-none">
            <ApiKeysSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
