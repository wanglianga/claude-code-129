import { useStore } from '../store';
import { STATUS_NAMES, type Program } from '../types';

/** 节目选择器（各页面共用） */
export default function ProgramSelect({
  value,
  onChange,
  filter,
}: {
  value: string;
  onChange: (id: string) => void;
  filter?: (p: Program) => boolean;
}) {
  const programs = useStore((s) => s.programs);
  const teams = useStore((s) => s.teams);
  const list = programs.filter(filter ?? (() => true));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ maxWidth: 420 }}>
      {list.map((p) => (
        <option key={p.id} value={p.id}>
          {p.title}（{teams.find((t) => t.id === p.teamId)?.name} · {STATUS_NAMES[p.status]}）
        </option>
      ))}
    </select>
  );
}
