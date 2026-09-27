import type { Formation, Member, Program, Rehearsal } from './types';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function now(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function cellLabel(cell: string): string {
  const [r, c] = cell.split('-').map(Number);
  return `第${r + 1}排${c + 1}号位`;
}

/** 老年/健康关注队员：60 岁以上或填写了身体注意事项 */
export function isHealthWatch(m: Member): boolean {
  return m.age >= 60 || m.healthNotes.trim().length > 0;
}

export interface AbsenceImpact {
  memberId: string;
  formationName: string;
  cell: string;
  status: 'leave' | 'absent';
  frontRow: boolean;
}

/** 最近一次有签到记录的排练 */
export function latestRehearsal(rehearsals: Rehearsal[], programId: string): Rehearsal | undefined {
  const list = rehearsals.filter((r) => r.programId === programId);
  for (let i = list.length - 1; i >= 0; i--) {
    if (Object.keys(list[i].checkins).length > 0) return list[i];
  }
  return undefined;
}

/** 缺席影响：最近一次排练中请假/缺席、且已被排入队形的队员及其站位 */
export function absenceImpacts(
  rehearsals: Rehearsal[],
  formations: Formation[],
  programId: string,
): AbsenceImpact[] {
  const latest = latestRehearsal(rehearsals, programId);
  if (!latest) return [];
  const bad = new Map<string, 'leave' | 'absent'>();
  for (const [mid, st] of Object.entries(latest.checkins)) {
    if (st === 'leave' || st === 'absent') bad.set(mid, st);
  }
  if (bad.size === 0) return [];
  const impacts: AbsenceImpact[] = [];
  for (const f of formations.filter((x) => x.programId === programId)) {
    for (const [cell, mid] of Object.entries(f.positions)) {
      const st = bad.get(mid);
      if (st) {
        impacts.push({
          memberId: mid,
          formationName: f.name,
          cell,
          status: st,
          frontRow: Number(cell.split('-')[0]) === 0,
        });
      }
    }
  }
  return impacts;
}

export interface Stage {
  key: string;
  label: string;
  done: boolean;
  detail: string;
}

/** 文化站视角：节目从报名→排练→走位→服装→演出审核→现场签到是否连续 */
export function continuity(
  program: Program,
  rehearsals: Rehearsal[],
  formations: Formation[],
  costumeDone: number,
  costumeTotal: number,
): Stage[] {
  const rehearsed = rehearsals.some(
    (r) => r.programId === program.id && Object.keys(r.checkins).length > 0,
  );
  const formed = formations.some(
    (f) => f.programId === program.id && Object.keys(f.positions).length > 0,
  );
  return [
    { key: 'signup', label: '报名', done: program.enrolledIds.length > 0, detail: `${program.enrolledIds.length} 人报名` },
    { key: 'rehearse', label: '排练', done: rehearsed, detail: rehearsed ? '已有签到记录' : '尚无签到' },
    { key: 'formation', label: '走位', done: formed, detail: formed ? '队形已编排' : '未编排队形' },
    { key: 'costume', label: '服装', done: costumeTotal > 0 && costumeDone === costumeTotal, detail: `已发 ${costumeDone}/${costumeTotal}` },
    {
      key: 'review', label: '演出审核',
      done: program.venueApproval === 'approved' && program.reviewStatus === 'approved',
      detail: `场地${program.venueApproval === 'approved' ? '已批' : '待批'} · 审查${program.reviewStatus === 'approved' ? '通过' : program.reviewStatus === 'changes' ? '需调整' : '待审'}`,
    },
    { key: 'checkin', label: '现场签到', done: program.showCheckinIds.length > 0, detail: `已签到 ${program.showCheckinIds.length} 人` },
  ];
}
