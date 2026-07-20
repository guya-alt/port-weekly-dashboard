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

const ChartCard = ({ title, color, dataKey, data, formatter }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const v = payload[0].value;
    return (
      <div style={{ background: '#fcfcfb', border: '1px solid #e1e0d9', borderRadius: '4px', padding: '8px 12px', fontSize: '12px' }}>
        <div style={{ fontWeight: '500', marginBottom: '2px', color: '#0b0b0b' }}>{label}</div>
        <div style={{ color }}>{formatter ? formatter(v) : v}</div>
      </div>
    );
  };

  return (
    <div style={{ background: '#fcfcfb', border: '1px solid #e1e0d9', borderRadius: '8px', padding: '14px 14px 8px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500', color: '#0b0b0b' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 18, right: 8, bottom: 55, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
          <XAxis dataKey="week_start" tick={{ fontSize: 9, fill: '#898781' }} angle={-45} textAnchor="end" height={60} interval={2} />
          <YAxis tick={{ fontSize: 10, fill: '#898781' }} tickFormatter={formatter || (v => v)} width={formatter ? 55 : 35} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color, stroke: '#fcfcfb', strokeWidth: 2 }}>
            <LabelList dataKey={dataKey} position="top" formatter={formatter || (v => v)} style={{ fontSize: 9, fill: '#52514e' }} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const latestArr = data.length ? data[data.length - 1]?.cumulative_arr : null;

  if (loading && data.length === 0) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '500', color: '#0b0b0b' }}>Weekly metrics dashboard</h1>
        <p style={{ margin: '0', fontSize: '12px', color: '#52514e' }}>
          15-week view • Port.io sales metrics
          {lastUpdate && <span style={{ color: '#898781' }}> • Updated: {lastUpdate}</span>}
        </p>
        {error && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d03b3b' }}>⚠ {error}</p>}
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#d03b3b' }}>No data</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <ChartCard
            title="ARR trend"
            color="#4BC0C0"
            dataKey="cumulative_arr"
            data={data}
            formatter={fmt}
          />
          <ChartCard
            title="Opp ARR"
            color="#36A2EB"
            dataKey="opp_arr"
            data={data}
            formatter={fmt}
          />
          <ChartCard
            title="Meetings count"
            color="#FF9F40"
            dataKey="meetings_count"
            data={data}
          />
          <ChartCard
            title="New signups"
            color="#9966FF"
            dataKey="new_signup_count"
            data={data}
          />
        </div>
      )}

      <div style={{ fontSize: '11px', color: '#898781', marginTop: '20px', borderTop: '1px solid #e1e0d9', paddingTop: '12px' }}>
        Live dashboard • Auto-updates every Monday 9:30 AM Israel time
      </div>
    </div>
  );
}
