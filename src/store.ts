import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CheckinStatus,
  CostumeRecord,
  Formation,
  FormationLog,
  Member,
  MusicVersion,
  Notice,
  Photo,
  Program,
  ProgramType,
  Rehearsal,
  Role,
  RoomBooking,
  Segment,
  Team,
} from './types';
import { ALL_ROLES } from './types';
import {
  seedBookings,
  seedCostumes,
  seedFormationLogs,
  seedFormations,
  seedMembers,
  seedMusicVersions,
  seedNotices,
  seedPhotos,
  seedPrograms,
  seedRehearsals,
  seedSegments,
  seedTeams,
} from './seed';
import { absenceImpacts, cellLabel, now, uid } from './utils';

export interface EnrollInput {
  programId: string;
  name: string;
  age: number;
  phone: string;
  size: string;
  availableTimes: string[];
  joinShow: boolean;
  healthNotes: string;
}

export interface ProgramInput {
  teamId: string;
  title: string;
  type: ProgramType;
  theme: string;
  durationMin: number;
  audioNeeds: string;
  venueName: string;
  venueCapacity: number;
  isAudition: boolean;
}

interface State {
  role: Role;
  teams: Team[];
  members: Member[];
  programs: Program[];
  rehearsals: Rehearsal[];
  formations: Formation[];
  formationLogs: FormationLog[];
  musicVersions: MusicVersion[];
  segments: Segment[];
  costumes: CostumeRecord[];
  notices: Notice[];
  bookings: RoomBooking[];
  photos: Photo[];

  setRole: (r: Role) => void;
  resetAll: () => void;

  // 报名
  addProgram: (input: ProgramInput) => void;
  enroll: (input: EnrollInput) => void;
  unenroll: (programId: string, memberId: string) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  setProgramStatus: (id: string, status: Program['status']) => void;
  updateProgramInfo: (id: string, patch: Partial<Pick<Program, 'theme' | 'durationMin' | 'audioNeeds'>>) => void;

  // 排练
  addRehearsal: (programId: string, date: string, slot: string, room: string) => void;
  setCheckin: (rehearsalId: string, memberId: string, status: CheckinStatus) => void;
  setFocus: (rehearsalId: string, memberIds: string[]) => void;
  setRehearsalNotes: (rehearsalId: string, notes: string) => void;
  addMusicVersion: (programId: string, version: string, note: string) => void;
  addSegment: (programId: string, name: string, detail: string) => void;

  // 走位
  addFormation: (programId: string, name: string, rows: number, cols: number) => void;
  setPosition: (formationId: string, cell: string, memberId: string | null) => void;
  resizeFormation: (formationId: string, rows: number, cols: number) => void;

  // 服装
  issueCostume: (id: string, pickedUpBy: string) => void;
  markExchange: (id: string, note: string) => void;
  reissueCostume: (id: string, newSize: string) => void;
  payDeposit: (id: string) => void;
  returnCostume: (id: string) => void;

  // 文化站
  approveVenue: (programId: string, ok: boolean) => void;
  shrinkVenue: (programId: string, newCapacity: number) => void;
  reviewProgram: (programId: string, ok: boolean, note: string) => void;
  scoreAudition: (programId: string, score: number, passed: boolean) => void;

  // 通知 / 排练室
  postNotice: (roles: Role[], text: string, kind: Notice['kind'], programId?: string) => void;
  bookRoom: (room: string, teamId: string, slot: string) => boolean;
  cancelBooking: (id: string) => void;

  // 演出日
  moveQueue: (programId: string, dir: -1 | 1) => void;
  setShowStatus: (programId: string, status: Program['showStatus']) => void;
  setGuide: (programId: string, guide: string) => void;
  toggleShowCheckin: (programId: string, memberId: string) => void;

  // 归档
  addPhoto: (programId: string, caption: string) => void;
  archiveProgram: (programId: string, nextEvent: string) => void;
}

