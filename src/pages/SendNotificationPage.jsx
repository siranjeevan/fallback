import { useState, useEffect } from 'react';
import { Send, Users, User, CheckSquare, Clock, Image } from 'lucide-react';
import api from '../services/api';

export default function SendNotificationPage() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    image: '',
    target: 'all', // 'all' | 'specific' | 'selected'
    specificUserId: '',
    scheduledAt: '',
  });
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (form.target === 'selected') {
      api.get('/users', { params: { limit: 100 } }).then(({ data }) => setUsers(data.users));
    }
  }, [form.target]);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');

    let userIds = [];
    if (form.target === 'specific') userIds = [form.specificUserId];
    if (form.target === 'selected') userIds = selectedIds;

    try {
      const payload = {
        title: form.title,
        message: form.message,
        ...(form.image && { image: form.image }),
        ...(userIds.length && { userIds }),
        ...(form.scheduledAt && { scheduledAt: form.scheduledAt }),
      };
      const { data } = await api.post('/notifications/send', payload);
      setResult(data);
      setForm({ title: '', message: '', image: '', target: 'all', specificUserId: '', scheduledAt: '' });
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Send Notification</h1>

      {result && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm">
          {result.notification?.status === 'scheduled'
            ? `Notification scheduled for ${new Date(result.notification.scheduledAt).toLocaleString()}`
            : `Sent to ${result.results?.success || 0} devices. ${result.results?.failure || 0} failed.`}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            className="input"
            placeholder="Notification title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message *</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Notification message body"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
            <Image className="w-4 h-4" /> Image URL (optional)
          </label>
          <input
            className="input"
            placeholder="https://example.com/image.png"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium mb-2">Send To</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'all', icon: Users, label: 'All Users' },
              { value: 'specific', icon: User, label: 'Specific User' },
              { value: 'selected', icon: CheckSquare, label: 'Select Users' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, target: value })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                  form.target === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {form.target === 'specific' && (
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              className="input"
              placeholder="Enter user ID"
              value={form.specificUserId}
              onChange={(e) => setForm({ ...form, specificUserId: e.target.value })}
              required
            />
          </div>
        )}

        {form.target === 'selected' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Users ({selectedIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u.userId)}
                    onChange={() => toggleUser(u.userId)}
                    className="rounded"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{u.name || u.userId}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Schedule (optional)
          </label>
          <input
            type="datetime-local"
            className="input"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          disabled={loading}
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : form.scheduledAt ? 'Schedule Notification' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
}
