import type { DreamerProfile, MatchResult, Conversation, ChatMessage } from "@/types";

export const CURRENT_USER_ID = "user-me";

export const CURRENT_USER: DreamerProfile = {
  id: "dp-me",
  userId: CURRENT_USER_ID,
  name: "You",
  dreamStatement:
    "I want to build an AI-powered platform that connects dreamers worldwide and helps them form the perfect team to bring their visions to life.",
  dreamHeadline: "Building the future of team formation",
  dreamCategory: "Technology",
  skillsOffered: ["Frontend Development", "UI Design", "Product Management"],
  skillsNeeded: ["Backend Development", "Machine Learning", "Growth Hacking"],
  interests: ["AI", "EdTech", "Social Impact"],
  city: "Seoul",
  country: "South Korea",
  avatarUrl: "",
  bio: "Full-stack dreamer passionate about connecting people through technology.",
  commitmentLevel: "full-time",
  experienceLevel: "mid-career",
};

export const MOCK_PROFILES: DreamerProfile[] = [
  {
    id: "dp-1",
    userId: "user-1",
    name: "Sarah Chen",
    dreamStatement:
      "I dream of creating an AI tutoring platform that personalizes education for every student, making world-class learning accessible regardless of geography or income.",
    dreamHeadline: "Democratizing education with AI",
    dreamCategory: "EdTech",
    skillsOffered: ["Machine Learning", "Backend Development", "Data Science"],
    skillsNeeded: ["UI Design", "Frontend Development", "Content Marketing"],
    interests: ["AI", "EdTech", "Social Impact"],
    city: "San Francisco",
    country: "United States",
    avatarUrl: "",
    bio: "ML engineer at a FAANG company, ready to build something meaningful. 5+ years in NLP and recommendation systems.",
    commitmentLevel: "part-time",
    experienceLevel: "mid-career",
  },
  {
    id: "dp-2",
    userId: "user-2",
    name: "Marcus Rivera",
    dreamStatement:
      "I want to build a sustainable fashion marketplace that connects eco-conscious consumers with verified ethical brands and local artisans.",
    dreamHeadline: "Sustainable fashion for everyone",
    dreamCategory: "E-Commerce",
    skillsOffered: ["Brand Strategy", "Digital Marketing", "Copywriting"],
    skillsNeeded: ["Full-Stack Development", "UI Design", "Supply Chain"],
    interests: ["Sustainability", "Fashion", "Social Commerce"],
    city: "Berlin",
    country: "Germany",
    avatarUrl: "",
    bio: "Brand strategist with 8 years in fashion marketing. Built campaigns for major European brands. Now going indie.",
    commitmentLevel: "full-time",
    experienceLevel: "senior",
  },
  {
    id: "dp-3",
    userId: "user-3",
    name: "Yuki Tanaka",
    dreamStatement:
      "I dream of building a mental health app that uses AI to provide culturally sensitive therapy matching, starting with underserved Asian communities.",
    dreamHeadline: "Mental health across cultures",
    dreamCategory: "HealthTech",
    skillsOffered: ["UX Design", "User Research", "Product Design"],
    skillsNeeded: ["Backend Development", "Machine Learning", "Clinical Research"],
    interests: ["Mental Health", "AI", "Asian Markets"],
    city: "Tokyo",
    country: "Japan",
    avatarUrl: "",
    bio: "UX designer with a psychology background. Previously designed healthcare apps at a Tokyo startup. Bilingual EN/JP.",
    commitmentLevel: "part-time",
    experienceLevel: "mid-career",
  },
  {
    id: "dp-4",
    userId: "user-4",
    name: "Amara Okafor",
    dreamStatement:
      "I want to create a fintech platform that brings micro-investment opportunities to young Africans, helping them build wealth starting from $1.",
    dreamHeadline: "Micro-investing for Africa's youth",
    dreamCategory: "FinTech",
    skillsOffered: ["Financial Planning", "Business Strategy", "Fundraising"],
    skillsNeeded: ["Mobile Development (iOS)", "Mobile Development (Android)", "UI Design"],
    interests: ["FinTech", "Africa", "Youth Empowerment"],
    city: "Lagos",
    country: "Nigeria",
    avatarUrl: "",
    bio: "Former investment banker turned entrepreneur. Raised $2M for my previous startup. Passionate about financial inclusion.",
    commitmentLevel: "full-time",
    experienceLevel: "senior",
  },
  {
    id: "dp-5",
    userId: "user-5",
    name: "Leo Virtanen",
    dreamStatement:
      "I dream of building a climate tech platform that gamifies carbon footprint reduction for businesses, with real-time dashboards and team challenges.",
    dreamHeadline: "Gamifying climate action",
    dreamCategory: "Climate Tech",
    skillsOffered: ["Full-Stack Development", "DevOps / Cloud", "Data Visualization"],
    skillsNeeded: ["Business Strategy", "Sales Strategy", "Growth Hacking"],
    interests: ["Climate Tech", "Gamification", "B2B SaaS"],
    city: "Helsinki",
    country: "Finland",
    avatarUrl: "",
    bio: "Full-stack dev with 6 years at Nordic SaaS companies. Built real-time dashboards handling millions of data points.",
    commitmentLevel: "weekends",
    experienceLevel: "mid-career",
  },
  {
    id: "dp-6",
    userId: "user-6",
    name: "Priya Sharma",
    dreamStatement:
      "I want to build a platform that helps independent musicians collaborate remotely, share royalties fairly, and distribute their music globally.",
    dreamHeadline: "Fair music collaboration platform",
    dreamCategory: "Music Tech",
    skillsOffered: ["Music Production", "Content Creation", "Community Building"],
    skillsNeeded: ["Full-Stack Development", "Blockchain Development", "Legal Advisory"],
    interests: ["Music", "Creator Economy", "Web3"],
    city: "Mumbai",
    country: "India",
    avatarUrl: "",
    bio: "Independent musician and community manager. Built a 50K+ music community on Discord. Ready to turn it into a product.",
    commitmentLevel: "full-time",
    experienceLevel: "early-career",
  },
  {
    id: "dp-7",
    userId: "user-7",
    name: "James Park",
    dreamStatement:
      "I dream of creating a language exchange platform powered by AI that matches native speakers for real-time conversation practice with cultural context.",
    dreamHeadline: "AI-powered language exchange",
    dreamCategory: "EdTech",
    skillsOffered: ["Backend Development", "AI / Deep Learning", "Natural Language Processing"],
    skillsNeeded: ["UI Design", "Growth Hacking", "Content Marketing"],
    interests: ["AI", "Language Learning", "Cultural Exchange"],
    city: "Seoul",
    country: "South Korea",
    avatarUrl: "",
    bio: "NLP researcher with publications in multilingual AI. Fluent in Korean, English, and Japanese. Built speech recognition systems.",
    commitmentLevel: "part-time",
    experienceLevel: "mid-career",
  },
  {
    id: "dp-8",
    userId: "user-8",
    name: "Elena Kowalski",
    dreamStatement:
      "I want to build a remote-first project management tool specifically designed for creative teams — think Notion meets Figma for agencies.",
    dreamHeadline: "Creative project management reimagined",
    dreamCategory: "Productivity",
    skillsOffered: ["Product Management", "Agile / Scrum", "UI Design"],
    skillsNeeded: ["Frontend Development", "Backend Development", "DevOps / Cloud"],
    interests: ["SaaS", "Productivity", "Design Tools"],
    city: "Warsaw",
    country: "Poland",
    avatarUrl: "",
    bio: "Product manager at a design agency. Tried every PM tool out there — none work for creative teams. Time to build our own.",
    commitmentLevel: "full-time",
    experienceLevel: "mid-career",
  },
];

