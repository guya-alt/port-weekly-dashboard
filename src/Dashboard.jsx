import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts';

const fmt = (v) => {
  if (v === null || v === undefined) return '$0';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${Math.round(abs / 1000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

const ChartCard = ({ title, children }) => (
  <div style={{ background: '#fcfcfb', border: '1px solid #e1e0d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500', color: '#0b0b0b' }}>{title}</h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: '#fcfcfb', border: '1px solid #e1e0d9', borderRadius: '4px', padding: '8px 12px', fontSize: '12px', color: '#0b0b0b' }}>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{label}</div>
      {payload.map((e, i) => (
        <div key={i} style={{ color: e.color }}>{e.name}: {e.value > 999 ? fmt(e.value) : e.value}</div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 5 * 60 * 1000); return () => clearInterval(i); }, []);

  const fetchData = async () => {
    try {
      const url = `https://raw.githubusercontent.com/guya-alt/port-weekly-dashboard/main/data/metrics.json?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const sorted = [...json].sort((a, b) => (a.week_start || '').localeCompare(b.week_start || ''));
      setData(sorted);
      setLastUpdate(new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '500', color: '#0b0b0b' }}>Weekly metrics dashboard</h1>
        <p style={{ margin: '0', fontSize: '13px', color: '#52514e' }}>16-week performance view • Port.io sales metrics</p>
        {lastUpdate && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#898781' }}>Updated: {lastUpdate}</p>}
        {error && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d03b3b' }}>⚠ {error}</p>}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ background: '#fcfcfb', border: '1px solid #e1e0d9', borderRadius: '8px', padding: '20px 24px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#52514e' }}>Total ARR</p>
          <p style={{ margin: '0', fontSize: '36px', fontWeight: '500', color: '#0b0b0b', letterSpacing: '-0.5px' }}>$21.7M</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#898781' }}>Closed Won minus Churn • All time</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#d03b3b' }}>No data — check console</div>
      ) : (
        <>
          <ChartCard title={`Opp ARR (${data.length} weeks)`}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} margin={{ top: 24, right: 16, bottom: 70, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="week_start" tick={{ fontSize: 10, fill: '#898781' }} angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} tickFormatter={fmt} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="opp_arr" name="Opp ARR" stroke="#36A2EB" strokeWidth={2} dot={{ r: 4, fill: '#36A2EB', stroke: '#fcfcfb', strokeWidth: 2 }}>
                  <LabelList dataKey="opp_arr" position="top" formatter={fmt} style={{ fontSize: 9, fill: '#52514e' }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Meetings count">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} margin={{ top: 24, right: 16, bottom: 70, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="week_start" tick={{ fontSize: 10, fill: '#898781' }} angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="meetings_count" name="Meetings" stroke="#FF9F40" strokeWidth={2} dot={{ r: 4, fill: '#FF9F40', stroke: '#fcfcfb', strokeWidth: 2 }}>
                  <LabelList dataKey="meetings_count" position="top" style={{ fontSize: 10, fill: '#52514e' }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New signups">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} margin={{ top: 24, right: 16, bottom: 70, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="week_start" tick={{ fontSize: 10, fill: '#898781' }} angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#898781' }} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="new_signup_count" name="New signups" stroke="#9966FF" strokeWidth={2} dot={{ r: 4, fill: '#9966FF', stroke: '#fcfcfb', strokeWidth: 2 }}>
                  <LabelList dataKey="new_signup_count" position="top" style={{ fontSize: 10, fill: '#52514e' }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div style={{ fontSize: '12px', color: '#898781', marginTop: '24px', borderTop: '1px solid #e1e0d9', paddingTop: '16px' }}>
            Live dashboard • Auto-updates every Monday 9:30 AM Israel time
          </div>
        </>
      )}
    </div>
  );
}
