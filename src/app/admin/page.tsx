"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTab } from "@/components/admin/analytics-tab";
import { TeamsTab } from "@/components/admin/teams-tab";
import { UsersTab } from "@/components/admin/users-tab";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Admin() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;
		if (status === "unauthenticated" || !session?.user.isAdmin) {
			router.push("/");
		}
	}, [session, status, router]);

	if (status === "loading" || status === "unauthenticated" || !session?.user.isAdmin) {
		return <div>Loading...</div>;
	}
	return (
		<div>
			<h1 className="text-3xl font-bold mb-5 text-center px-5">
				Admin Dashboard
			</h1>
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
