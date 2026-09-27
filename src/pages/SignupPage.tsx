import { useState } from 'react';
import { useStore } from '../store';
import { PROGRAM_TYPES, SIZES, STATUS_NAMES, TIME_SLOTS, type ProgramType } from '../types';
import ProgramSelect from '../components/ProgramSelect';
import { isHealthWatch } from '../utils';

const emptyForm = {
  name: '',
  age: 55,
  phone: '',
  size: 'M',
  availableTimes: [] as string[],
  joinShow: true,
  healthNotes: '',
};

export default function SignupPage() {
  const s = useStore();
  const [programId, setProgramId] = useState('p1');
  const [form, setForm] = useState(emptyForm);
  const [pub, setPub] = useState({
    teamId: 't1',
    title: '',
    type: '广场舞' as ProgramType,
    theme: '',
    durationMin: 5,
    audioNeeds: '',
    venueName: '社区文化广场',
    venueCapacity: 40,
    isAudition: false,
  });

  const program = s.programs.find((p) => p.id === programId);
  const enrolled = program ? s.members.filter((m) => program.enrolledIds.includes(m.id)) : [];

  const toggleTime = (t: string) =>
    setForm((f) => ({
      ...f,
      availableTimes: f.availableTimes.includes(t)
        ? f.availableTimes.filter((x) => x !== t)
        : [...f.availableTimes, t],
    }));

  const submitEnroll = () => {
    if (!program) return;
    if (!form.name.trim() || !form.phone.trim()) {
      window.alert('请填写姓名和联系方式');
      return;
    }
    s.enroll({ programId: program.id, ...form, name: form.name.trim(), phone: form.phone.trim() });
    setForm(emptyForm);
  };

  const submitPublish = () => {
    if (!pub.title.trim() || !pub.theme.trim()) {
      window.alert('请填写节目名称和主题');
      return;
    }
    s.addProgram({ ...pub, title: pub.title.trim(), theme: pub.theme.trim() });
    setPub({ ...pub, title: '', theme: '', audioNeeds: '' });
    window.alert('报名已发布，文化站将收到审批提醒。');
  };

  return (
    <div className="grid">
      <div className="grid cols-2">
        <div className="card">
          <h3><span className="icon">📣</span>队长发布报名（广场舞 / 民族舞 / 合唱伴舞 / 节庆演出）</h3>
          <div className="grid cols-2">
            <label className="field"><span>所属队伍</span>
              <select value={pub.teamId} onChange={(e) => setPub({ ...pub, teamId: e.target.value })}>
                {s.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="field"><span>节目类型</span>
              <select value={pub.type} onChange={(e) => setPub({ ...pub, type: e.target.value as ProgramType })}>
                {PROGRAM_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <label className="field"><span>节目名称</span>
            <input value={pub.title} onChange={(e) => setPub({ ...pub, title: e.target.value })} placeholder="如：《红红火火迎国庆》" />
          </label>
          <label className="field"><span>节目主题</span>
            <input value={pub.theme} onChange={(e) => setPub({ ...pub, theme: e.target.value })} placeholder="如：国庆联欢 · 歌颂祖国" />
          </label>
          <div className="grid cols-2">
            <label className="field"><span>时长（分钟）</span>
              <input type="number" min={1} value={pub.durationMin} onChange={(e) => setPub({ ...pub, durationMin: Number(e.target.value) })} />
            </label>
            <label className="field"><span>拟用场地</span>
              <input value={pub.venueName} onChange={(e) => setPub({ ...pub, venueName: e.target.value })} />
            </label>
          </div>
          <label className="field"><span>音响需求</span>
            <input value={pub.audioNeeds} onChange={(e) => setPub({ ...pub, audioNeeds: e.target.value })} placeholder="如：U盘播放、无线话筒1支" />
          </label>
          <label className="field row" style={{ display: 'flex', gap: 8 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={pub.isAudition} onChange={(e) => setPub({ ...pub, isAudition: e.target.checked })} />
            <span style={{ margin: 0 }}>参加社区文艺汇演海选</span>
          </label>
          <button className="btn primary" onClick={submitPublish}>发布报名</button>
        </div>

        <div className="card">
          <h3><span className="icon">📝</span>队员报名（记录年龄 / 联系方式 / 尺码 / 可排练时间 / 是否参演 / 身体注意事项）</h3>
          <label className="field"><span>选择节目</span>
            <ProgramSelect value={programId} onChange={setProgramId} filter={(p) => p.status !== 'archived'} />
          </label>
          <div className="grid cols-2">
            <label className="field"><span>姓名</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field"><span>年龄</span>
              <input type="number" min={18} max={90} value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
            </label>
          </div>
          <div className="grid cols-2">
            <label className="field"><span>联系方式</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="手机号" />
            </label>
            <label className="field"><span>服装尺码</span>
              <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                {SIZES.map((z) => <option key={z}>{z}</option>)}
              </select>
            </label>
          </div>
          <div className="field" style={{ marginBottom: 10 }}>
            <span className="small muted">可排练时间</span>
            <div className="row mt">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  className={`chip ${form.availableTimes.includes(t) ? 'picked' : ''}`}
                  onClick={() => toggleTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <label className="field row" style={{ display: 'flex', gap: 8 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={form.joinShow} onChange={(e) => setForm({ ...form, joinShow: e.target.checked })} />
            <span style={{ margin: 0 }}>参加正式演出</span>
          </label>
          <label className="field"><span>身体注意事项</span>
            <input value={form.healthNotes} onChange={(e) => setForm({ ...form, healthNotes: e.target.value })} placeholder="如：高血压、膝盖旧伤（无则留空）" />
          </label>
          <button className="btn primary" onClick={submitEnroll} disabled={!program || program.status === 'archived'}>
            提交报名
          </button>
        </div>
      </div>

      {program && (
        <div className="card">
          <h3>
            <span className="icon">👥</span>
            {program.title} · 已报名 {enrolled.length} 人
            <span className="badge blue">{STATUS_NAMES[program.status]}</span>
            {program.isAudition && <span className="badge amber">海选节目</span>}
          </h3>
          <table>
            <thead>
              <tr>
                <th>姓名</th><th>年龄</th><th>联系方式</th><th>尺码</th><th>可排练时间</th><th>正式演出</th><th>身体注意事项</th><th></th>
              </tr>
            </thead>
            <tbody>
              {enrolled.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.name}</b>{' '}
                    {isHealthWatch(m) && <span className="health-tag" title="健康关注">⚠</span>}
                  </td>
                  <td>{m.age}</td>
                  <td>{m.phone}</td>
                  <td><span className="badge gray">{m.size}</span></td>
                  <td className="small">{m.availableTimes.join('、') || '—'}</td>
                  <td>{m.joinShow ? <span className="badge green">参加</span> : <span className="badge gray">不参演</span>}</td>
                  <td className="small">{m.healthNotes || '—'}</td>
                  <td>
                    <button
                      className="btn sm ghost-danger"
                      onClick={() => {
                        if (window.confirm(`确定取消 ${m.name} 的报名吗？`)) s.unenroll(program.id, m.id);
                      }}
                    >
                      取消报名
                    </button>
                  </td>
                </tr>
              ))}
              {enrolled.length === 0 && (
                <tr><td colSpan={8} className="muted small">暂无报名，使用上方表单添加队员。</td></tr>
              )}
            </tbody>
          </table>
          <div className="row mt">
            <span className="small muted">队长操作：</span>
            {program.status === 'signup' && (
              <button className="btn sm primary" onClick={() => s.setProgramStatus(program.id, 'rehearsing')}>
                报名截止，开始排练 →
              </button>
            )}
            {program.status === 'rehearsing' && (
              <button className="btn sm primary" onClick={() => s.setProgramStatus(program.id, 'ready')}>
                排练完成，转入待演出 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
