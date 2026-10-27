import React, { useState } from 'react';
import { formatDuration, getSlaInfo } from '../utils/sla';

function Dashboard({
  tasks,
  sections,
  overallStats,
  sectionStats,
  nowTime,
  search,
  setSearch,
  filterStage,
  setFilterStage,
  filterPriority,
  setFilterPriority,
  filterSection,
  setFilterSection,
  onOpenCreateModal,
  onSeedSampleTasks
}) {
  const [showStats, setShowStats] = useState(true);

  // Calculate dashboard counts
  let allocated = 0;
  let working = 0;
  let completed = 0;
  let atRisk = 0;
  let breached = 0;

  tasks.forEach((task) => {
    const sla = getSlaInfo(task, nowTime);
    if (task.stage === 'Allocated') allocated++;
    if (task.stage === 'Working') working++;
    if (task.stage === 'Completed') {
      completed++;
      if (sla.isBreached) breached++;
    } else {
      if (sla.percent >= 80 && sla.percent <= 100 && !sla.isBreached) atRisk++;
      if (sla.isBreached) breached++;
    }
  });

  const allSectionNames = ['General', ...sections.map((s) => s.name)];

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="small"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
        >
          {showStats ? '▲ Hide Analytics' : '▼ Show Analytics & SLA Metrics'}
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onSeedSampleTasks}
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: '0.82rem' }}
          >
            ↻ Load Demo Data
          </button>
          <button className="primary" onClick={onOpenCreateModal} style={{ fontSize: '0.85rem' }}>
            + Add Task
          </button>
        </div>
      </div>

      {/* KPI Count Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Tasks</div>
          <div className="value">{tasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Allocated</div>
          <div className="value" style={{ color: 'var(--text-muted)' }}>{allocated}</div>
        </div>
        <div className="stat-card">
          <div className="label">Working</div>
          <div className="value" style={{ color: 'var(--primary)' }}>{working}</div>
        </div>
        <div className="stat-card">
          <div className="label">Completed</div>
          <div className="value" style={{ color: '#16a34a' }}>{completed}</div>
        </div>
        <div className="stat-card">
          <div className="label">At Risk (&gt;80%)</div>
          <div className="value" style={{ color: '#ea580c' }}>{atRisk}</div>
        </div>
        <div className="stat-card">
          <div className="label">Overdue / Breached</div>
          <div className="value" style={{ color: '#dc2626' }}>{breached}</div>
        </div>
      </div>

      {/* Collapsible Analytics & Section Stats Panel */}
      {showStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Overall SLA Stats for completed tasks */}
          <div style={{ background: 'var(--bg-card)', padding: '18px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Performance & SLA Analytics
              </strong>
              <span className="badge badge-completed" style={{ fontSize: '0.72rem' }}>
                {overallStats?.totalCompleted || 0} Completed
              </span>
            </div>

            {overallStats && overallStats.totalCompleted > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Avg Completion Time:</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                    {formatDuration(overallStats.avgCompletionTimeMs)}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Avg SLA Time Given:</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                    {formatDuration(overallStats.avgSlaTimeGivenMs)}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>
                    Avg SLA Used (Total ÷ Given):
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                    {Math.round(overallStats.avgSlaUsedPercent || 0)}%
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>On-Time Rate:</span>
                  <strong style={{ fontSize: '1rem', color: overallStats.onTimePercent >= 80 ? '#16a34a' : '#ea580c' }}>
                    {Math.round(overallStats.onTimePercent || 0)}%
                  </strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Fastest Completion:</span>
                  <strong style={{ fontSize: '0.88rem', color: '#16a34a' }}>
                    {formatDuration(overallStats.fastestCompletionMs)}
                  </strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Slowest Completion:</span>
                  <strong style={{ fontSize: '0.88rem', color: '#ea580c' }}>
                    {formatDuration(overallStats.slowestCompletionMs)}
                  </strong>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
                No completed tasks yet. Mark tasks as Completed to see SLA performance metrics.
              </div>
            )}
          </div>

          {/* Section Averages Stats Table */}
          <div style={{ background: 'var(--bg-card)', padding: '18px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Average Completion Time by Section
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click row to filter</span>
            </div>

            <table style={{ fontSize: '0.8rem', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 8px' }}>Section</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Total</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Working</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Overdue</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Completed</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {allSectionNames.map((name) => {
                  const sStat = (sectionStats || []).find((s) => s.section === name);
                  const avgText = sStat && sStat.avgDurationMs ? formatDuration(sStat.avgDurationMs) : 'N/A';
                  const secTasks = tasks.filter((t) => (t.section || 'General') === name);
                  const secWorking = secTasks.filter((t) => t.stage === 'Working').length;
                  const secCompleted = secTasks.filter((t) => t.stage === 'Completed').length;
                  const secBreached = secTasks.filter((t) => getSlaInfo(t, nowTime).isBreached).length;
                  const isSelected = filterSection === name;

                  return (
                    <tr
                      key={name}
                      onClick={() => setFilterSection(isSelected ? 'All' : name)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'var(--primary-light)' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                      title={`Click to filter by ${name}`}
                    >
                      <td style={{ padding: '6px 8px' }}>
                        <strong style={{ color: isSelected ? 'var(--primary)' : 'inherit' }}>
                          {name} {isSelected && '✓'}
                        </strong>
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>{secTasks.length}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#0284c7' }}>{secWorking}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: secBreached > 0 ? '#dc2626' : 'inherit' }}>
                        {secBreached}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#16a34a' }}>
                        {sStat ? sStat.taskCount : secCompleted}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{avgText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
          <option value="All">Stage: All</option>
          <option value="Allocated">Allocated</option>
          <option value="Working">Working</option>
          <option value="Completed">Completed</option>
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="All">Priority: All</option>
          <option value="High">Priority: High</option>
          <option value="Medium">Priority: Medium</option>
          <option value="Low">Priority: Low</option>
        </select>

        <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
          <option value="All">Section: All</option>
          {allSectionNames.map((secName) => (
            <option key={secName} value={secName}>Section: {secName}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch('');
            setFilterStage('All');
            setFilterPriority('All');
            setFilterSection('All');
          }}
          className="small"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