function computeMatchScores(
  me: DreamerProfile,
  other: DreamerProfile
): { matchScore: number; dreamScore: number; skillScore: number; valueScore: number; complementarySkills: string[]; sharedInterests: string[] } {
  // Skill complementarity: how many of my needed skills does the other person offer?
  const complementarySkills = other.skillsOffered.filter((s) =>
    me.skillsNeeded.includes(s)
  );
  const reverseComplementary = me.skillsOffered.filter((s) =>
    other.skillsNeeded.includes(s)
  );
  const skillScore = me.skillsNeeded.length > 0 && other.skillsNeeded.length > 0
    ? ((complementarySkills.length / me.skillsNeeded.length) +
       (reverseComplementary.length / other.skillsNeeded.length)) / 2
    : 0;

  // Shared interests
  const sharedInterests = me.interests.filter((i) =>
    other.interests.includes(i)
  );
  const totalInterests = new Set([...me.interests, ...other.interests]).size;
  const valueScore = totalInterests > 0 ? sharedInterests.length / totalInterests : 0;

  // Dream similarity (simplified — keyword overlap for MVP)
  const myWords = new Set(me.dreamStatement.toLowerCase().split(/\W+/));
  const otherWords = new Set(other.dreamStatement.toLowerCase().split(/\W+/));
  const commonWords = [...myWords].filter((w) => otherWords.has(w) && w.length > 3);
  const dreamScore = Math.min(commonWords.length / 15, 1);

  // Geometric mean inspired combined score (as per design doc)
  const weightedScore =
    dreamScore * 0.4 + skillScore * 0.35 + valueScore * 0.25;
  const matchScore = Math.round(weightedScore * 100);

  return {
    matchScore,
    dreamScore: Math.round(dreamScore * 100),
    skillScore: Math.round(skillScore * 100),
    valueScore: Math.round(valueScore * 100),
    complementarySkills,
    sharedInterests,
  };
}

