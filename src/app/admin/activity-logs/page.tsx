'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Activity, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PERMISSIONS } from '@/lib/permissions';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: string;
    email: string;
    username: string | null;
  } | null;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 50;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (selectedEntityType !== 'all') {
        params.append('entity_type', selectedEntityType);
      }
      if (selectedAction !== 'all') {
        params.append('action', selectedAction);
      }

      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const { data, count } = await response.json();
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [offset, selectedEntityType, selectedAction]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.entity_type.toLowerCase().includes(query) ||
      log.user?.email?.toLowerCase().includes(query) ||
      log.user?.username?.toLowerCase().includes(query) ||
      JSON.stringify(log.details).toLowerCase().includes(query)
    );
  });

  const formatAction = (action: string) => {
    return action
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <PermissionGate permission={PERMISSIONS.SYSTEM.ACTIVITY_LOGS}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Activity Logs
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--subtext)' }}>
              View system activity and audit trail
            </p>
          </div>
          <Button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'white',
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Filters */}
        <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--subtext)' }}
                />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entity Types</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="permission">Permission</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="role.created">Role Created</SelectItem>
                  <SelectItem value="role.updated">Role Updated</SelectItem>
                  <SelectItem value="role.deleted">Role Deleted</SelectItem>
                  <SelectItem value="role.permissions.updated">Permissions Updated</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center text-sm" style={{ color: 'var(--subtext)' }}>
                Total: {totalCount} logs
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Activity Logs</CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Recent system activities and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                Loading activity logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--subtext)' }}>
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>
                  No activity logs found
                </p>
                <p>Activity logs will appear here as system actions occur.</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--border)' }} className="hover:bg-transparent">
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>
                        Timestamp
                      </TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>
                        User
                      </TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>
                        Action
                      </TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>
                        Entity
                      </TableHead>
                      <TableHead style={{ padding: '16px', fontWeight: '600', color: 'var(--text)' }}>
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        style={{ borderColor: 'var(--border)' }}
                        className="hover:bg-opacity-50"
                      >
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          {log.user ? (
                            <div>
                              <div className="font-medium">{log.user.email}</div>
                              {log.user.username && (
                                <div className="text-xs opacity-70">{log.user.username}</div>
                              )}
                            </div>
                          ) : (
                            <span className="opacity-50">System</span>
                          )}
                        </TableCell>
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(0, 191, 255, 0.2)', color: 'var(--accent)' }}>
                            {formatAction(log.action)}
                          </span>
                        </TableCell>
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          <div>
                            <div className="font-medium capitalize">{log.entity_type}</div>
                            {log.entity_id && (
                              <div className="text-xs opacity-70 font-mono">{log.entity_id.slice(0, 8)}...</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell style={{ padding: '16px', color: 'var(--text)' }}>
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <details className="cursor-pointer">
                              <summary className="text-sm text-blue-400 hover:text-blue-300">
                                View Details
                              </summary>
                              <pre className="mt-2 text-xs p-2 rounded" style={{ backgroundColor: 'var(--background)' }}>
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="opacity-50">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalCount > limit && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                  Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} logs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= totalCount}
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}

