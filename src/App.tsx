import { useState } from 'react';
import { useStore } from './store';
import { ALL_ROLES, ROLE_NAMES, type Role } from './types';
import Dashboard from './pages/Dashboard';
import SignupPage from './pages/SignupPage';
import RehearsalPage from './pages/RehearsalPage';
import FormationPage from './pages/FormationPage';
import CostumePage from './pages/CostumePage';
import StationPage from './pages/StationPage';
import RoomsPage from './pages/RoomsPage';
import ShowDayPage from './pages/ShowDayPage';
import ArchivePage from './pages/ArchivePage';
import NoticeDrawer from './components/NoticeDrawer';

const TABS = [
  { id: 'dashboard', label: '总览' },
  { id: 'signup', label: '报名' },
  { id: 'rehearsal', label: '排练签到' },
  { id: 'formation', label: '走位编排' },
  { id: 'costume', label: '服装' },
  { id: 'station', label: '文化站' },
  { id: 'rooms', label: '排练室' },
  { id: 'showday', label: '演出日' },
  { id: 'archive', label: '演出档案' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const resetAll = useStore((s) => s.resetAll);
  const noticeCount = useStore((s) => s.notices.filter((n) => n.roles.includes(s.role)).length);

  return (
    <div>
      <header className="app-header">
        <div>
          <div className="app-title">社区舞蹈队 · 排练报名与演出走位协作平台</div>
          <div className="app-sub">报名 → 排练 → 走位 → 服装 → 审核 → 演出，六个角色同场协作</div>
        </div>
        <div className="header-spacer" />
        <div className="role-select">
          <span>当前身份</span>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_NAMES[r]}
              </option>
            ))}
          </select>
        </div>
        <button className="bell" onClick={() => setDrawerOpen(true)}>
          🔔 通知
          {noticeCount > 0 && <span className="badge">{noticeCount}</span>}
        </button>
        <button
          className="bell"
          title="恢复演示初始数据"
          onClick={() => {
            if (window.confirm('确定要重置为初始演示数据吗？当前修改将丢失。')) resetAll();
          }}
        >
          ↺ 重置数据
        </button>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === 'dashboard' && <Dashboard goTab={(t) => setTab(t as TabId)} />}
        {tab === 'signup' && <SignupPage />}
        {tab === 'rehearsal' && <RehearsalPage />}
        {tab === 'formation' && <FormationPage />}
        {tab === 'costume' && <CostumePage />}
        {tab === 'station' && <StationPage />}
        {tab === 'rooms' && <RoomsPage />}
        {tab === 'showday' && <ShowDayPage />}
        {tab === 'archive' && <ArchivePage />}
        <div className="footer-note">
          社区文化站 · 夕阳红广场舞队 / 金秋民族舞队 共用排练室 —— 数据保存在浏览器本地，可随时「重置数据」
        </div>
      </main>

      {drawerOpen && <NoticeDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}
