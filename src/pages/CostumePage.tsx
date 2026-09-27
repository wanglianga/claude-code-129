import { useState } from 'react';
import { useStore } from '../store';
import { COSTUME_NAMES, SIZES } from '../types';
import ProgramSelect from '../components/ProgramSelect';

export default function CostumePage() {
  const s = useStore();
  const [programId, setProgramId] = useState('p1');
  const [pickupFor, setPickupFor] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [exchangeFor, setExchangeFor] = useState<string | null>(null);
  const [exchangeNote, setExchangeNote] = useState('');
  const [reissueSize, setReissueSize] = useState<Record<string, string>>({});

  const program = s.programs.find((p) => p.id === programId);
  const records = s.costumes.filter((c) => c.programId === programId);
  const memberOf = (mid: string) => s.members.find((m) => m.id === mid);

  const issued = records.filter((c) => c.status === 'issued').length;
  const returned = records.filter((c) => c.status === 'returned').length;
  const exchange = records.filter((c) => c.status === 'exchange').length;
  const deposits = records.filter((c) => c.depositPaid).length;

  return (
    <div className="grid">
      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}><span className="icon">👗</span>服装管理（发放 / 调换 / 押金 / 家属代领 / 归还）</h3>
          <ProgramSelect value={programId} onChange={setProgramId} />
        </div>

        <div className="grid cols-4 mt mb">
          <div className="stat"><div className="num">{issued}</div><div className="label">已发放</div></div>
          <div className="stat"><div className="num">{exchange}</div><div className="label">调换中</div></div>
          <div className="stat"><div className="num">{returned}</div><div className="label">已归还</div></div>
          <div className="stat"><div className="num">{deposits}/{records.length}</div><div className="label">押金已收（¥50/套）</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>队员</th><th>尺码</th><th>押金</th><th>状态</th><th>领取人</th><th>备注</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((c) => {
              const m = memberOf(c.memberId);
              if (!m) return null;
              return (
                <tr key={c.id}>
                  <td><b>{m.name}</b></td>
                  <td><span className="badge gray">{c.size}</span></td>
                  <td>
                    {c.depositPaid ? (
                      <span className="badge green">已收</span>
                    ) : (
                      <button className="btn sm" onClick={() => s.payDeposit(c.id)}>收押金</button>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'issued' ? 'green' : c.status === 'exchange' ? 'red' : c.status === 'returned' ? 'blue' : 'amber'}`}>
                      {COSTUME_NAMES[c.status]}
                    </span>
                  </td>
                  <td className="small">{c.pickedUpBy || '—'}</td>
                  <td className="small">{c.note || '—'}</td>
                  <td>
                    <div className="row">
                      {c.status === 'pending' && (
                        <button className="btn sm primary" onClick={() => { setPickupFor(c.id); setFamilyName(''); }}>
                          发放
                        </button>
                      )}
                      {(c.status === 'issued' || c.status === 'pending') && (
                        <button className="btn sm" onClick={() => { setExchangeFor(c.id); setExchangeNote(''); }}>
                          尺码调换
                        </button>
                      )}
                      {c.status === 'exchange' && (
                        <>
                          <select
                            style={{ width: 80 }}
                            value={reissueSize[c.id] ?? c.size}
                            onChange={(e) => setReissueSize({ ...reissueSize, [c.id]: e.target.value })}
                          >
                            {SIZES.map((z) => <option key={z}>{z}</option>)}
                          </select>
                          <button
                            className="btn sm green"
                            onClick={() => s.reissueCostume(c.id, reissueSize[c.id] ?? c.size)}
                          >
                            换发完成
                          </button>
                        </>
                      )}
                      {c.status === 'issued' && (
                        <button className="btn sm" onClick={() => s.returnCostume(c.id)}>
                          登记归还
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {records.length === 0 && (
              <tr><td colSpan={7} className="muted small">该节目暂无服装记录（报名后自动生成）。</td></tr>
            )}
          </tbody>
        </table>

        {pickupFor && (
          <div className="card mt" style={{ background: '#fbf8f2' }}>
            <h3><span className="icon">🤝</span>发放确认 — {memberOf(records.find((c) => c.id === pickupFor)?.memberId ?? '')?.name}</h3>
            <div className="row">
              <button
                className="btn primary"
                onClick={() => { s.issueCostume(pickupFor, '本人'); setPickupFor(null); }}
              >
                本人领取
              </button>
              <span className="small muted">或家属代领：</span>
              <input
                style={{ maxWidth: 240 }}
                placeholder="家属姓名及关系，如：李小红（女儿）"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
              <button
                className="btn"
                disabled={!familyName.trim()}
                onClick={() => { s.issueCostume(pickupFor, `家属·${familyName.trim()}`); setPickupFor(null); }}
              >
                家属代领
              </button>
              <button className="btn sm" onClick={() => setPickupFor(null)}>取消</button>
            </div>
            <div className="small muted mt">家属代领将自动通知队长与服装负责人留档。</div>
          </div>
        )}

        {exchangeFor && (
          <div className="card mt" style={{ background: '#fbf8f2' }}>
            <h3><span className="icon">🔁</span>登记尺码不合适 — {memberOf(records.find((c) => c.id === exchangeFor)?.memberId ?? '')?.name}</h3>
            <div className="row">
              <input
                style={{ maxWidth: 360 }}
                placeholder="情况说明，如：L 码偏小，申请调换 XL"
                value={exchangeNote}
                onChange={(e) => setExchangeNote(e.target.value)}
              />
              <button
                className="btn primary"
                onClick={() => { s.markExchange(exchangeFor, exchangeNote.trim() || '尺码不合适'); setExchangeFor(null); }}
              >
                提交调换申请
              </button>
              <button className="btn sm" onClick={() => setExchangeFor(null)}>取消</button>
            </div>
            <div className="small muted mt">提交后服装负责人与队长会收到紧急通知，到货后在表格中「换发完成」。</div>
          </div>
        )}

        {program?.status === 'archived' && (
          <div className="banner blue mt">
            <span>ℹ️</span>
            <div>该节目已归档，服装归还情况已留档（见「演出档案」）。</div>
          </div>
        )}
      </div>
    </div>
  );
}
