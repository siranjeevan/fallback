import { useEffect, useState, useCallback } from 'react';
import { Search, Download, Smartphone, Monitor, Apple, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const DeviceIcon = ({ type }) => {
  if (type === 'android') return <Smartphone className="w-4 h-4 text-green-500" />;
  if (type === 'ios') return <Apple className="w-4 h-4 text-gray-500" />;
  return <Monitor className="w-4 h-4 text-blue-500" />;
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page, limit: 20, search, deviceType } });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, deviceType]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleExport = async () => {
    const res = await api.get('/users/export', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, email, userId..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input w-auto"
          value={deviceType}
          onChange={(e) => { setDeviceType(e.target.value); setPage(1); }}
        >
          <option value="">All Devices</option>
          <option value="android">Android</option>
          <option value="ios">iOS</option>
          <option value="web">Web</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Device</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">FCM Token</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{u.name || '—'}</p>
                        <p className="text-gray-400 text-xs">{u.email || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.userId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 capitalize">
                        <DeviceIcon type={u.deviceType} />
                        {u.deviceType}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[160px] truncate">
                      {u.fcmToken}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                className="btn-secondary text-sm py-1 px-3"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <button
                className="btn-secondary text-sm py-1 px-3"
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
