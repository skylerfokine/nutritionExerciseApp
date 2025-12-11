import React, { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function Leaderboards() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [consistent, setConsistent] = useState([]);
  const [popular, setPopular] = useState([]);

  async function load(d) {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        apiGet("/analytics/leaderboards/consistent", { days: d, limit: 10 }),
        apiGet("/analytics/leaderboards/popular-exercises", {
          days: d,
          limit: 10,
        }),
      ]);
      setConsistent(c.leaderboard || []);
      setPopular(p.leaderboard || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="container"
      style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Leaderboards</h1>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ opacity: 0.8 }}>Window</span>
          <select
            value={days}
            onChange={(e) => {
              const d = Number(e.target.value);
              setDays(d);
              load(d);
            }}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
      </div>

      <div
        className="dashboard-grid"
        style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Most consistent users */}
        <div className="dashboard-card">
          <h2 className="section-title">Most consistent users</h2>
          {loading ? (
            <div className="item-muted">Loading…</div>
          ) : consistent.length === 0 ? (
            <div className="item-muted">No data for this window.</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {consistent.map((row) => (
                <li
                  key={row.id}
                  className="item-row"
                  style={{ marginBottom: 6 }}
                >
                  <div className="item-main">
                    <span className="item-name">
                      {row.display_name || `User #${row.id}`}
                    </span>
                    <span className="item-meta">
                      {" "}
                      · {row.active_days} active day
                      {row.active_days === 1 ? "" : "s"}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Most popular exercises */}
        <div className="dashboard-card">
          <h2 className="section-title">Most popular exercises</h2>
          {loading ? (
            <div className="item-muted">Loading…</div>
          ) : popular.length === 0 ? (
            <div className="item-muted">No data for this window.</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {popular.map((row) => (
                <li
                  key={row.id}
                  className="item-row"
                  style={{ marginBottom: 6 }}
                >
                  <div className="item-main">
                    <span className="item-name">
                      {row.title || `Exercise #${row.id}`}
                    </span>
                    <span className="item-meta"> · {row.uses} uses</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
