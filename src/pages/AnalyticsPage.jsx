import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/analytics')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxCount = data?.daily?.reduce((m, d) => Math.max(m, d.totalSent), 1) || 1;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={BarChart2} label="Total Notifications" value={data?.totals?.totalNotifications || 0} color="blue" />
            <StatCard icon={CheckCircle} label="Total Delivered" value={data?.totals?.totalSuccess || 0} color="green" />
            <StatCard icon={XCircle} label="Total Failed" value={data?.totals?.totalFailure || 0} color="orange" />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Notifications Sent — Last 7 Days
            </h2>

            {data?.daily?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data?.daily?.map((d) => (
                  <div key={d._id} className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0">{d._id}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${Math.max((d.totalSent / maxCount) * 100, 4)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{d.totalSent}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 w-16 text-right">{d.count} batch{d.count !== 1 ? 'es' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
