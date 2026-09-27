import { useStore } from '../store';
import { ROLE_NAMES, STATUS_NAMES } from '../types';
import { absenceImpacts, continuity, isHealthWatch } from '../utils';

export default function Dashboard({ goTab }: { goTab: (t: string) => void }) {
  const s = useStore();
  const active = s.programs.filter((p) => p.status !== 'archived');
  const pendingVenue = active.filter((p) => p.venueApproval === 'pending').length;
  const pendingReview = active.filter((p) => p.reviewStatus !== 'approved').length;
  const costumePending = s.costumes.filter(
    (c) => c.status === 'pending' || c.status === 'exchange',
  ).length;
  const healthWatch = s.members.filter(isHealthWatch);
  const impacts = active.flatMap((p) =>
    absenceImpacts(s.rehearsals, s.formations, p.id).map((i) => ({ ...i, program: p })),
  );
  const liveNotices = s.notices.filter((n) => n.kind === 'live');

  const todos: { text: string; tab: string }[] = [];
  if (s.role === 'leader') {
    if (impacts.length > 0)
      todos.push({ text: `有 ${impacts.length} 处站位受请假/缺席影响，请调整走位`, tab: 'formation' });
    if (s.programs.some((p) => p.reviewStatus === 'changes'))
      todos.push({ text: '有节目被社区要求调整内容，请修改后重新送审', tab: 'station' });
    todos.push({ text: '在平板签到页完成本次排练签到', tab: 'rehearsal' });
  } else if (s.role === 'station') {
    if (pendingVenue + pendingReview > 0)
      todos.push({ text: `待处理：场地审批 ${pendingVenue} 项、节目审查 ${pendingReview} 项`, tab: 'station' });
    todos.push({ text: '查看各节目「报名→签到」全流程连续性', tab: 'station' });
  } else if (s.role === 'costume') {
    if (costumePending > 0) todos.push({ text: `${costumePending} 套服装待发放/调换`, tab: 'costume' });
  } else if (s.role === 'sound') {
    todos.push({ text: '确认各节目最新曲目版本与音响需求', tab: 'showday' });
  } else if (s.role === 'volunteer') {
    todos.push({ text: '查看演出日候场顺序与引导分工', tab: 'showday' });
  } else {
    todos.push({ text: '查看下次排练时间与曲目版本更新', tab: 'rehearsal' });
  }

  return (
    <div className="grid">
      {liveNotices.length > 0 && (
        <div className="banner amber">
          <span>📢</span>
          <div>
            <b>现场临时通知：</b>
            {liveNotices.map((n) => (
              <div key={n.id}>{n.text}（{n.time}）</div>
            ))}
          </div>
        </div>
      )}

      <div className="grid cols-4">
        <div className="stat"><div className="num">{active.length}</div><div className="label">进行中节目</div></div>
        <div className="stat"><div className="num">{s.members.length}</div><div className="label">在册队员</div></div>
        <div className="stat"><div className="num">{pendingVenue + pendingReview}</div><div className="label">待审批/待审查</div></div>
        <div className="stat"><div className="num">{costumePending}</div><div className="label">服装待处理</div></div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3><span className="icon">🧭</span>「{ROLE_NAMES[s.role]}」今日待办</h3>
          {todos.map((t, i) => (
            <div key={i} className="row between mb">
              <span className="small">{i + 1}. {t.text}</span>
              <button className="btn sm" onClick={() => goTab(t.tab)}>前往 →</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h3><span className="icon">❤️</span>老年队员健康提醒（{healthWatch.length} 人）</h3>
          <div className="small muted mb">60 岁以上或登记了身体注意事项的队员，排练与演出当天请重点关注。</div>
          {healthWatch.map((m) => (
            <div key={m.id} className="small mb">
              <span className="health-tag">⚠ {m.name}（{m.age} 岁）</span>
              {m.healthNotes && <span className="muted"> — {m.healthNotes}</span>}
            </div>
          ))}
        </div>
      </div>

      {impacts.length > 0 && (
        <div className="banner red">
          <span>🚨</span>
          <div>
            <b>缺席影响站位：</b>
            {impacts.map((i, idx) => {
              const m = s.members.find((x) => x.id === i.memberId);
              return (
                <div key={idx}>
                  {i.program.title} · {i.formationName} · {m?.name}（{i.status === 'leave' ? '请假' : '缺席'}）
                  {i.frontRow && <b>【前排！】</b>}
                </div>
              );
            })}
            <button className="btn sm mt" onClick={() => goTab('formation')}>去调整走位 →</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3><span className="icon">📊</span>各节目流程连续性（报名 → 排练 → 走位 → 服装 → 演出审核 → 现场签到）</h3>
        {s.programs.map((p) => {
          const team = s.teams.find((t) => t.id === p.teamId);
          const total = s.costumes.filter((c) => c.programId === p.id).length;
          const done = s.costumes.filter((c) => c.programId === p.id && (c.status === 'issued' || c.status === 'returned')).length;
          const stages = continuity(p, s.rehearsals, s.formations, done, total);
          return (
            <div key={p.id} className="mb" style={{ borderBottom: '1px dashed var(--line)', paddingBottom: 14 }}>
              <div className="row between mb">
                <div className="row">
                  <b>{p.title}</b>
                  <span className="badge brand">{p.type}</span>
                  <span className="badge gray">{team?.name}</span>
                  <span className="badge blue">{STATUS_NAMES[p.status]}</span>
                  {p.isAudition && <span className="badge amber">海选节目</span>}
                </div>
                <span className="small muted">{p.enrolledIds.length} 人 · {p.durationMin} 分钟 · {p.venueName}</span>
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
