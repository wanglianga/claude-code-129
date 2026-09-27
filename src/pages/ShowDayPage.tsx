import { useState } from 'react';
import { useStore } from '../store';
import { ALL_ROLES } from '../types';
import { isHealthWatch } from '../utils';

export default function ShowDayPage() {
  const s = useStore();
  const [notice, setNotice] = useState('');
  const [checkinProgram, setCheckinProgram] = useState<string | null>(null);

  // 候场队列：场地与审查均已通过、未归档的节目
  const queue = s.programs
    .filter((p) => p.status !== 'archived' && p.venueApproval === 'approved' && p.reviewStatus === 'approved')
    .sort((a, b) => a.queueOrder - b.queueOrder);

  const liveNotices = s.notices.filter((n) => n.kind === 'live');

  const postLive = () => {
    if (!notice.trim()) return;
    s.postNotice(ALL_ROLES, notice.trim(), 'live');
    setNotice('');
  };

  return (
    <div className="grid">
      <div className="banner blue">
        <span>🎪</span>
        <div>
          <b>演出日现场台：</b>候场顺序、志愿者引导、现场签到与临时通知在这里统一发布，
          所有角色（队长 / 队员 / 服装 / 文化站 / 音响师 / 志愿者）同步可见。
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3><span className="icon">🪑</span>候场顺序</h3>
          {queue.map((p, idx) => {
            const team = s.teams.find((t) => t.id === p.teamId);
            const latestVer = s.musicVersions.filter((v) => v.programId === p.id).slice(-1)[0];
            return (
              <div key={p.id} className={`queue-item ${p.showStatus}`}>
                <div className="queue-order">{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="row">
                    <b>{p.title}</b>
                    <span className="badge gray">{team?.name}</span>
                    {p.showStatus === 'waiting' && <span className="badge amber">候场中</span>}
                    {p.showStatus === 'onstage' && <span className="badge green">正在上场</span>}
                    {p.showStatus === 'done' && <span className="badge blue">已完成</span>}
                  </div>
                  <div className="small muted">
                    {p.enrolledIds.length} 人 · {p.durationMin} 分钟 · 音响：{p.audioNeeds}
                    {latestVer && <span> · 曲目：{latestVer.version}</span>}
                  </div>
                  <div className="row mt">
                    <span className="small muted">引导：</span>
                    <input
                      style={{ maxWidth: 160, padding: '3px 8px' }}
                      value={p.guide}
                      placeholder="指派志愿者"
                      onChange={(e) => s.setGuide(p.id, e.target.value)}
                    />
                    <button className="btn sm" onClick={() => setCheckinProgram(checkinProgram === p.id ? null : p.id)}>
                      现场签到（{p.showCheckinIds.length}/{p.enrolledIds.length}）
                    </button>
                  </div>
                </div>
                <div className="row" style={{ flexDirection: 'column', gap: 4 }}>
                  <div className="row">
                    <button className="btn sm" disabled={idx === 0} onClick={() => s.moveQueue(p.id, -1)}>↑</button>
                    <button className="btn sm" disabled={idx === queue.length - 1} onClick={() => s.moveQueue(p.id, 1)}>↓</button>
                  </div>
                  {p.showStatus === 'waiting' && (
                    <button className="btn sm green" onClick={() => s.setShowStatus(p.id, 'onstage')}>上场</button>
                  )}
                  {p.showStatus === 'onstage' && (
                    <button className="btn sm primary" onClick={() => s.setShowStatus(p.id, 'done')}>完成</button>
                  )}
                </div>
              </div>
            );
          })}
          {queue.length === 0 && <div className="muted small">暂无已获批的演出节目。</div>}
        </div>

        <div>
          <div className="card">
            <h3><span className="icon">📢</span>发布现场临时通知（全员可见）</h3>
            <div className="row">
              <input
                placeholder="如：因天气原因，演出提前 15 分钟开始，请第 1、2 个节目立即候场"
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && postLive()}
              />
              <button className="btn primary" onClick={postLive}>发布</button>
            </div>
            <div className="mt">
              {liveNotices.map((n) => (
                <div key={n.id} className="notice-item live">
                  <div>{n.text}</div>
                  <div className="time">{n.time}</div>
                </div>
              ))}
              {liveNotices.length === 0 && <div className="muted small">暂无现场通知</div>}
            </div>
          </div>

          {checkinProgram && (
            <div className="card mt">
              {(() => {
                const p = s.programs.find((x) => x.id === checkinProgram);
                if (!p) return null;
                const members = s.members.filter((m) => p.enrolledIds.includes(m.id));
                const watch = members.filter(isHealthWatch);
                return (
                  <>
                    <h3><span className="icon">✅</span>{p.title} · 现场签到</h3>
                    {watch.length > 0 && (
                      <div className="banner amber">
                        <span>❤️</span>
                        <div>健康关注：{watch.map((m) => m.name).join('、')}，请志愿者引导至候场休息区就座。</div>
                      </div>
                    )}
                    <div className="member-palette">
                      {members.map((m) => {
                        const on = p.showCheckinIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            className={`chip ${on ? 'picked' : ''}`}
                            onClick={() => s.toggleShowCheckin(p.id, m.id)}
                          >
                            {m.name} {on ? '✓' : ''}
                            {isHealthWatch(m) ? ' ⚠' : ''}
                          </button>
                        );
                      })}
                    </div>
                    <div className="small muted mt">
                      已签到 {p.showCheckinIds.length} / {members.length} 人
                      {p.showCheckinIds.length < members.length && (
                        <span className="health-tag"> — 缺 {members.length - p.showCheckinIds.length} 人，队长请到「走位编排」确认站位影响</span>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
