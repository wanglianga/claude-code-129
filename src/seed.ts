import type {
  CostumeRecord,
  Formation,
  FormationLog,
  Member,
  MusicVersion,
  Notice,
  Photo,
  Program,
  Rehearsal,
  RoomBooking,
  Segment,
  Team,
} from './types';

// ---------- 队伍 ----------
export const seedTeams: Team[] = [
  { id: 't1', name: '夕阳红广场舞队' },
  { id: 't2', name: '金秋民族舞队' },
];

// ---------- 队员 ----------
export const seedMembers: Member[] = [
  { id: 'm1', teamId: 't1', name: '王秀兰', age: 62, phone: '13800001001', size: 'L', availableTimes: ['周一晚', '周三晚'], joinShow: true, healthNotes: '' },
  { id: 'm2', teamId: 't1', name: '李桂芳', age: 58, phone: '13800001002', size: 'M', availableTimes: ['周一晚', '周五晚'], joinShow: true, healthNotes: '' },
  { id: 'm3', teamId: 't1', name: '张淑英', age: 65, phone: '13800001003', size: 'XL', availableTimes: ['周一晚'], joinShow: true, healthNotes: '高血压，避免长时间剧烈运动' },
  { id: 'm4', teamId: 't1', name: '赵玉梅', age: 60, phone: '13800001004', size: 'M', availableTimes: ['周三晚', '周六上午'], joinShow: true, healthNotes: '' },
  { id: 'm5', teamId: 't1', name: '陈丽华', age: 55, phone: '13800001005', size: 'S', availableTimes: ['周一晚', '周三晚', '周五晚'], joinShow: true, healthNotes: '' },
  { id: 'm6', teamId: 't1', name: '刘凤霞', age: 63, phone: '13800001006', size: 'L', availableTimes: ['周一晚'], joinShow: true, healthNotes: '膝盖旧伤，下蹲动作需减量' },
  { id: 'm7', teamId: 't1', name: '孙玉珍', age: 57, phone: '13800001007', size: 'M', availableTimes: ['周一晚', '周三晚'], joinShow: true, healthNotes: '' },
  { id: 'm8', teamId: 't1', name: '周淑华', age: 61, phone: '13800001008', size: 'L', availableTimes: ['周一晚', '周日下午'], joinShow: false, healthNotes: '低血糖，需随身携带糖果' },
  { id: 'm9', teamId: 't1', name: '吴桂英', age: 59, phone: '13800001009', size: 'XL', availableTimes: ['周三晚', '周五晚'], joinShow: true, healthNotes: '' },
  { id: 'm10', teamId: 't1', name: '郑爱萍', age: 64, phone: '13800001010', size: 'XXL', availableTimes: ['周一晚'], joinShow: true, healthNotes: '' },
  { id: 'm11', teamId: 't2', name: '马兰花', age: 52, phone: '13800002001', size: 'M', availableTimes: ['周二晚', '周四晚'], joinShow: true, healthNotes: '' },
  { id: 'm12', teamId: 't2', name: '乌兰其其格', age: 48, phone: '13800002002', size: 'S', availableTimes: ['周二晚', '周四晚', '周六上午'], joinShow: true, healthNotes: '' },
  { id: 'm13', teamId: 't2', name: '萨日娜', age: 50, phone: '13800002003', size: 'M', availableTimes: ['周二晚'], joinShow: true, healthNotes: '' },
  { id: 'm14', teamId: 't2', name: '高娃', age: 45, phone: '13800002004', size: 'S', availableTimes: ['周四晚', '周日下午'], joinShow: true, healthNotes: '' },
  { id: 'm15', teamId: 't2', name: '韩春梅', age: 56, phone: '13800002005', size: 'L', availableTimes: ['周二晚', '周四晚'], joinShow: true, healthNotes: '腰肌劳损，避免长时间弯腰' },
  { id: 'm16', teamId: 't2', name: '徐凤英', age: 54, phone: '13800002006', size: 'XL', availableTimes: ['周二晚'], joinShow: false, healthNotes: '' },
];

