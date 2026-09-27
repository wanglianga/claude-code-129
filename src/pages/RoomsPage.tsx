import { useState } from 'react';
import { useStore } from '../store';
import { TIME_SLOTS } from '../types';

const ROOMS = ['排练室A', '排练室B'];

export default function RoomsPage() {
  const s = useStore();
  const [teamId, setTeamId] = useState('t1');
  const [msg, setMsg] = useState('');

  const bookingOf = (room: string, slot: string) =>
    s.bookings.find((b) => b.room === room && b.slot === slot);

  const book = (room: string, slot: string) => {
    const ok = s.bookRoom(room, teamId, slot);
    setMsg(ok ? `已预约 ${room}（${slot}）` : `${room}（${slot}）已被其他队伍占用`);
    window.setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="grid">
      <div className="card">
        <h3><span className="icon">🏠</span>多支队伍共用排练室 — 空闲时段点格即约</h3>
        <div className="row mb">
          <span className="small muted">预约队伍：</span>
          <select style={{ maxWidth: 220 }} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            {s.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {msg && <span className="badge blue">{msg}</span>}
        </div>
        {ROOMS.map((room) => (
          <div key={room} className="mb">
            <h3>{room}</h3>
            <table className="room-table">
              <tbody>
                <tr>
                  {TIME_SLOTS.map((slot) => {
                    const b = bookingOf(room, slot);
                    const team = b ? s.teams.find((t) => t.id === b.teamId) : undefined;
                    return (
                      <td key={slot} className="slot">
                        <div className="small muted">{slot}</div>
                        {b ? (
                          <div className="room-cell">
                            <div className="team">{team?.name}</div>
                            <button className="btn sm ghost-danger" onClick={() => s.cancelBooking(b.id)}>取消</button>
                          </div>
                        ) : (
                          <button className="btn sm" onClick={() => book(room, slot)}>空闲 · 预约</button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        ))}
        <div className="small muted">同一时段同一排练室仅允许一支队伍使用，冲突时段会提示已被占用。</div>
      </div>
    </div>
  );
}
