import type {
  Cafe,
  CafeCheckIn,
  CheckedInDreamer,
  DoorbellDream,
  DoorbellRing,
} from "@/types/cafe";
import { MOCK_PROFILES, CURRENT_USER_ID } from "./mockData";

export const MOCK_CAFE_ID = "cafe-gangnam-1";

export const MOCK_CAFE: Cafe = {
  id: MOCK_CAFE_ID,
  name: "Dream Cafe Gangnam",
  address: "123 Teheran-ro, Gangnam-gu",
  city: "Seoul",
  country: "South Korea",
  status: "open",
  openHours: "09:00 - 22:00",
  currentDreamerCount: 5,
  maxCapacity: 30,
  description:
    "A co-dreaming space where dreamers connect over coffee. Share your dream, ring someone's doorbell, and build something together.",
  imageUrl: "",
};

export const MOCK_CHECKED_IN_DREAMERS: CheckedInDreamer[] = [
  {
    id: "checkin-1",
    userId: MOCK_PROFILES[0].userId,
    name: MOCK_PROFILES[0].name,
    avatarUrl: "",
    dreamHeadline: MOCK_PROFILES[0].dreamHeadline,
    checkedInAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "checkin-2",
    userId: MOCK_PROFILES[2].userId,
    name: MOCK_PROFILES[2].name,
    avatarUrl: "",
    dreamHeadline: MOCK_PROFILES[2].dreamHeadline,
    checkedInAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "checkin-3",
    userId: MOCK_PROFILES[4].userId,
    name: MOCK_PROFILES[4].name,
    avatarUrl: "",
    dreamHeadline: MOCK_PROFILES[4].dreamHeadline,
    checkedInAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "checkin-4",
    userId: MOCK_PROFILES[6].userId,
    name: MOCK_PROFILES[6].name,
    avatarUrl: "",
    dreamHeadline: MOCK_PROFILES[6].dreamHeadline,
    checkedInAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "checkin-5",
    userId: MOCK_PROFILES[7].userId,
    name: MOCK_PROFILES[7].name,
    avatarUrl: "",
    dreamHeadline: MOCK_PROFILES[7].dreamHeadline,
    checkedInAt: new Date(Date.now() - 600000).toISOString(),
  },
];

export const MOCK_MY_CHECK_IN: CafeCheckIn | null = null;

export const MOCK_DOORBELL_DREAMS: DoorbellDream[] = [
  {
    id: "dream-1",
    userId: MOCK_PROFILES[0].userId,
    userName: MOCK_PROFILES[0].name,
    avatarUrl: "",
    dreamStatement:
      "Looking for a frontend developer to build an AI tutoring platform together. Let's democratize education!",
    categories: ["tech", "education"],
    neededSkills: ["React / Next.js", "UI Design"],
    isHereNow: true,
    ringCount: 3,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "dream-2",
    userId: MOCK_PROFILES[2].userId,
    userName: MOCK_PROFILES[2].name,
    avatarUrl: "",
    dreamStatement:
      "Seeking a backend engineer and a clinical researcher for a culturally sensitive mental health app.",
    categories: ["tech", "social-impact"],
    neededSkills: ["Node.js / Express", "Machine Learning"],
    isHereNow: true,
    ringCount: 5,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "dream-3",
    userId: MOCK_PROFILES[1].userId,
    userName: MOCK_PROFILES[1].name,
    avatarUrl: "",
    dreamStatement:
      "Need a React developer and supply chain expert to build a sustainable fashion marketplace.",
    categories: ["business", "social-impact"],
    neededSkills: ["React / Next.js", "Supply Chain Management"],
    isHereNow: false,
    ringCount: 2,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "dream-4",
    userId: MOCK_PROFILES[4].userId,
    userName: MOCK_PROFILES[4].name,
    avatarUrl: "",
    dreamStatement:
      "Building a climate tech gamification platform. Need a business strategist and growth hacker to join!",
    categories: ["tech", "business"],
    neededSkills: ["Business Strategy", "Growth Hacking"],
    isHereNow: true,
    ringCount: 1,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "dream-5",
    userId: MOCK_PROFILES[5].userId,
    userName: MOCK_PROFILES[5].name,
    avatarUrl: "",
    dreamStatement:
      "Creating a fair music collaboration platform. Looking for blockchain developers and legal advisors.",
    categories: ["creative", "tech"],
    neededSkills: ["Blockchain / Web3", "Legal Advisory"],
    isHereNow: false,
    ringCount: 4,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "dream-6",
    userId: MOCK_PROFILES[3].userId,
    userName: MOCK_PROFILES[3].name,
    avatarUrl: "",
    dreamStatement:
      "Want to build a micro-investment app for African youth. Need mobile developers and UI designers!",
    categories: ["business", "social-impact"],
    neededSkills: ["Mobile (React Native)", "UI Design"],
    isHereNow: false,
    ringCount: 7,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export const MOCK_MY_DREAM: DoorbellDream = {
  id: "dream-me",
  userId: CURRENT_USER_ID,
  userName: "You",
  avatarUrl: "",
  dreamStatement:
    "Building an AI-powered platform that connects dreamers worldwide. Looking for ML engineers and growth hackers!",
  categories: ["tech", "social-impact"],
  neededSkills: ["Machine Learning", "Growth Hacking"],
  isHereNow: false,
  ringCount: 3,
  createdAt: new Date(Date.now() - 604800000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};

export const MOCK_DOORBELL_RINGS_RECEIVED: DoorbellRing[] = [
  {
    id: "ring-r1",
    dreamId: "dream-me",
    dreamOwnerName: "You",
    ringerId: MOCK_PROFILES[0].userId,
    ringerName: MOCK_PROFILES[0].name,
    ringerAvatarUrl: "",
    message:
      "I'd love to bring my ML expertise to your platform! My NLP work could help with dream matching.",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ring-r2",
    dreamId: "dream-me",
    dreamOwnerName: "You",
    ringerId: MOCK_PROFILES[4].userId,
    ringerName: MOCK_PROFILES[4].name,
    ringerAvatarUrl: "",
    message:
      "Your dream resonates with mine! Let's chat about potential synergies.",
    status: "pending",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "ring-r3",
    dreamId: "dream-me",
    dreamOwnerName: "You",
    ringerId: MOCK_PROFILES[6].userId,
    ringerName: MOCK_PROFILES[6].name,
    ringerAvatarUrl: "",
    message: "Interested in contributing NLP skills to your project.",
    status: "accepted",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const MOCK_DOORBELL_RINGS_SENT: DoorbellRing[] = [
  {
    id: "ring-s1",
    dreamId: "dream-1",
    dreamOwnerName: MOCK_PROFILES[0].name,
    ringerId: CURRENT_USER_ID,
    ringerName: "You",
    ringerAvatarUrl: "",
    message: "I can help build the frontend for your AI tutoring platform!",
    status: "accepted",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "ring-s2",
    dreamId: "dream-2",
    dreamOwnerName: MOCK_PROFILES[2].name,
    ringerId: CURRENT_USER_ID,
    ringerName: "You",
    ringerAvatarUrl: "",
    message: "Your mental health app idea is inspiring. Would love to contribute!",
    status: "pending",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];
