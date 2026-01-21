
import { Action } from './types';

export const POSITIVE_ACTIONS: Action[] = [
  { textZh: '積極參與', textEn: 'Good Participation', points: 1, type: 'positive' },
  { textZh: '專心上課', textEn: 'Well Focused', points: 1, type: 'positive' },
  { textZh: '認真學習', textEn: 'Diligent Learning', points: 1, type: 'positive' },
  { textZh: '安靜吃飯', textEn: 'Quiet Eating', points: 1, type: 'positive' },
  { textZh: '配合做課間操', textEn: 'Class Exercise', points: 1, type: 'positive' },
  { textZh: '尊重容老師！', textEn: 'Respect Miss Iong!', points: 3, type: 'positive' },
  { textZh: '你太讓容老師高興了😊！', textEn: 'You made Miss Iong happy! 😊', points: 5, type: 'positive' },
  { textZh: '你簡直太棒了🥳👍！', textEn: 'You are simply amazing 🥳👍!', points: 10, type: 'positive' },
];

export const NEGATIVE_ACTIONS: Action[] = [
  { textZh: '態度欠佳', textEn: 'Bad Attitude', points: -1, type: 'negative' },
  { textZh: '過於吵鬧', textEn: 'Noisy', points: -1, type: 'negative' },
  { textZh: '離開座位', textEn: 'Leaving Seat', points: -1, type: 'negative' },
  { textZh: '不專心', textEn: 'Not Paying Attention', points: -1, type: 'negative' },
  { textZh: '課上聊天', textEn: 'Chatting in Class', points: -1, type: 'negative' },
  { textZh: '對容老師無禮', textEn: 'Disrespectful', points: -3, type: 'negative' },
  { textZh: '你太令容老師失望了😢！', textEn: 'You disappointed Miss Iong! 😢', points: -5, type: 'negative' },
  { textZh: '你太過分/離譜了😡！', textEn: 'You have gone too far 😡!', points: -10, type: 'negative' },
];

export const SCORING_RULES = [
  { labelZh: '100或以上', labelEn: '100 or above', points: '+25' },
  { labelZh: '90～99', labelEn: '90～99', points: '+20' },
  { labelZh: '80～89', labelEn: '80～89', points: '+15' },
  { labelZh: '70～79', labelEn: '70～79', points: '+10' },
  { labelZh: '60～69', labelEn: '60～69', points: '+5' },
];

export const INITIAL_CLASSES = [
  {
    name: '三乙英文 / 3B English',
    students: ["陳芷柔", "陳沛詩", "鄭穎彤", "張晉熙", "朱善恆", "馮子陽", "傅玥寧", "高宇皓", "何梓瑤", "何金霏", "何冠奇", "黃欣彤", "黎芷楹", "黎子滔", "林子洋", "雷翊權", "李祤軒", "梁子泓", "梁皓宸", "梁依晴", "廖巧澄", "駱峻霆", "伍嘉豪", "蕭家軒", "譚灝楊", "丁子皓", "黃芊諭", "王美樂", "許君豪", "周海嵐", "朱麗媛"]
  },
  {
    name: '三乙普通話 / 3B Mandarin',
    students: ["陳芷柔", "陳沛詩", "鄭穎彤", "張晉熙", "朱善恆", "馮子陽", "傅玥寧", "高宇皓", "何梓瑤", "何金霏", "何冠奇", "黃欣彤", "黎芷楹", "黎子滔", "林子洋", "雷翊權", "李祤軒", "梁子泓", "梁皓宸", "梁依晴", "廖巧澄", "駱峻霆", "伍嘉豪", "蕭家軒", "譚灝楊", "丁子皓", "黃芊諭", "王美樂", "許君豪", "周海嵐", "朱麗媛"]
  },
  {
    name: '四乙普通話 / 4B Mandarin',
    students: ["陳沁儀", "陳信豪", "周詩蕎", "鄭瑩瑩", "鄭泓昊", "蔣沁妍", "甘子賢", "關子謙", "謝欣晏", "黃楚堯", "黃翰皓", "容毓俊", "李可欣", "陸皆橋", "馬超芸", "麥嘉俐", "牟智杰", "潘思涵", "蕭珈睿", "黃一進", "王美琳", "趙梓琳", "趙慕辰"]
  },
  {
    name: '四乙 英文 / 4B English',
    students: ["陳沁儀", "陳信豪", "周詩蕎", "鄭瑩瑩", "鄭泓昊", "蔣沁妍", "甘子賢", "關子謙", "謝欣晏", "黃楚堯", "黃翰皓", "容毓俊", "李可欣", "陸皆橋", "馬超芸", "麥嘉俐", "牟智杰", "潘思涵", "蕭珈睿", "黃一進", "王美琳", "趙梓琳", "趙慕辰"]
  },
  {
    name: '四丙 普通話 / 4C Mandarin',
    students: ["曾子朗", "鄭翊翔", "陳梓晴", "許芝霖", "康安娜", "胡栩豪", "黃璐媛", "黃詩皓", "嚴穎兒", "林晉毅", "林雅妍", "林寶堅", "李凱聰", "梁語穎", "龍紀潼", "盧航俊", "盧俊俐", "莫芷晴", "歐陽健豐", "邱佳茵", "余樂恆", "鍾倬民", "鍾倬承"]
  },
  {
    name: '四丙公民 / 4C Citizenship',
    students: ["曾子朗", "鄭翊翔", "陳梓晴", "許芝霖", "康安娜", "胡栩豪", "黃璐媛", "黃詩皓", "嚴穎兒", "林晉毅", "林雅妍", "林寶堅", "李凱聰", "梁語穎", "龍紀潼", "盧航俊", "盧俊俐", "莫芷晴", "歐陽健豐", "邱佳茵", "余樂恆", "鍾倬民", "鍾倬承"]
  },
  {
    name: '五乙普通話 / 5B Mandarin',
    students: ["歐陽卓軒", "陳至濠", "謝穎琳", "鄭智泓", "鄭澳因", "陳靜妍", "陳浩", "聯", "黃羲辰", "郭芷晴", "林安娜", "劉樂澄", "李梓樂", "李天恩", "梁康妮", "梁語翹", "梁智中", "梁賢正", "梁伽藍", "梁凱嵐", "劉一鳴", "盧紫君", "呂建羲", "馬梓倫", "吳子軒", "吳梓浩", "吳穎詩", "彭賢信", "施泓軒", "蕭昊恩", "蘇健羽", "田浩成", "唐敏裕", "黃浩藍"]
  },
];

export const POKEMON_COUNT = 500;
export const AUDIO_URLS = {
  WIN: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3', // Happy clear chime
  LOSE: 'https://assets.mixkit.co/active_storage/sfx/265/265-preview.mp3', // Disappointed thud
  CLAP: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Strong applause
  ROLL: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Ticking "Du-du-du"
  PICK: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3' // Reuse applause for pick
};