export const MOCK_MATCHES: MatchResult[] = MOCK_PROFILES.map((profile) => {
  const scores = computeMatchScores(CURRENT_USER, profile);
  return {
    id: `match-${profile.userId}`,
    profile,
    ...scores,
    status: "pending" as const,
  };
}).sort((a, b) => b.matchScore - a.matchScore);

export const MOCK_ACCEPTED_MATCHES: MatchResult[] = MOCK_MATCHES.slice(0, 3).map(
  (m) => ({ ...m, status: "accepted" as const })
);

export const MOCK_CONVERSATIONS: Conversation[] = MOCK_ACCEPTED_MATCHES.map(
  (m, i) => ({
    matchId: m.id,
    partner: m.profile,
    lastMessage:
      i === 0
        ? "That sounds amazing! I'd love to chat about the technical architecture."
        : i === 1
          ? "Hey! I saw we're a great match. When are you free to talk?"
          : "Thanks for connecting! Your dream really resonates with me.",
    lastMessageAt: new Date(
      Date.now() - (i + 1) * 3600000
    ).toISOString(),
    unreadCount: i === 0 ? 2 : 0,
  })
);

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = Object.fromEntries(
  MOCK_ACCEPTED_MATCHES.map((m) => [
    m.id,
    [
      {
        id: `msg-${m.id}-1`,
        matchId: m.id,
        senderId: m.profile.userId,
        content: `Hi! I'm ${m.profile.name}. I noticed we have complementary skills — I think we could build something great together!`,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: `msg-${m.id}-2`,
        matchId: m.id,
        senderId: CURRENT_USER_ID,
        content:
          "Hey! Thanks for reaching out. Your dream statement really resonates with what I'm trying to build. Tell me more about your background!",
        createdAt: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: `msg-${m.id}-3`,
        matchId: m.id,
        senderId: m.profile.userId,
        content:
          "That sounds amazing! I'd love to chat about the technical architecture.",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  ])
);