function seedState() {
  return {
    teams: seedTeams,
    members: seedMembers,
    programs: seedPrograms,
    rehearsals: seedRehearsals,
    formations: seedFormations,
    formationLogs: seedFormationLogs,
    musicVersions: seedMusicVersions,
    segments: seedSegments,
    costumes: seedCostumes,
    notices: seedNotices,
    bookings: seedBookings,
    photos: seedPhotos,
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      role: 'leader',
      ...seedState(),

      setRole: (role) => set({ role }),
      resetAll: () => set({ ...seedState(), role: get().role }),

      // ---------------- 报名 ----------------
      addProgram: (input) =>
        set((s) => ({
          programs: [
            ...s.programs,
            {
              id: uid(),
              ...input,
              status: 'signup',
              enrolledIds: [],
              venueApproval: 'pending',
              reviewStatus: 'pending',
              reviewNote: '',
              queueOrder: 99,
              showStatus: 'waiting',
              guide: '',
              showCheckinIds: [],
              nextEvent: '',
              createdAt: now(),
            },
          ],
          notices: [
            {
              id: uid(),
              roles: ['station'],
              text: `新节目报名：${input.title}（${input.type}），请安排场地审批与节目审查。`,
              time: now(),
              kind: 'info',
            },
            ...s.notices,
          ],
        })),

      enroll: (input) =>
        set((s) => {
          const program = s.programs.find((p) => p.id === input.programId);
          if (!program) return s;
          const member: Member = {
            id: uid(),
            teamId: program.teamId,
            name: input.name,
            age: input.age,
            phone: input.phone,
            size: input.size,
            availableTimes: input.availableTimes,
            joinShow: input.joinShow,
            healthNotes: input.healthNotes,
          };
          const costume: CostumeRecord = {
            id: uid(),
            programId: program.id,
            memberId: member.id,
            size: input.size,
            status: 'pending',
            depositPaid: false,
            pickedUpBy: '',
            note: '',
          };
          return {
            members: [...s.members, member],
            costumes: [...s.costumes, costume],
            programs: s.programs.map((p) =>
              p.id === program.id ? { ...p, enrolledIds: [...p.enrolledIds, member.id] } : p,
            ),
          };
        }),

      unenroll: (programId, memberId) =>
        set((s) => ({
          programs: s.programs.map((p) =>
            p.id === programId ? { ...p, enrolledIds: p.enrolledIds.filter((id) => id !== memberId) } : p,
          ),
          costumes: s.costumes.filter((c) => !(c.programId === programId && c.memberId === memberId)),
        })),

      updateMember: (id, patch) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      setProgramStatus: (id, status) =>
        set((s) => ({
          programs: s.programs.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      updateProgramInfo: (id, patch) =>
        set((s) => ({
          programs: s.programs.map((p) =>
            p.id === id ? { ...p, ...patch, reviewStatus: 'pending', reviewNote: '' } : p,
          ),
          notices: [
            { id: uid(), roles: ['station'], programId: id, text: '节目内容已修改，请文化站重新审查。', time: now(), kind: 'info' },
            ...s.notices,
          ],
        })),

      // ---------------- 排练 ----------------
      addRehearsal: (programId, date, slot, room) =>
        set((s) => ({
          rehearsals: [
            ...s.rehearsals,
            { id: uid(), programId, date, slot, room, checkins: {}, focusIds: [], notes: '' },
          ],
        })),

      setCheckin: (rehearsalId, memberId, status) =>
        set((s) => {
          const rehearsal = s.rehearsals.find((r) => r.id === rehearsalId);
          if (!rehearsal) return s;
          const member = s.members.find((m) => m.id === memberId);
          const program = s.programs.find((p) => p.id === rehearsal.programId);
          const rehearsals = s.rehearsals.map((r) =>
            r.id === rehearsalId
              ? { ...r, checkins: { ...r.checkins, [memberId]: status } }
              : r,
          );
          // 队员临时请假/缺席 → 立即评估走位影响并通知队长
          const notices = [...s.notices];
          if ((status === 'leave' || status === 'absent') && member && program) {
            const impacts = absenceImpacts(rehearsals, s.formations, program.id).filter(
              (i) => i.memberId === memberId,
            );
            const label = status === 'leave' ? '请假' : '缺席';
            if (impacts.length > 0) {
              const front = impacts.some((i) => i.frontRow);
              notices.unshift({
                id: uid(),
                roles: ['leader'],
                programId: program.id,
                text: `${member.name}${label}，影响 ${impacts.length} 处站位（${impacts
                  .map((i) => `${i.formationName}·${cellLabel(i.cell)}`)
                  .join('、')}）${front ? '，含前排位置，请尽快调整！' : '。'}`,
                time: now(),
                kind: 'urgent',
              });
            } else {
              notices.unshift({
                id: uid(),
                roles: ['leader'],
                programId: program.id,
                text: `${member.name}${label}，暂不影响已编排站位。`,
                time: now(),
                kind: 'info',
              });
            }
          }
          return { rehearsals, notices };
        }),

      setFocus: (rehearsalId, memberIds) =>
        set((s) => ({
          rehearsals: s.rehearsals.map((r) =>
            r.id === rehearsalId ? { ...r, focusIds: memberIds } : r,
          ),
        })),

      setRehearsalNotes: (rehearsalId, notes) =>
        set((s) => ({
          rehearsals: s.rehearsals.map((r) => (r.id === rehearsalId ? { ...r, notes } : r)),
        })),

      addMusicVersion: (programId, version, note) =>
        set((s) => {
          const program = s.programs.find((p) => p.id === programId);
          return {
            musicVersions: [
              ...s.musicVersions,
              { id: uid(), programId, version, note, time: now() },
            ],
            notices: [
              {
                id: uid(),
                roles: ['member', 'sound', 'leader'],
                programId,
                text: `曲目版本更新：${program?.title ?? ''} 已上传「${version}」（${note}），请音响师确认播放版本，队员按新版练习。`,
                time: now(),
                kind: 'info',
              },
              ...s.notices,
            ],
          };
        }),

      addSegment: (programId, name, detail) =>
        set((s) => ({
          segments: [...s.segments, { id: uid(), programId, name, detail }],
        })),

      // ---------------- 走位 ----------------
      addFormation: (programId, name, rows, cols) =>
        set((s) => ({
          formations: [
            ...s.formations,
            { id: uid(), programId, name, rows, cols, positions: {}, updatedAt: now() },
          ],
          formationLogs: [
            { id: uid(), programId, time: now(), text: `新增队形「${name}」（${rows}排×${cols}列）` },
            ...s.formationLogs,
          ],
        })),

      setPosition: (formationId, cell, memberId) =>
        set((s) => {
          const formation = s.formations.find((f) => f.id === formationId);
          if (!formation) return s;
          const member = memberId ? s.members.find((m) => m.id === memberId) : undefined;
          const positions = { ...formation.positions };
          // 同一队员在一个队形中只占一个位置
          if (memberId) {
            for (const k of Object.keys(positions)) {
              if (positions[k] === memberId) delete positions[k];
            }
            positions[cell] = memberId;
          } else {
            delete positions[cell];
          }
          const text = member
            ? `${member.name} 站入 ${formation.name}·${cellLabel(cell)}`
            : `清空 ${formation.name}·${cellLabel(cell)}`;
          return {
            formations: s.formations.map((f) =>
              f.id === formationId ? { ...f, positions, updatedAt: now() } : f,
            ),
            formationLogs: [
              { id: uid(), programId: formation.programId, time: now(), text },
              ...s.formationLogs,
            ],
          };
        }),

      resizeFormation: (formationId, rows, cols) =>
        set((s) => {
          const formation = s.formations.find((f) => f.id === formationId);
          if (!formation) return s;
          // 缩小场地/队形时，丢弃超出新范围的站位并记录
          const positions: Record<string, string> = {};
          const dropped: string[] = [];
          for (const [cell, mid] of Object.entries(formation.positions)) {
            const [r, cIdx] = cell.split('-').map(Number);
            if (r < rows && cIdx < cols) positions[cell] = mid;
            else {
              const m = s.members.find((x) => x.id === mid);
              if (m) dropped.push(m.name);
            }
          }
          const text =
            dropped.length > 0
              ? `队形「${formation.name}」调整为 ${rows}排×${cols}列，${dropped.join('、')} 暂被移出队形，需重新安排`
              : `队形「${formation.name}」调整为 ${rows}排×${cols}列`;
          return {
            formations: s.formations.map((f) =>
              f.id === formationId ? { ...f, rows, cols, positions, updatedAt: now() } : f,
            ),
            formationLogs: [
              { id: uid(), programId: formation.programId, time: now(), text },
              ...s.formationLogs,
            ],
          };
        }),

      // ---------------- 服装 ----------------
      issueCostume: (id, pickedUpBy) =>
        set((s) => {
          const rec = s.costumes.find((c) => c.id === id);
          const member = rec && s.members.find((m) => m.id === rec.memberId);
          const isFamily = pickedUpBy.startsWith('家属');
          return {
            costumes: s.costumes.map((c) =>
              c.id === id ? { ...c, status: 'issued', pickedUpBy } : c,
            ),
            notices: isFamily
              ? [
                  {
                    id: uid(),
                    roles: ['leader', 'costume'],
                    programId: rec?.programId,
                    text: `${member?.name ?? '队员'}的服装由家属代领（${pickedUpBy}），请队长知悉。`,
                    time: now(),
                    kind: 'info',
                  },
                  ...s.notices,
                ]
              : s.notices,
          };
        }),

      markExchange: (id, note) =>
        set((s) => {
          const rec = s.costumes.find((c) => c.id === id);
          const member = rec && s.members.find((m) => m.id === rec.memberId);
          return {
            costumes: s.costumes.map((c) => (c.id === id ? { ...c, status: 'exchange', note } : c)),
            notices: [
              {
                id: uid(),
                roles: ['costume', 'leader'],
                programId: rec?.programId,
                text: `服装尺码不合适：${member?.name ?? '队员'}（${rec?.size}）申请调换，${note}`,
                time: now(),
                kind: 'urgent',
              },
              ...s.notices,
            ],
          };
        }),

      reissueCostume: (id, newSize) =>
        set((s) => ({
          costumes: s.costumes.map((c) =>
            c.id === id ? { ...c, status: 'issued', size: newSize, note: '' } : c,
          ),
        })),

      payDeposit: (id) =>
        set((s) => ({
          costumes: s.costumes.map((c) => (c.id === id ? { ...c, depositPaid: true } : c)),
        })),

      returnCostume: (id) =>
        set((s) => ({
          costumes: s.costumes.map((c) => (c.id === id ? { ...c, status: 'returned' } : c)),
        })),

      // ---------------- 文化站 ----------------
      approveVenue: (programId, ok) =>
        set((s) => {
          const p = s.programs.find((x) => x.id === programId);
          return {
            programs: s.programs.map((x) =>
              x.id === programId ? { ...x, venueApproval: ok ? 'approved' : 'rejected' } : x,
            ),
            notices: [
              {
                id: uid(),
                roles: ['leader'],
                programId,
                text: `场地审批${ok ? '通过' : '被驳回'}：${p?.title ?? ''}（${p?.venueName ?? ''}）。`,
                time: now(),
                kind: ok ? 'info' : 'urgent',
              },
              ...s.notices,
            ],
          };
        }),

      shrinkVenue: (programId, newCapacity) =>
        set((s) => {
          const p = s.programs.find((x) => x.id === programId);
          if (!p) return s;
          return {
            programs: s.programs.map((x) =>
              x.id === programId ? { ...x, venueCapacity: newCapacity } : x,
            ),
            notices: [
              {
                id: uid(),
                roles: ['leader'],
                programId,
                text: `演出场地缩小：${p.title} 场地「${p.venueName}」容量调整为 ${newCapacity} 人，请压缩队形规模。`,
                time: now(),
                kind: 'urgent',
              },
              ...s.notices,
            ],
          };
        }),

      reviewProgram: (programId, ok, note) =>
        set((s) => {
          const p = s.programs.find((x) => x.id === programId);
          return {
            programs: s.programs.map((x) =>
              x.id === programId
                ? { ...x, reviewStatus: ok ? 'approved' : 'changes', reviewNote: note }
                : x,
            ),
            notices: [
              {
                id: uid(),
                roles: ['leader'],
                programId,
                text: ok
                  ? `节目审查通过：${p?.title ?? ''}。`
                  : `社区要求调整节目内容：${p?.title ?? ''}——${note}。修改后需重新送审。`,
                time: now(),
                kind: ok ? 'info' : 'urgent',
              },
              ...s.notices,
            ],
          };
        }),

      scoreAudition: (programId, score, passed) =>
        set((s) => {
          const p = s.programs.find((x) => x.id === programId);
          return {
            programs: s.programs.map((x) =>
              x.id === programId ? { ...x, auditionScore: score, auditionPassed: passed } : x,
            ),
            notices: [
              {
                id: uid(),
                roles: ['leader'],
                programId,
                text: `海选结果：${p?.title ?? ''} 得分 ${score}，${passed ? '入围正式汇演' : '未入围'}。`,
                time: now(),
                kind: 'info',
              },
              ...s.notices,
            ],
          };
        }),

      // ---------------- 通知 / 排练室 ----------------
      postNotice: (roles, text, kind, programId) =>
        set((s) => ({
          notices: [{ id: uid(), roles, text, kind, programId, time: now() }, ...s.notices],
        })),

      bookRoom: (room, teamId, slot) => {
        const s = get();
        if (s.bookings.some((b) => b.room === room && b.slot === slot)) return false;
        const team = s.teams.find((t) => t.id === teamId);
        set((st) => ({
          bookings: [...st.bookings, { id: uid(), room, teamId, slot }],
          notices: [
            {
              id: uid(),
              roles: ALL_ROLES,
              text: `排练室预约：${team?.name ?? ''} 已预约 ${room}（${slot}）。`,
              time: now(),
              kind: 'info',
            },
            ...st.notices,
          ],
        }));
        return true;
      },

      cancelBooking: (id) =>
        set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) })),

      // ---------------- 演出日 ----------------
      moveQueue: (programId, dir) =>
        set((s) => {
          const queue = s.programs
            .filter((p) => p.status !== 'archived' && p.venueApproval === 'approved' && p.reviewStatus === 'approved')
            .sort((a, b) => a.queueOrder - b.queueOrder);
          const idx = queue.findIndex((p) => p.id === programId);
          const swap = idx + dir;
          if (idx < 0 || swap < 0 || swap >= queue.length) return s;
          const a = queue[idx];
          const b = queue[swap];
          return {
            programs: s.programs.map((p) => {
              if (p.id === a.id) return { ...p, queueOrder: b.queueOrder };
              if (p.id === b.id) return { ...p, queueOrder: a.queueOrder };
              return p;
            }),
          };
        }),

      setShowStatus: (programId, status) =>
        set((s) => ({
          programs: s.programs.map((p) => (p.id === programId ? { ...p, showStatus: status } : p)),
        })),

      setGuide: (programId, guide) =>
        set((s) => ({
          programs: s.programs.map((p) => (p.id === programId ? { ...p, guide } : p)),
        })),

      toggleShowCheckin: (programId, memberId) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            const has = p.showCheckinIds.includes(memberId);
            return {
              ...p,
              showCheckinIds: has
                ? p.showCheckinIds.filter((id) => id !== memberId)
                : [...p.showCheckinIds, memberId],
            };
          }),
        })),

      // ---------------- 归档 ----------------
      addPhoto: (programId, caption) =>
        set((s) => ({
          photos: [...s.photos, { id: uid(), programId, caption, time: now() }],
        })),

      archiveProgram: (programId, nextEvent) =>
        set((s) => {
          const p = s.programs.find((x) => x.id === programId);
          return {
            programs: s.programs.map((x) =>
              x.id === programId ? { ...x, status: 'archived', showStatus: 'done', nextEvent } : x,
            ),
            notices: nextEvent
              ? [
                  {
                    id: uid(),
                    roles: ['leader', 'member'],
                    programId,
                    text: `【下次活动通知】${p?.title ?? ''}：${nextEvent}`,
                    time: now(),
                    kind: 'info',
                  },
                  ...s.notices,
                ]
              : s.notices,
          };
        }),
    }),
    { name: 'community-dance-store' },
  ),
);
