import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../services/api';

const StatusBadge = ({ status }) => {
  const map = {
    sent: { icon: CheckCircle, cls: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20', label: 'Sent' },
    scheduled: { icon: Clock, cls: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', label: 'Scheduled' },
    failed: { icon: XCircle, cls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20', label: 'Failed' },
  };
  const { icon: Icon, cls, label } = map[status] || map.sent;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/notifications/history', { params: { page, limit: 20 } })
      .then(({ data }) => {
        setNotifications(data.notifications);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Notification History <span className="text-gray-400 text-lg font-normal">({total})</span>
      </h1>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse h-20 bg-gray-200 dark:bg-gray-800" />
          ))
        ) : notifications.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications sent yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="card flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                  <StatusBadge status={n.status} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                  <span>To: {n.sentTo === 'all' ? 'All users' : n.sentTo}</span>
                  {n.status === 'sent' && (
                    <>
                      <span className="text-green-500">{n.successCount} delivered</span>
                      {n.failureCount > 0 && <span className="text-red-400">{n.failureCount} failed</span>}
                    </>
                  )}
                  {n.status === 'scheduled' && (
                    <span>Scheduled: {new Date(n.scheduledAt).toLocaleString()}</span>
                  )}
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm py-1 px-3" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <button className="btn-secondary text-sm py-1 px-3" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
