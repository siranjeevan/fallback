import { useEffect, useState } from 'react';
import { Users, Smartphone, Bell, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deviceMap = {};
  stats?.deviceBreakdown?.forEach(({ _id, count }) => { deviceMap[_id] = count; });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="blue" />
            <StatCard icon={Smartphone} label="Active Devices" value={stats?.activeDevices} color="green" />
            <StatCard icon={Bell} label="Sent Today" value={stats?.notificationsSentToday} color="purple" />
            <StatCard icon={Activity} label="Inactive" value={(stats?.totalUsers || 0) - (stats?.activeDevices || 0)} color="orange" />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Device Breakdown</h2>
            <div className="grid grid-cols-3 gap-4">
              {['android', 'ios', 'web'].map((type) => (
                <div key={type} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-2xl font-bold">{deviceMap[type] || 0}</p>
                  <p className="text-sm text-gray-500 capitalize mt-1">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
