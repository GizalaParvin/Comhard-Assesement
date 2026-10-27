import React from 'react';
import { getSlaInfo } from '../utils/sla';

function SlaBar({ task, nowTime }) {
  const sla = getSlaInfo(task, nowTime);

  return (
    <div className="sla-box">
      <div className="sla-labels">
        <span style={{ color: sla.color }}>{sla.statusText}</span>
        <span style={{ color: '#64748b' }}>{sla.detailText}</span>
      </div>
      <div className="sla-track">
        <div
          className="sla-fill"
          style={{
            width: `${sla.percent}%`,
            backgroundColor: sla.color
          }}
        />
      </div>
    </div>
  );
}

export default SlaBar;
