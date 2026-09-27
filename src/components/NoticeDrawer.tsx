import { useStore } from '../store';
import { ROLE_NAMES } from '../types';

export default function NoticeDrawer({ onClose }: { onClose: () => void }) {
  const role = useStore((s) => s.role);
  const notices = useStore((s) => s.notices);
  const programs = useStore((s) => s.programs);
  const mine = notices.filter((n) => n.roles.includes(role));

  return (
    <>
      <div className="drawer-mask" onClick={onClose} />
      <aside className="drawer">
        <header>
          <span>🔔 发给「{ROLE_NAMES[role]}」的通知（{mine.length}）</span>
          <button className="btn sm" onClick={onClose}>
            关闭
          </button>
        </header>
        <div className="body">
          {mine.length === 0 && <div className="muted small">暂无通知</div>}
          {mine.map((n) => {
            const p = n.programId ? programs.find((x) => x.id === n.programId) : undefined;
            return (
              <div key={n.id} className={`notice-item ${n.kind}`}>
                <div className="row">
                  {n.kind === 'urgent' && <span className="badge red">紧急</span>}
                  {n.kind === 'live' && <span className="badge amber">现场</span>}
                  {p && <span className="badge brand">{p.title}</span>}
                </div>
                <div className="mt">{n.text}</div>
                <div className="time">{n.time}</div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
