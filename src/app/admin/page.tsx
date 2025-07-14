"use client";

import React from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventManagement } from "@/components/admin/event-management";
import { OrganiserManagement } from "@/components/admin/organiser-management";
import { LogManagement } from "@/components/admin/log-management";

const AdminPage = () => {
  const { data: session, status } = useSession();

  if (!session || !session.user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4"> {/* Changed grid-cols-3 to grid-cols-4 */}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="organisers">Organisers</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger> {/* New Logs Tab */}
        </TabsList>
        <TabsContent value="analytics" className="mt-4">
          <div className="rounded-md border p-4">
            <h2 className="text-xl font-semibold mb-2">Analytics Dashboard</h2>
            <p>This section will display various analytics and statistics.</p>
          </div>
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          <div className="rounded-md border p-4">
            <EventManagement />
          </div>
        </TabsContent>
        <TabsContent value="organisers" className="mt-4">
          <div className="rounded-md border p-4">
            <OrganiserManagement />
          </div>
        </TabsContent>
        <TabsContent value="logs" className="mt-4"> {/* New Logs Content */}
          <div className="rounded-md border p-4">
            <LogManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;