// ---------- 节目 ----------
export const seedPrograms: Program[] = [
  {
    id: 'p1',
    teamId: 't1',
    title: '《红红火火迎国庆》',
    type: '广场舞',
    theme: '国庆联欢 · 歌颂祖国',
    durationMin: 6,
    audioNeeds: 'U盘播放伴奏，需无线话筒1支，音量偏大',
    status: 'rehearsing',
    enrolledIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10'],
    venueName: '社区文化广场',
    venueCapacity: 40,
    venueApproval: 'approved',
    reviewStatus: 'approved',
    reviewNote: '',
    isAudition: false,
    queueOrder: 1,
    showStatus: 'waiting',
    guide: '志愿者·小周',
    showCheckinIds: [],
    nextEvent: '',
    createdAt: '2026-09-01 10:00',
  },
  {
    id: 'p2',
    teamId: 't2',
    title: '《草原情》',
    type: '民族舞',
    theme: '民族团结 · 草原赞歌',
    durationMin: 5,
    audioNeeds: '需调音台接入手机播放，话筒2支',
    status: 'signup',
    enrolledIds: ['m11', 'm12', 'm13', 'm14', 'm15', 'm16'],
    venueName: '社区文化活动中心礼堂',
    venueCapacity: 24,
    venueApproval: 'pending',
    reviewStatus: 'pending',
    reviewNote: '',
    isAudition: true,
    queueOrder: 99,
    showStatus: 'waiting',
    guide: '',
    showCheckinIds: [],
    nextEvent: '',
    createdAt: '2026-09-18 09:30',
  },
  {
    id: 'p3',
    teamId: 't1',
    title: '《春天的故事》',
    type: '合唱伴舞',
    theme: '改革开放 · 美好生活',
    durationMin: 4,
    audioNeeds: '合唱队现场伴奏，需返送音箱',
    status: 'archived',
    enrolledIds: ['m1', 'm2', 'm4', 'm5', 'm7', 'm9'],
    venueName: '街道礼堂',
    venueCapacity: 30,
    venueApproval: 'approved',
    reviewStatus: 'approved',
    reviewNote: '',
    isAudition: false,
    queueOrder: 3,
    showStatus: 'done',
    guide: '志愿者·老钱',
    showCheckinIds: ['m1', 'm2', 'm4', 'm5', 'm7', 'm9'],
    nextEvent: '下次活动：10月15日（周四）晚7点，排练室A，新节目《金秋颂》第一次合排，请准时参加。',
    createdAt: '2026-06-10 14:00',
  },
  {
    id: 'p4',
    teamId: 't2',
    title: '《丰收锣鼓》',
    type: '节庆演出',
    theme: '丰收节 · 喜庆锣鼓',
    durationMin: 7,
    audioNeeds: '需大功率音箱，伴奏鼓点较强',
    status: 'ready',
    enrolledIds: ['m11', 'm12', 'm13', 'm14'],
    venueName: '社区文化广场',
    venueCapacity: 30,
    venueApproval: 'approved',
    reviewStatus: 'approved',
    reviewNote: '',
    isAudition: false,
    queueOrder: 2,
    showStatus: 'waiting',
    guide: '志愿者·小吴',
    showCheckinIds: [],
    nextEvent: '',
    createdAt: '2026-09-05 16:20',
  },
];

