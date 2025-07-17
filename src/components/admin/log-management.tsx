"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: number; // Changed to number
  level: string;
  message: string;
  correlationId?: string | null;
  context?: string | null;
  userId?: string | null;
  meta?: string | null; // JSON string
}

export function LogManagement() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    level: "all",
    correlationId: "",
    userId: "",
  });

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters.level && filters.level !== "all")
        queryParams.append("level", filters.level);
      if (filters.correlationId)
        queryParams.append("correlationId", filters.correlationId);
      if (filters.userId) queryParams.append("userId", filters.userId);

      const response = await fetch(`/api/logs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.error.message);
        toast.error(`Failed to fetch logs: ${data.error.message}`);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, toast.error]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Application Logs</h3>
        <Button onClick={fetchLogs} disabled={loading} size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Select
            value={filters.level}
            onValueChange={(value) => handleFilterChange("level", value)}
          >
            <SelectTrigger id="log-level">
              <SelectValue placeholder="Select a level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="INFO">INFO</SelectItem>
              <SelectItem value="WARN">WARN</SelectItem>
              <SelectItem value="ERROR">ERROR</SelectItem>
              <SelectItem value="DEBUG">DEBUG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            id="correlation-id"
            placeholder="Filter by Correlation ID"
            value={filters.correlationId}
            onChange={(e) =>
              handleFilterChange("correlationId", e.target.value)
            }
          />
        </div>
        <div>
          <Input
            id="user-id"
            placeholder="Filter by User ID"
            value={filters.userId}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-auto max-h-[500px]">
        {" "}
        {/* Scrollable container */}
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            {/* Sticky header */}
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Correlation ID</TableHead>
              <TableHead>Meta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.timestamp * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.level}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{log.context || "N/A"}</TableCell>
                  <TableCell>{log.userId || "N/A"}</TableCell>
                  <TableCell>{log.correlationId || "N/A"}</TableCell>
                  <TableCell className="text-xs">{log.meta || "N/A"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No logs found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
