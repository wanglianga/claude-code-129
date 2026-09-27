import { useState } from 'react';
import { useStore } from '../store';
import { STATUS_NAMES } from '../types';
import { continuity } from '../utils';

export default function StationPage() {
  const s = useStore();
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [shrinkFor, setShrinkFor] = useState<string | null>(null);
  const [newCap, setNewCap] = useState(20);
  const [scoreFor, setScoreFor] = useState<string | null>(null);
  const [score, setScore] = useState(85);
  const [passed, setPassed] = useState(true);

  return (
    <div className="grid">
      <div className="card">
        <h3><span className="icon">🏛️</span>文化站工作台 — 节目主题 / 人数 / 时长 / 音响需求 / 场地审批 / 节目审查</h3>
        <table>
          <thead>
            <tr>
              <th>节目</th><th>队伍</th><th>主题</th><th>人数</th><th>时长</th><th>音响需求</th>
              <th>场地</th><th>场地审批</th><th>节目审查</th><th>海选</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {s.programs.map((p) => {
              const team = s.teams.find((t) => t.id === p.teamId);
              return (
                <tr key={p.id}>
                  <td>
                    <b>{p.title}</b>
                    <div><span className="badge brand">{p.type}</span> <span className="badge blue">{STATUS_NAMES[p.status]}</span></div>
                  </td>
                  <td className="small">{team?.name}</td>
                  <td className="small">{p.theme}</td>
                  <td>{p.enrolledIds.length}</td>
                  <td>{p.durationMin} 分钟</td>
                  <td className="small">{p.audioNeeds}</td>
                  <td className="small">{p.venueName}<br /><span className="muted">容量 {p.venueCapacity} 人</span></td>
                  <td>
                    {p.venueApproval === 'approved' && <span className="badge green">已批准</span>}
                    {p.venueApproval === 'pending' && <span className="badge amber">待审批</span>}
                    {p.venueApproval === 'rejected' && <span className="badge red">已驳回</span>}
                  </td>
                  <td>
                    {p.reviewStatus === 'approved' && <span className="badge green">已通过</span>}
                    {p.reviewStatus === 'pending' && <span className="badge amber">待审查</span>}
                    {p.reviewStatus === 'changes' && (
                      <div>
                        <span className="badge red">要求调整</span>
                        <div className="small muted">{p.reviewNote}</div>
                      </div>
                    )}
                  </td>
                  <td>
                    {p.isAudition ? (
                      p.auditionScore !== undefined ? (
                        <div className="small">
                          <b>{p.auditionScore} 分</b>{' '}
                          {p.auditionPassed ? <span className="badge green">入围</span> : <span className="badge red">未入围</span>}
                        </div>
                      ) : (
                        <span className="badge amber">待评分</span>
                      )
                    ) : (
                      <span className="muted small">—</span>
                    )}
                  </td>
                  <td>
                    <div className="row">
                      {p.venueApproval === 'pending' && (
                        <>
                          <button className="btn sm green" onClick={() => s.approveVenue(p.id, true)}>批准场地</button>
                          <button className="btn sm ghost-danger" onClick={() => s.approveVenue(p.id, false)}>驳回</button>
                        </>
                      )}
                      {p.venueApproval === 'approved' && p.status !== 'archived' && (
                        <button className="btn sm" onClick={() => { setShrinkFor(p.id); setNewCap(Math.max(1, p.venueCapacity - 10)); }}>
                          场地缩小
                        </button>
                      )}
                      {p.reviewStatus !== 'approved' && (
                        <button className="btn sm primary" onClick={() => s.reviewProgram(p.id, true, '')}>审查通过</button>
                      )}
                      <button className="btn sm" onClick={() => { setReviewFor(p.id); setReviewNote(''); }}>要求调整</button>
                      {p.isAudition && p.auditionScore === undefined && (
                        <button className="btn sm" onClick={() => { setScoreFor(p.id); setScore(85); setPassed(true); }}>海选评分</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {shrinkFor && (
          <div className="card mt" style={{ background: '#fbf8f2' }}>
            <h3><span className="icon">📐</span>场地缩小 — {s.programs.find((p) => p.id === shrinkFor)?.title}</h3>
            <div className="row">
              <label className="small muted">新容量（人）
                <input type="number" min={1} style={{ width: 100 }} value={newCap} onChange={(e) => setNewCap(Number(e.target.value))} />
              </label>
              <button
                className="btn primary"
                onClick={() => { s.shrinkVenue(shrinkFor, newCap); setShrinkFor(null); }}
              >
                确认调整（将紧急通知队长压缩队形）
              </button>
              <button className="btn sm" onClick={() => setShrinkFor(null)}>取消</button>
            </div>
          </div>
        )}

        {reviewFor && (
          <div className="card mt" style={{ background: '#fbf8f2' }}>
            <h3><span className="icon">✏️</span>要求调整节目内容 — {s.programs.find((p) => p.id === reviewFor)?.title}</h3>
            <div className="row">
              <input
                style={{ maxWidth: 420 }}
                placeholder="调整要求，如：主题需突出重阳敬老，请修改节目立意"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
              <button
                className="btn primary"
                disabled={!reviewNote.trim()}
                onClick={() => { s.reviewProgram(reviewFor, false, reviewNote.trim()); setReviewFor(null); }}
              >
                发送调整要求
              </button>
              <button className="btn sm" onClick={() => setReviewFor(null)}>取消</button>
            </div>
          </div>
        )}

        {scoreFor && (
          <div className="card mt" style={{ background: '#fbf8f2' }}>
            <h3><span className="icon">🎤</span>社区文艺汇演海选评分 — {s.programs.find((p) => p.id === scoreFor)?.title}</h3>
            <div className="row">
              <label className="small muted">得分
                <input type="number" min={0} max={100} style={{ width: 90 }} value={score} onChange={(e) => setScore(Number(e.target.value))} />
              </label>
              <label className="row small" style={{ display: 'flex', gap: 6 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={passed} onChange={(e) => setPassed(e.target.checked)} />
                入围正式汇演
              </label>
              <button className="btn primary" onClick={() => { s.scoreAudition(scoreFor, score, passed); setScoreFor(null); }}>
                提交结果
              </button>
              <button className="btn sm" onClick={() => setScoreFor(null)}>取消</button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3><span className="icon">🔗</span>全流程连续性监督（报名 → 排练 → 走位 → 服装 → 演出审核 → 现场签到）</h3>
        {s.programs.map((p) => {
          const total = s.costumes.filter((c) => c.programId === p.id).length;
          const done = s.costumes.filter((c) => c.programId === p.id && (c.status === 'issued' || c.status === 'returned')).length;
          const stages = continuity(p, s.rehearsals, s.formations, done, total);
          const broken = stages.findIndex((st) => !st.done);
          const hasGap = broken >= 0 && stages.some((st, i) => i > broken && st.done);
          return (
            <div key={p.id} className="mb" style={{ borderBottom: '1px dashed var(--line)', paddingBottom: 14 }}>
              <div className="row mb">
                <b>{p.title}</b>
                {hasGap
                  ? <span className="badge red">流程跳跃，存在断档</span>
                  : stages.every((st) => st.done)
                    ? <span className="badge green">全流程连续</span>
                    : <span className="badge amber">进行中 · 连续</span>}
              </div>
              <div className="timeline">
                {stages.map((st) => (
                  <div key={st.key} className={`tl-step ${st.done ? 'done' : ''}`}>
                    <div className="dot" />
                    <div className="tl-label">{st.label}</div>
                    <div className="tl-detail">{st.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
