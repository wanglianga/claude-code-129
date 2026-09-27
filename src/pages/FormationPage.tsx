import { useState } from 'react';
import { useStore } from '../store';
import ProgramSelect from '../components/ProgramSelect';
import { absenceImpacts, cellLabel, latestRehearsal } from '../utils';

export default function FormationPage() {
  const s = useStore();
  const [programId, setProgramId] = useState('p1');
  const formations = s.formations.filter((f) => f.programId === programId);
  const [formationId, setFormationId] = useState('');
  const formation = formations.find((f) => f.id === formationId) ?? formations[0];
  const [pickedMember, setPickedMember] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [newF, setNewF] = useState({ name: '', rows: 3, cols: 4 });

  const program = s.programs.find((p) => p.id === programId);
  const enrolled = program ? s.members.filter((m) => program.enrolledIds.includes(m.id)) : [];
  const latest = latestRehearsal(s.rehearsals, programId);
  const impacts = absenceImpacts(s.rehearsals, s.formations, programId);
  const logs = s.formationLogs.filter((l) => l.programId === programId);

  const placedIds = new Set(formation ? Object.values(formation.positions) : []);
  const placedCount = placedIds.size;
  const overCapacity = program ? placedCount > program.venueCapacity : false;

  const statusOf = (mid: string) => (latest ? latest.checkins[mid] : undefined);

  const cellClick = (cell: string) => {
    if (!formation) return;
    if (pickedMember) {
      s.setPosition(formation.id, cell, pickedMember);
      setPickedMember(null);
    } else {
      setSelectedCell(cell === selectedCell ? null : cell);
    }
  };

  // 可补位队员：最近一次排练出席、且未进入当前队形
  const standbys = enrolled.filter((m) => !placedIds.has(m.id) && statusOf(m.id) === 'present');

  return (
    <div className="grid">
      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}><span className="icon">🕺</span>走位编排（第 1 排为前排，面向观众）</h3>
          <ProgramSelect value={programId} onChange={(id) => { setProgramId(id); setFormationId(''); setPickedMember(null); setSelectedCell(null); }} filter={(p) => p.status !== 'archived'} />
        </div>

        {program && overCapacity && (
          <div className="banner red mt">
            <span>🚨</span>
            <div>
              <b>场地容量不足：</b>当前队形 {placedCount} 人，场地「{program.venueName}」仅容纳 {program.venueCapacity} 人。
              请缩减队形规模（调整排/列）或减少上场人数。
            </div>
          </div>
        )}
        {program && program.venueApproval === 'approved' && !overCapacity && (
          <div className="banner green mt">
            <span>✅</span>
            <div>场地「{program.venueName}」容量 {program.venueCapacity} 人，当前队形 {placedCount} 人，符合要求。</div>
          </div>
        )}

        {impacts.length > 0 && (
          <div className="banner red">
            <span>🚨</span>
            <div style={{ flex: 1 }}>
              <b>缺席影响 {impacts.length} 处站位（基于最近一次排练签到）：</b>
              {impacts.map((i, idx) => {
                const m = s.members.find((x) => x.id === i.memberId);
                return (
                  <div key={idx} className="mt">
                    {m?.name}（{i.status === 'leave' ? '请假' : '缺席'}）— {i.formationName} · {cellLabel(i.cell)}
                    {i.frontRow && <b className="health-tag">【前排空缺，优先补位！】</b>}
                  </div>
                );
              })}
              {standbys.length > 0 && (
                <div className="mt small">
                  可补位（上次出席且未站位）：
                  {standbys.map((m) => (
                    <button
                      key={m.id}
                      className="chip ok"
                      style={{ marginLeft: 6 }}
                      onClick={() => setPickedMember(m.id)}
                    >
                      {m.name}
                    </button>
                  ))}
                  <span className="muted"> — 点选人名后，再点网格空位即可补位</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="row mt mb">
          <span className="small muted">队形：</span>
          {formations.map((f) => (
            <button
              key={f.id}
              className={`chip ${formation?.id === f.id ? 'picked' : ''}`}
              onClick={() => { setFormationId(f.id); setSelectedCell(null); }}
            >
              {f.name}（{f.rows}×{f.cols}）
            </button>
          ))}
        </div>

        {formation && (
          <div className="grid cols-2">
            <div>
              <div className="stage">
                <div className="audience">—— 观 众 席 · 前 排 在 上 ——</div>
                <div className="formation-grid" style={{ gridTemplateColumns: `repeat(${formation.cols}, 1fr)` }}>
                  {Array.from({ length: formation.rows * formation.cols }, (_, i) => {
                    const r = Math.floor(i / formation.cols);
                    const cIdx = i % formation.cols;
                    const cell = `${r}-${cIdx}`;
                    const mid = formation.positions[cell];
                    const m = mid ? s.members.find((x) => x.id === mid) : undefined;
                    const st = mid ? statusOf(mid) : undefined;
                    const bad = st === 'leave' || st === 'absent';
                    return (
                      <div
                        key={cell}
                        className={[
                          'cell',
                          r === 0 ? 'front' : '',
                          bad ? 'absent' : '',
                          m ? '' : 'empty',
                          selectedCell === cell ? 'selected' : '',
                        ].join(' ')}
                        onClick={() => cellClick(cell)}
                        title={cellLabel(cell)}
                      >
                        <span className="pos">{r + 1}-{cIdx + 1}{r === 0 ? ' · 前排' : ''}</span>
                        <span className="who">{m ? m.name : '空位'}</span>
                        {bad && <span className="badge red">{st === 'leave' ? '请假' : '缺席'}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="row mt">
                <span className="small muted">调整规模：</span>
                <button className="btn sm" onClick={() => s.resizeFormation(formation.id, Math.max(1, formation.rows - 1), formation.cols)}>− 一排</button>
                <button className="btn sm" onClick={() => s.resizeFormation(formation.id, formation.rows + 1, formation.cols)}>＋ 一排</button>
                <button className="btn sm" onClick={() => s.resizeFormation(formation.id, formation.rows, Math.max(1, formation.cols - 1))}>− 一列</button>
                <button className="btn sm" onClick={() => s.resizeFormation(formation.id, formation.rows, formation.cols + 1)}>＋ 一列</button>
                {selectedCell && formation.positions[selectedCell] && (
                  <button className="btn sm ghost-danger" onClick={() => { s.setPosition(formation.id, selectedCell, null); setSelectedCell(null); }}>
                    清空 {cellLabel(selectedCell)}
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3><span className="icon">👇</span>队员站位（先点人，再点格子）</h3>
              <div className="member-palette mb">
                {enrolled.map((m) => {
                  const st = statusOf(m.id);
                  const bad = st === 'leave' || st === 'absent';
                  return (
                    <button
                      key={m.id}
                      className={`chip ${pickedMember === m.id ? 'picked' : ''} ${bad ? 'warn' : ''}`}
                      onClick={() => setPickedMember(pickedMember === m.id ? null : m.id)}
                      title={st ? `上次排练：${st === 'present' ? '出席' : st === 'leave' ? '请假' : '缺席'}` : '上次排练未签到'}
                    >
                      {m.name}
                      {placedIds.has(m.id) ? ' ✓' : ''}
                      {bad ? ' ⚠' : ''}
                    </button>
                  );
                })}
              </div>
              <div className="small muted mb">
                {pickedMember
                  ? `已选中 ${s.members.find((m) => m.id === pickedMember)?.name}，点击左侧网格放置。`
                  : '点击队员名字后，再点击网格中的位置完成站位；点击空格可查看位置编号。'}
              </div>
              <div className="small">
                已站位 <b>{placedCount}</b> / {enrolled.length} 人
                {latest && <span className="muted">（参照 {latest.date} 签到）</span>}
              </div>

              <h3 className="mt"><span className="icon">📜</span>走位调整记录</h3>
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {logs.map((l) => (
                  <div key={l.id} className="small mb">
                    <span className="muted">{l.time}</span> {l.text}
                  </div>
                ))}
                {logs.length === 0 && <div className="small muted">暂无调整记录</div>}
              </div>
            </div>
          </div>
        )}

        <div className="card mt" style={{ background: '#fbf8f2' }}>
          <h3><span className="icon">➕</span>新增队形（队形变化：开场 / 高潮 / 收尾可多套）</h3>
          <div className="row">
            <input style={{ maxWidth: 220 }} placeholder="队形名称，如：收尾 · 一字排开" value={newF.name} onChange={(e) => setNewF({ ...newF, name: e.target.value })} />
            <label className="small muted">排数
              <input type="number" min={1} max={8} style={{ width: 70 }} value={newF.rows} onChange={(e) => setNewF({ ...newF, rows: Number(e.target.value) })} />
            </label>
            <label className="small muted">列数
              <input type="number" min={1} max={10} style={{ width: 70 }} value={newF.cols} onChange={(e) => setNewF({ ...newF, cols: Number(e.target.value) })} />
            </label>
            <button
              className="btn primary"
              onClick={() => {
                if (!newF.name.trim()) return window.alert('请填写队形名称');
                s.addFormation(programId, newF.name.trim(), newF.rows, newF.cols);
                setNewF({ name: '', rows: 3, cols: 4 });
              }}
            >
              创建队形
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
