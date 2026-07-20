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

const SmartLabel = ({ x, y, value, index, data, formatter, color }) => {
  if (value === null || value === undefined) return null;
  const label = formatter ? formatter(value) : String(value);
  const prev = index > 0 ? data[index - 1] : null;
  const next = index < data.length - 1 ? data[index + 1] : null;
  const MIN_DIFF_PX = 36;
  if (prev !== null) {
    const prevX = x - (600 / data.length);
    if (Math.abs(x - prevX) < MIN_DIFF_PX) return null;
  }
  return (
    <text x={x} y={y - 8} textAnchor="middle" fontSize={9} fill="#52514e">{label}</text>
  );
};

const sparsify = (data, dataKey, formatter) => {
  if (!data || data.length === 0) return [];
  const MIN_GAP = 3;
  const result = [];
  let lastShown = -MIN_GAP;
  data.forEach((d, i) => {
    const v = d[dataKey];
    const prev = i > 0 ? data[i - 1][dataKey] : null;
    const next = i < data.length - 1 ? data[i + 1][dataKey] : null;
    const isFirst = i === 0;
    const isLast = i === data.length - 1;
    const isPeak = prev !== null && next !== null && v >= prev && v >= next && v > prev;
    const isTrough = prev !== null && next !== null && v <= prev && v <= next && v < prev;
    const show = isFirst || isLast || isPeak || isTrough || (i - lastShown >= MIN_GAP);
    result.push(show ? (formatter ? formatter(v) : v) : '');
    if (show) lastShown = i;
  });
  return result;
};

const ChartCard = ({ title, subtitle, color, dataKey, data, formatter }) => {
  const labels = sparsify(data, dataKey, formatter);

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

  const CustomLabelRenderer = (props) => {
    const { x, y, index } = props;
    const label = labels[index];
    if (!label && label !== 0) return null;
    return <text x={x} y={y - 9} textAnchor="middle" fontSize={9} fill="#52514e">{label}</text>;
  };

  return (
    <div style={{ background: '#fcfcfb', border: '1px solid #e1e0d9', borderRadius: '8px', padding: '16px 16px 8px' }}>
      <div style={{ marginBottom: '10px' }}>
        <h3 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '500', color: '#0b0b0b' }}>{title}</h3>
        <p style={{ margin: '0', fontSize: '11px', color: '#898781' }}>{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 22, right: 10, bottom: 60, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
          <XAxis dataKey="week_start" tick={{ fontSize: 9, fill: '#898781' }} angle={-45} textAnchor="end" height={65} interval={2} />
          <YAxis tick={{ fontSize: 10, fill: '#898781' }} tickFormatter={formatter || (v => v)} width={formatter ? 58 : 35} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color, stroke: '#fcfcfb', strokeWidth: 2 }}>
            <LabelList content={CustomLabelRenderer} />
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
      const today = new Date().toISOString().substring(0, 10);
      const sorted = [...json]
        .filter(r => r.week_start && r.week_start < today)
        .sort((a, b) => a.week_start.localeCompare(b.week_start));
      setData(sorted);
      setLastUpdate(new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' }));
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (loading && data.length === 0) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '500', color: '#0b0b0b' }}>Weekly metrics dashboard</h1>
        <p style={{ margin: '0', fontSize: '12px', color: '#52514e' }}>
          {data.length}-week view • Port.io sales metrics
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
            subtitle="Cumulative net new ARR (Closed Won minus Churn)"
            color="#4BC0C0"
            dataKey="cumulative_arr"
            data={data}
            formatter={fmt}
          />
          <ChartCard
            title="Opp ARR"
            subtitle="ARR of newly qualified opportunities"
            color="#36A2EB"
            dataKey="opp_arr"
            data={data}
            formatter={fmt}
          />
          <ChartCard
            title="Meetings count"
            subtitle="New deals created"
            color="#FF9F40"
            dataKey="meetings_count"
            data={data}
          />
          <ChartCard
            title="New signups"
            subtitle="New orgs not part of an existing account"
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

