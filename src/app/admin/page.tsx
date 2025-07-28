"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTab } from "@/components/admin/analytics-tab";
import { TeamsTab } from "@/components/admin/teams-tab";
import { UsersTab } from "@/components/admin/users-tab";

export default function Admin() {
	return (
		<div>
			<h1 className="text-3xl font-bold mb-5 text-center px-5">Admin Dashboard</h1>
			<Tabs defaultValue="analytics" className="mt-5">
				<TabsList>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="teams">Teams</TabsTrigger>
					<TabsTrigger value="users">Users</TabsTrigger>
				</TabsList>
				<TabsContent value="analytics">
					<AnalyticsTab />
				</TabsContent>
				<TabsContent value="teams">
					<TeamsTab />
				</TabsContent>
				<TabsContent value="users">
					<UsersTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
