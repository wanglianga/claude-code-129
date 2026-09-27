// 全局类型定义：社区舞蹈队排练报名与演出走位协作平台

export type Role = 'leader' | 'member' | 'costume' | 'station' | 'sound' | 'volunteer';

export const ROLE_NAMES: Record<Role, string> = {
  leader: '队长',
  member: '队员',
  costume: '服装负责人',
  station: '文化站',
  sound: '音响师',
  volunteer: '志愿者',
};

export const ALL_ROLES: Role[] = ['leader', 'member', 'costume', 'station', 'sound', 'volunteer'];

export type ProgramType = '广场舞' | '民族舞' | '合唱伴舞' | '节庆演出';
export const PROGRAM_TYPES: ProgramType[] = ['广场舞', '民族舞', '合唱伴舞', '节庆演出'];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export const TIME_SLOTS = ['周一晚', '周二晚', '周三晚', '周四晚', '周五晚', '周六上午', '周日下午'];

export interface Team {
  id: string;
  name: string;
}

/** 队员：报名时记录年龄、联系方式、服装尺码、可排练时间、是否参加正式演出、身体注意事项 */
export interface Member {
  id: string;
  teamId: string;
  name: string;
  age: number;
  phone: string;
  size: string;
  availableTimes: string[];
  joinShow: boolean;
  healthNotes: string;
}

export type ProgramStatus = 'signup' | 'rehearsing' | 'ready' | 'showday' | 'archived';

export const STATUS_NAMES: Record<ProgramStatus, string> = {
  signup: '报名中',
  rehearsing: '排练中',
  ready: '待演出',
  showday: '演出日',
  archived: '已归档',
};

export interface Program {
  id: string;
  teamId: string;
  title: string;
  type: ProgramType;
  theme: string;
  durationMin: number;
  audioNeeds: string;
  status: ProgramStatus;
  enrolledIds: string[];
  // 文化站：场地审批 + 节目审查
  venueName: string;
  venueCapacity: number;
  venueApproval: 'pending' | 'approved' | 'rejected';
  reviewStatus: 'pending' | 'approved' | 'changes';
  reviewNote: string;
  // 社区文艺汇演海选
  isAudition: boolean;
  auditionScore?: number;
  auditionPassed?: boolean;
  // 演出日：候场顺序、志愿者引导、现场签到
  queueOrder: number;
  showStatus: 'waiting' | 'onstage' | 'done';
  guide: string;
  showCheckinIds: string[];
  // 归档
  nextEvent: string;
  createdAt: string;
}

export type CheckinStatus = 'present' | 'leave' | 'absent';
export const CHECKIN_NAMES: Record<CheckinStatus, string> = {
  present: '出席',
  leave: '请假',
  absent: '缺席',
};

export interface Rehearsal {
  id: string;
  programId: string;
  date: string;
  slot: string;
  room: string;
  checkins: Record<string, CheckinStatus>;
  focusIds: string[]; // 需要重点练习的成员
  notes: string;
}

/** 走位队形：positions 的 key 为 "行-列"（从 0 开始，第 0 排为前排），value 为 memberId */
export interface Formation {
  id: string;
  programId: string;
  name: string;
  rows: number;
  cols: number;
  positions: Record<string, string>;
  updatedAt: string;
}

export interface FormationLog {
  id: string;
  programId: string;
  time: string;
  text: string;
}

export interface MusicVersion {
  id: string;
  programId: string;
  version: string;
  note: string;
  time: string;
}

export interface Segment {
  id: string;
  programId: string;
  name: string;
  detail: string;
}

export type CostumeStatus = 'pending' | 'issued' | 'exchange' | 'returned';
export const COSTUME_NAMES: Record<CostumeStatus, string> = {
  pending: '待发放',
  issued: '已发放',
  exchange: '调换中',
  returned: '已归还',
};

export interface CostumeRecord {
  id: string;
  programId: string;
  memberId: string;
  size: string;
  status: CostumeStatus;
  depositPaid: boolean; // 服装押金
  pickedUpBy: string;   // 领取人：本人 或 家属代领信息
  note: string;
}

export interface Notice {
  id: string;
  roles: Role[];
  programId?: string;
  text: string;
  time: string;
  kind: 'info' | 'urgent' | 'live';
}

export interface RoomBooking {
  id: string;
  room: string;
  teamId: string;
  slot: string;
}

export interface Photo {
  id: string;
  programId: string;
  caption: string;
  time: string;
}