// ---------- 排练 ----------
export const seedRehearsals: Rehearsal[] = [
  {
    id: 'r1',
    programId: 'p1',
    date: '2026-09-21',
    slot: '周一晚',
    room: '排练室A',
    checkins: {
      m1: 'present', m2: 'present', m3: 'leave', m4: 'present', m5: 'present',
      m6: 'absent', m7: 'present', m8: 'present', m9: 'present', m10: 'present',
    },
    focusIds: ['m5', 'm9'],
    notes: '间奏队形变换还不齐，下次重点合排。',
  },
  {
    id: 'r2',
    programId: 'p1',
    date: '2026-09-28',
    slot: '周一晚',
    room: '排练室A',
    checkins: {},
    focusIds: [],
    notes: '',
  },
  {
    id: 'r3',
    programId: 'p3',
    date: '2026-06-20',
    slot: '周三晚',
    room: '排练室B',
    checkins: { m1: 'present', m2: 'present', m4: 'present', m5: 'present', m7: 'present', m9: 'leave' },
    focusIds: [],
    notes: '演出前最后一次合排。',
  },
];

// ---------- 走位队形 ----------
export const seedFormations: Formation[] = [
  {
    id: 'f1',
    programId: 'p1',
    name: '开场 · 方阵',
    rows: 3,
    cols: 4,
    positions: {
      '0-0': 'm1', '0-1': 'm3', '0-2': 'm2', '0-3': 'm4',
      '1-0': 'm6', '1-1': 'm7', '1-2': 'm8', '1-3': 'm5',
      '2-0': 'm9', '2-1': 'm10',
    },
    updatedAt: '2026-09-21 20:10',
  },
  {
    id: 'f2',
    programId: 'p1',
    name: '高潮 · 双圆阵',
    rows: 2,
    cols: 5,
    positions: {
      '0-0': 'm1', '0-1': 'm2', '0-2': 'm4', '0-3': 'm5', '0-4': 'm7',
      '1-0': 'm9', '1-1': 'm10', '1-2': 'm8', '1-3': 'm3',
    },
    updatedAt: '2026-09-21 20:40',
  },
  {
    id: 'f3',
    programId: 'p3',
    name: '合唱伴舞 · 月牙阵',
    rows: 2,
    cols: 3,
    positions: { '0-0': 'm1', '0-1': 'm2', '0-2': 'm4', '1-0': 'm5', '1-1': 'm7', '1-2': 'm9' },
    updatedAt: '2026-06-20 21:00',
  },
];

export const seedFormationLogs: FormationLog[] = [
  { id: 'fl1', programId: 'p1', time: '2026-09-21 20:10', text: '张淑英 由 第2排2号位 调整至 第1排2号位（前排领舞）' },
  { id: 'fl2', programId: 'p1', time: '2026-09-21 20:40', text: '新增队形「高潮 · 双圆阵」' },
  { id: 'fl3', programId: 'p3', time: '2026-06-20 21:00', text: '月牙阵定型，演出采用该版本' },
];

// ---------- 曲目版本 / 动作分段 ----------
export const seedMusicVersions: MusicVersion[] = [
  { id: 'v1', programId: 'p1', version: 'v1.0 完整版', note: '5分48秒，含完整间奏', time: '2026-09-10 19:00' },
  { id: 'v2', programId: 'p1', version: 'v1.5 剪辑版', note: '4分30秒，去掉第二段间奏，演出采用此版', time: '2026-09-21 19:30' },
  { id: 'v3', programId: 'p3', version: 'v2.0 演出版', note: '与合唱队合练定稿', time: '2026-06-18 20:00' },
];

export const seedSegments: Segment[] = [
  { id: 's1', programId: 'p1', name: '前奏', detail: '8拍×4，方阵静止造型' },
  { id: 's2', programId: 'p1', name: '第一段 · 十字步', detail: '全员十字步，注意手绢高度一致' },
  { id: 's3', programId: 'p1', name: '间奏 · 队形变换', detail: '方阵 → 双圆阵，8拍内到位' },
  { id: 's4', programId: 'p1', name: '高潮 · 双圆阵', detail: '内外圈反向转动，前排领舞' },
  { id: 's5', programId: 'p1', name: '收尾 · 造型定格', detail: '定格3秒，面向观众席' },
];

// ---------- 服装 ----------
const c = (id: string, programId: string, memberId: string, size: string, status: CostumeRecord['status'], depositPaid: boolean, pickedUpBy = '', note = ''): CostumeRecord =>
  ({ id, programId, memberId, size, status, depositPaid, pickedUpBy, note });

