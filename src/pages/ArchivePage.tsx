import { useState } from 'react';
import { useStore } from '../store';
import { CHECKIN_NAMES, COSTUME_NAMES } from '../types';
import ProgramSelect from '../components/ProgramSelect';

export default function ArchivePage() {
  const s = useStore();
  const archived = s.programs.filter((p) => p.status === 'archived');
  const doneShows = s.programs.filter((p) => p.status !== 'archived' && p.showStatus === 'done');
  const [programId, setProgramId] = useState(archived[0]?.id ?? '');
  const [photoCap, setPhotoCap] = useState('');
  const [nextEvent, setNextEvent] = useState('');

  const program = s.programs.find((p) => p.id === programId) ?? archived[0] ?? doneShows[0];
  const pid = program?.id ?? '';

  const rehearsals = s.rehearsals.filter((r) => r.programId === pid && Object.keys(r.checkins).length > 0);
  const costumes = s.costumes.filter((c) => c.programId === pid);
  const logs = s.formationLogs.filter((l) => l.programId === pid);
  const photos = s.photos.filter((p) => p.programId === pid);
  const members = program ? s.members.filter((m) => program.enrolledIds.includes(m.id)) : [];

  return (
    <div className="grid">
      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}><span className="icon">🗂️</span>演出档案（签到 / 服装归还 / 走位调整 / 现场照片 / 下次活动通知）</h3>
          <ProgramSelect value={pid} onChange={setProgramId} filter={(p) => p.status === 'archived' || p.showStatus === 'done'} />
        </div>

        {doneShows.length > 0 && (
          <div className="banner green mt">
            <span>🎉</span>
            <div style={{ flex: 1 }}>
              以下节目已完成演出，可归档并发布下次活动通知：
              {doneShows.map((p) => (
                <div key={p.id} className="row mt">
                  <b>{p.title}</b>
                  <input
                    style={{ maxWidth: 380 }}
                    placeholder="下次活动通知，如：10月15日晚7点新节目第一次合排"
                    value={program?.id === p.id ? nextEvent : ''}
                    onChange={(e) => { setProgramId(p.id); setNextEvent(e.target.value); }}
                  />
                  <button
                    className="btn sm primary"
                    onClick={() => {
                      s.archiveProgram(p.id, program?.id === p.id ? nextEvent.trim() : '');
                      setNextEvent('');
                    }}
                  >
                    归档并通知
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!program && <div className="muted small mt">暂无已完成的演出。</div>}

        {program && (
          <div className="grid cols-2 mt">
            <div className="card">
              <h3><span className="icon">📋</span>签到汇总</h3>
              {rehearsals.map((r) => {
                const present = Object.values(r.checkins).filter((x) => x === 'present').length;
                return (
                  <div key={r.id} className="small mb">
                    <b>{r.date} {r.slot}</b>（{r.room}）— 出席 {present}/{Object.keys(r.checkins).length}
                    <div className="muted">
                      {Object.entries(r.checkins)
                        .filter(([, st]) => st !== 'present')
                        .map(([mid, st]) => `${s.members.find((m) => m.id === mid)?.name}(${CHECKIN_NAMES[st]})`)
                        .join('、') || '全员出席'}
                    </div>
                  </div>
                );
              })}
              <div className="small mt">
                演出当天现场签到：<b>{program.showCheckinIds.length}</b> / {members.length} 人
                {program.showCheckinIds.length > 0 && (
                  <span className="muted">
                    （{program.showCheckinIds.map((id) => s.members.find((m) => m.id === id)?.name).join('、')}）
                  </span>
                )}
              </div>

              <h3 className="mt"><span className="icon">👗</span>服装归还</h3>
              {costumes.map((c) => {
                const m = s.members.find((x) => x.id === c.memberId);
                return (
                  <div key={c.id} className="small mb">
                    {m?.name}（{c.size}）— <span className={`badge ${c.status === 'returned' ? 'blue' : 'amber'}`}>{COSTUME_NAMES[c.status]}</span>
                    {c.pickedUpBy && <span className="muted"> 领取人：{c.pickedUpBy}</span>}
                    {c.depositPaid && c.status === 'returned' && <span className="muted"> · 押金应退</span>}
                  </div>
                );
              })}
            </div>

            <div>
              <div className="card">
                <h3><span className="icon">🕺</span>走位调整记录</h3>
                {logs.map((l) => (
                  <div key={l.id} className="small mb">
                    <span className="muted">{l.time}</span> {l.text}
                  </div>
                ))}
                {logs.length === 0 && <div className="small muted">暂无记录</div>}
              </div>

              <div className="card mt">
                <h3><span className="icon">📷</span>现场照片</h3>
                <div className="photo-wall">
                  {photos.map((p) => (
                    <div key={p.id} className="photo-card">
                      <div className="img">📸</div>
                      <div className="cap">
                        {p.caption}
                        <div className="muted">{p.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row mt">
                  <input
                    placeholder="照片说明，如：谢幕合影"
                    value={photoCap}
                    onChange={(e) => setPhotoCap(e.target.value)}
                  />
                  <button
                    className="btn"
                    disabled={!photoCap.trim()}
                    onClick={() => { s.addPhoto(pid, photoCap.trim()); setPhotoCap(''); }}
                  >
                    添加照片
                  </button>
                </div>
              </div>

              {program.nextEvent && (
                <div className="banner green mt">
                  <span>📅</span>
                  <div><b>下次活动通知：</b>{program.nextEvent}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
