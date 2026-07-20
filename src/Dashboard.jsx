import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, children }) => (
  <div style={{ 
    background: '#fcfcfb',
    border: '1px solid #e1e0d9',
    borderRadius: '8px', 
    padding: '16px',
    marginBottom: '16px'
  }}>
    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500', color: '#0b0b0b' }}>
      {title}
    </h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fcfcfb',
        border: '1px solid #e1e0d9',
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '12px',
        color: '#0b0b0b'
      }}>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color }}>
            {entry.name}: {(entry.value || 0).toLocaleString()}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/guya-alt/port-weekly-dashboard/main/data/metrics.json');
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      setData(json);
      setLastUpdate(new Date().toLocaleString());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '500', color: '#0b0b0b' }}>
          Weekly metrics dashboard
        </h1>
        <p style={{ margin: '0', fontSize: '13px', color: '#52514e' }}>
          16-week performance view • Port.io sales metrics
        </p>
        {lastUpdate && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#898781' }}>
            Updated: {lastUpdate}
          </p>
        )}
        {error && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d03b3b' }}>
            ⚠ {error}
          </p>
        )}
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#52514e' }}>
          No data available. Check back after the first automated update.
        </div>
      ) : (
        <>
          <ChartCard title="Net new ARR">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis 
                  dataKey="week_label" 
                  tick={{ fontSize: 11, fill: '#898781' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="net_new_arr" 
                  stroke="#4BC0C0" 
                  dot={{ r: 4, fill: '#4BC0C0', stroke: '#fcfcfb', strokeWidth: 2 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Opp ARR">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="week_label" tick={{ fontSize: 11, fill: '#898781' }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="opp_arr" stroke="#36A2EB" dot={{ r: 4, fill: '#36A2EB', stroke: '#fcfcfb', strokeWidth: 2 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Meetings count">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="week_label" tick={{ fontSize: 11, fill: '#898781' }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="meetings_count" stroke="#FF9F40" dot={{ r: 4, fill: '#FF9F40', stroke: '#fcfcfb', strokeWidth: 2 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Won ARR">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="week_label" tick={{ fontSize: 11, fill: '#898781' }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="won_arr" stroke="#4BCC4B" dot={{ r: 4, fill: '#4BCC4B', stroke: '#fcfcfb', strokeWidth: 2 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New signups">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="week_label" tick={{ fontSize: 11, fill: '#898781' }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="new_signup_count" stroke="#9966FF" dot={{ r: 4, fill: '#9966FF', stroke: '#fcfcfb', strokeWidth: 2 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div style={{ 
            fontSize: '12px', 
            color: '#898781',
            marginTop: '24px',
            borderTop: '1px solid #e1e0d9',
            paddingTop: '16px'
          }}>
            Live dashboard • Auto-updates every Monday 9:30 AM Israel time
          </div>
        </>
      )}
    </div>
  );
}