export const seedCostumes: CostumeRecord[] = [
  c('ct1', 'p1', 'm1', 'L', 'issued', true, '本人'),
  c('ct2', 'p1', 'm2', 'M', 'issued', true, '本人'),
  c('ct3', 'p1', 'm3', 'XL', 'issued', true, '家属·李小红（女儿）', '家属代领，已电话确认'),
  c('ct4', 'p1', 'm4', 'M', 'issued', true, '本人'),
  c('ct5', 'p1', 'm5', 'S', 'issued', true, '本人'),
  c('ct6', 'p1', 'm6', 'L', 'exchange', true, '本人', '尺码偏小，申请调换 XL'),
  c('ct7', 'p1', 'm7', 'M', 'issued', true, '本人'),
  c('ct8', 'p1', 'm8', 'L', 'issued', true, '本人'),
  c('ct9', 'p1', 'm9', 'XL', 'issued', true, '本人'),
  c('ct10', 'p1', 'm10', 'XXL', 'pending', false),
  c('ct11', 'p2', 'm11', 'M', 'pending', false),
  c('ct12', 'p2', 'm12', 'S', 'pending', false),
  c('ct13', 'p2', 'm13', 'M', 'pending', false),
  c('ct14', 'p2', 'm14', 'S', 'pending', false),
  c('ct15', 'p2', 'm15', 'L', 'pending', false),
  c('ct16', 'p2', 'm16', 'XL', 'pending', false),
  c('ct17', 'p3', 'm1', 'L', 'returned', true, '本人'),
  c('ct18', 'p3', 'm2', 'M', 'returned', true, '本人'),
  c('ct19', 'p3', 'm4', 'M', 'returned', true, '本人'),
  c('ct20', 'p3', 'm5', 'S', 'returned', true, '本人'),
  c('ct21', 'p3', 'm7', 'M', 'returned', true, '家属·王强（儿子）'),
  c('ct22', 'p3', 'm9', 'XL', 'returned', true, '本人'),
];

// ---------- 通知 ----------
export const seedNotices: Notice[] = [
  { id: 'n1', roles: ['leader'], programId: 'p2', text: '《草原情》参加社区文艺汇演海选，请尽快补充节目审查材料。', time: '2026-09-20 10:00', kind: 'info' },
  { id: 'n2', roles: ['leader', 'member', 'costume', 'station', 'sound', 'volunteer'], programId: 'p1', text: '国庆联欢演出定于 10月1日 上午9:30，请各岗位提前到位。', time: '2026-09-22 15:00', kind: 'info' },
  { id: 'n3', roles: ['member', 'sound'], programId: 'p1', text: '曲目已更新为「v1.5 剪辑版」（4分30秒），排练与演出均使用此版。', time: '2026-09-21 19:35', kind: 'info' },
];

// ---------- 排练室共用 ----------
export const seedBookings: RoomBooking[] = [
  { id: 'b1', room: '排练室A', teamId: 't1', slot: '周一晚' },
  { id: 'b2', room: '排练室A', teamId: 't1', slot: '周三晚' },
  { id: 'b3', room: '排练室A', teamId: 't2', slot: '周二晚' },
  { id: 'b4', room: '排练室A', teamId: 't2', slot: '周四晚' },
  { id: 'b5', room: '排练室B', teamId: 't1', slot: '周五晚' },
  { id: 'b6', room: '排练室B', teamId: 't2', slot: '周六上午' },
];

// ---------- 现场照片（归档） ----------
export const seedPhotos: Photo[] = [
  { id: 'ph1', programId: 'p3', caption: '街道礼堂演出合影', time: '2026-06-28 11:00' },
  { id: 'ph2', programId: 'p3', caption: '谢幕瞬间 · 月牙阵造型', time: '2026-06-28 11:05' },
];
