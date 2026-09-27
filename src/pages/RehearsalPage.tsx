import { useState } from 'react';
import { useStore } from '../store';
import { CHECKIN_NAMES, type CheckinStatus } from '../types';
import ProgramSelect from '../components/ProgramSelect';
import { isHealthWatch } from '../utils';

export default function RehearsalPage() {
  const s = useStore();
  const [programId, setProgramId] = useState('p1');
  const rehearsals = s.rehearsals.filter((r) => r.programId === programId);
  const [rehearsalId, setRehearsalId] = useState<string>('');
  const rehearsal = rehearsals.find((r) => r.id === rehearsalId) ?? rehearsals[rehearsals.length - 1];

  const [newDate, setNewDate] = useState('2026-09-28');
  const [newSlot, setNewSlot] = useState('周一晚');
  const [newRoom, setNewRoom] = useState('排练室A');
  const [ver, setVer] = useState({ version: '', note: '' });
  const [seg, setSeg] = useState({ name: '', detail: '' });

  const program = s.programs.find((p) => p.id === programId);
  const enrolled = program ? s.members.filter((m) => program.enrolledIds.includes(m.id)) : [];
  const versions = s.musicVersions.filter((v) => v.programId === programId);
  const segments = s.segments.filter((x) => x.programId === programId);
  const watchMembers = enrolled.filter(isHealthWatch);

  const presentCount = rehearsal
    ? Object.values(rehearsal.checkins).filter((x) => x === 'present').length
    : 0;

  const btnClass = (cur: CheckinStatus | undefined, target: CheckinStatus) =>
    `checkin-btn ${cur === target ? `on-${target}` : ''}`;

  return (
    <div className="grid">
      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}><span className="icon">📋</span>排练签到（平板操作）</h3>
          <ProgramSelect value={programId} onChange={(id) => { setProgramId(id); setRehearsalId(''); }} filter={(p) => p.status !== 'archived'} />
        </div>

        {watchMembers.length > 0 && (
          <div className="banner amber mt">
            <span>❤️</span>
            <div>
              <b>健康提醒：</b>本节目有 {watchMembers.length} 名需关注队员——
              {watchMembers.map((m) => `${m.name}（${m.age}岁${m.healthNotes ? '，' + m.healthNotes : ''}）`).join('；')}
              。请控制排练强度，安排间歇休息。
            </div>
          </div>
        )}

        <div className="row mt mb">
          <span className="small muted">选择排练场次：</span>
          {rehearsals.map((r) => (
            <button
              key={r.id}
              className={`chip ${rehearsal?.id === r.id ? 'picked' : ''}`}
              onClick={() => setRehearsalId(r.id)}
            >
              {r.date} {r.slot}（{r.room}）
            </button>
          ))}
          {rehearsals.length === 0 && <span className="muted small">暂无排练安排，请在下方新增。</span>}
        </div>

        {rehearsal && (
          <>
            <div className="row between mb">
              <span className="small muted">
                {rehearsal.date} {rehearsal.slot} · {rehearsal.room} —— 已出席 <b>{presentCount}</b> / {enrolled.length} 人
              </span>
              <span className="small muted">点按按钮完成签到：绿=出席，黄=请假，红=缺席</span>
            </div>
            <div className="checkin-grid">
              {enrolled.map((m) => {
                const cur = rehearsal.checkins[m.id];
                return (
                  <div key={m.id} className="checkin-card">
                    <div className="name">
                      {m.name}
                      {isHealthWatch(m) && <span className="health-tag" title={m.healthNotes || '60岁以上'}>⚠</span>}
                      {rehearsal.focusIds.includes(m.id) && <span className="badge red">重点练习</span>}
                    </div>
                    <div className="small muted">{m.age} 岁{m.healthNotes ? ` · ${m.healthNotes}` : ''}</div>
                    <div className="actions">
                      {(['present', 'leave', 'absent'] as CheckinStatus[]).map((st) => (
                        <button
                          key={st}
                          className={btnClass(cur, st)}
                          onClick={() => s.setCheckin(rehearsal.id, m.id, st)}
                        >
                          {CHECKIN_NAMES[st]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid cols-2 mt">
              <div>
                <h3><span className="icon">⭐</span>需要重点练习的成员</h3>
                <div className="member-palette">
                  {enrolled.map((m) => (
                    <button
                      key={m.id}
                      className={`chip ${rehearsal.focusIds.includes(m.id) ? 'picked' : ''}`}
                      onClick={() =>
                        s.setFocus(
                          rehearsal.id,
                          rehearsal.focusIds.includes(m.id)
                            ? rehearsal.focusIds.filter((id) => id !== m.id)
                            : [...rehearsal.focusIds, m.id],
                        )
                      }
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3><span className="icon">🗒️</span>排练记录</h3>
                <textarea
                  rows={2}
                  placeholder="本次排练情况、问题与下次重点…"
                  value={rehearsal.notes}
                  onChange={(e) => s.setRehearsalNotes(rehearsal.id, e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid cols-3">
        <div className="card">
          <h3><span className="icon">📅</span>新增排练场次</h3>
          <label className="field"><span>日期</span>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </label>
          <label className="field"><span>时段</span>
            <select value={newSlot} onChange={(e) => setNewSlot(e.target.value)}>
              {['周一晚', '周二晚', '周三晚', '周四晚', '周五晚', '周六上午', '周日下午'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="field"><span>排练室</span>
            <select value={newRoom} onChange={(e) => setNewRoom(e.target.value)}>
              {['排练室A', '排练室B'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <button
            className="btn primary"
            onClick={() => {
              if (!program) return;
              s.addRehearsal(program.id, newDate, newSlot, newRoom);
            }}
          >
            添加场次
          </button>
        </div>

        <div className="card">
          <h3><span className="icon">🎵</span>曲目版本（更新自动通知队员与音响师）</h3>
          {versions.map((v) => (
            <div key={v.id} className="small mb">
              <span className="badge blue">{v.version}</span> {v.note}
              <div className="muted">{v.time}</div>
            </div>
          ))}
          <label className="field mt"><span>新版本号</span>
            <input value={ver.version} onChange={(e) => setVer({ ...ver, version: e.target.value })} placeholder="如：v2.0 演出版" />
          </label>
          <label className="field"><span>说明</span>
            <input value={ver.note} onChange={(e) => setVer({ ...ver, note: e.target.value })} placeholder="如：时长、改动点" />
          </label>
          <button
            className="btn primary"
            onClick={() => {
              if (!ver.version.trim()) return window.alert('请填写版本号');
              s.addMusicVersion(programId, ver.version.trim(), ver.note.trim() || '无说明');
              setVer({ version: '', note: '' });
            }}
          >
            上传新版本
          </button>
        </div>

        <div className="card">
          <h3><span className="icon">🧩</span>动作分段</h3>
          {segments.map((g) => (
            <div key={g.id} className="small mb">
              <b>{g.name}</b>
              <div className="muted">{g.detail}</div>
            </div>
          ))}
          <label className="field mt"><span>分段名称</span>
            <input value={seg.name} onChange={(e) => setSeg({ ...seg, name: e.target.value })} placeholder="如：第二段 · 转身组合" />
          </label>
          <label className="field"><span>动作要点</span>
            <input value={seg.detail} onChange={(e) => setSeg({ ...seg, detail: e.target.value })} />
          </label>
          <button
            className="btn primary"
            onClick={() => {
              if (!seg.name.trim()) return window.alert('请填写分段名称');
              s.addSegment(programId, seg.name.trim(), seg.detail.trim());
              setSeg({ name: '', detail: '' });
            }}
          >
            添加分段
          </button>
        </div>
      </div>
    </div>
  );
}
