import { useState, useEffect } from "react";
import { Bell, Search, Filter, CheckCheck, X, Trash2, Mail, Send, Loader2, Eye, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  booking_id: string | null;
  order_id: string | null;
  is_read: boolean;
  read_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  metadata: any;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Fetch notifications with pagination and server-side filtering
  const fetchNotifications = async (page = 1, limit = 50) => {
    setLoading(true);
    try {
      let query = supabase
        .from("notifications")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply server-side filtering
      if (filterType === "unread") {
        query = query.eq("is_read", false);
      } else if (filterType === "read") {
        query = query.eq("is_read", true);
      }

      // Apply server-side search if search term is substantial
      if (searchTerm.trim().length > 2) {
        query = query.or(`title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      setNotifications(data || []);
      // Store total count for pagination
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage, pageSize);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.user_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === "all" ||
      (filterType === "unread" && !notification.is_read) ||
      (filterType === "read" && notification.is_read);

    return matchesSearch && matchesFilter;
  });

  // Get notification stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  // Mark as read
  const handleMarkAsRead = async (ids: string[]) => {
    setActionLoading(true);
    try {
      // Use the database function for consistency
      const promises = ids.map(id => 
        supabase.rpc('mark_notification_read', {
          p_notification_id: id,
          p_user_id: null // Admin can mark any notification as read
        })
      );
      
      await Promise.all(promises);

      setNotifications(prev =>
        prev.map(n =>
          ids.includes(n.id)
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );

      setSelectedNotifications([]);
      toast.success(`Marked ${ids.length} notification(s) as read`);
    } catch (error: any) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete notifications
  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} notification(s)?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .in("id", ids);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
      setSelectedNotifications([]);
      toast.success(`Deleted ${ids.length} notification(s)`);
    } catch (error: any) {
      console.error("Error deleting notifications:", error);
      toast.error("Failed to delete notifications");
    } finally {
      setActionLoading(false);
    }
  };

  // Resend push notification
  const handleResendPush = async (notification: AdminNotification) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: notification.user_id,
          title: notification.title,
          body: notification.message,
          type: notification.type,
          url: notification.booking_id ? `/admin/bookings/${notification.booking_id}` : '/admin/notifications',
          notificationId: notification.id
        }
      });

      if (error) throw error;

      toast.success("Push notification resent successfully");
    } catch (error: any) {
      console.error("Error resending push notification:", error);
      toast.error("Failed to resend push notification");
    } finally {
      setActionLoading(false);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    if (type.includes("created") || type.includes("new")) return "📋";
    if (type.includes("confirmed")) return "✅";
    if (type.includes("assigned")) return "👨‍🔧";
    if (type.includes("completed")) return "✨";
    if (type.includes("cancelled")) return "❌";
    if (type.includes("in_progress")) return "🔧";
    return "🔔";
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    if (type.includes("created") || type.includes("new")) return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
    if (type.includes("confirmed")) return "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
    if (type.includes("assigned")) return "border-purple-500 bg-purple-50 dark:bg-purple-950/20";
    if (type.includes("completed")) return "border-green-500 bg-green-50 dark:bg-green-950/20";
    if (type.includes("cancelled")) return "border-red-500 bg-red-50 dark:bg-red-950/20";
    return "border-zinc-500 bg-zinc-50 dark:bg-zinc-950/20";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Notifications</h1>
              <p className="text-sm text-zinc-500">Manage all system notifications</p>
            </div>
          </div>
          <button
            onClick={() => fetchNotifications(currentPage, pageSize)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-zinc-500">Total</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.unread}</p>
            <p className="text-sm text-zinc-500">Unread</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.read}</p>
            <p className="text-sm text-zinc-500">Read</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Bell className="w-20 h-20 mb-4 opacity-20" />
            <p className="text-lg font-semibold mb-1">No notifications found</p>
            <p className="text-sm">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filters" 
                : "No notifications in the system yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedNotifications.length} notification(s) selected
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAsRead(selectedNotifications)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark as Read
                    </button>
                    <button
                      onClick={() => handleDelete(selectedNotifications)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-2 rounded-xl p-5 transition-all hover:shadow-md ${
                    notification.is_read
                      ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                      : getNotificationColor(notification.type)
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <span className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-base mb-1 ${
                            notification.is_read 
                              ? "text-zinc-700 dark:text-zinc-300" 
                              : "text-zinc-900 dark:text-white"
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                            <span>{formatDate(notification.created_at)}</span>
                            <span>User: {notification.user_id}</span>
                            {notification.booking_id && (
                              <span className="text-blue-600 dark:text-blue-400">
                                Booking ID: {notification.booking_id}
                              </span>
                            )}
                            {notification.order_id && (
                              <span className="text-blue-600 dark:text-blue-400">
                                Order ID: {notification.order_id}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead([notification.id])}
                              disabled={actionLoading}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleResendPush(notification)}
                            disabled={actionLoading}
                            className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            title="Resend push notification"
                          >
                            <Send className="w-4 h-4 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleDelete([notification.id])}
                            disabled={actionLoading}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
