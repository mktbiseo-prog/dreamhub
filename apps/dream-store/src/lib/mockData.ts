import type { DreamStory, Supporter, DreamCommentView } from "./types";

const storyDefaults = {
  creatorBio: "",
  originStory: "",
  processImages: [] as string[],
  impactStatement: "",
  isFeatured: false,
  isStaffPick: false,
  creatorStage: "early" as string,
  followerCount: 0,
};

export const MOCK_STORIES: DreamStory[] = [
  {
    ...storyDefaults,
    id: "story-1",
    userId: "user-1",
    title: "Handcrafted Ceramics from My Home Studio",
    statement:
      "I dream of turning my passion for ceramics into a full-time career. Every piece I create is shaped by hand with love and intention. My goal is to build a sustainable studio where I can teach others and create pieces that bring warmth to people's homes.",
    coverImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=400&fit=crop",
    creatorName: "Maya Chen",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    creatorBio: "Self-taught ceramicist based in Portland, OR. 8 years of making things with my hands. Previously a graphic designer — traded pixels for clay.",
    originStory: "It all started when I took a weekend pottery class on a whim. The moment my hands touched the clay on the wheel, something clicked. I spent the next 3 years learning everything I could, filling my apartment with mugs and bowls. My friends started asking to buy them, and that's when I realized — this could be more than a hobby.",
    processImages: [
      "https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&h=400&fit=crop",
    ],
    impactStatement: "Every purchase funds my dream of opening a community ceramics studio. One mug = one step closer to a space where anyone can learn the craft.",
    isFeatured: true,
    isStaffPick: true,
    creatorStage: "growing",
    category: "Art & Craft",
    supporterCount: 127,
    followerCount: 89,
    createdAt: "2025-11-15",
    milestones: [
      { id: "m1", title: "First 50 supporters", targetDate: "2025-12-01", completed: true, sortOrder: 0 },
      { id: "m2", title: "Launch online workshop", targetDate: "2026-03-01", completed: false, sortOrder: 1 },
      { id: "m3", title: "Open my own studio", targetDate: "2026-09-01", completed: false, sortOrder: 2 },
    ],
    products: [
      {
        id: "prod-1",
        dreamStoryId: "story-1",
        title: "Sunrise Mug — Handmade Ceramic",
        description: "A hand-thrown ceramic mug glazed in warm sunrise tones. Each mug is one-of-a-kind, perfect for your morning ritual.",
        price: 3500,
        images: [
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=600&fit=crop",
        ],
        whyIMadeThis: "This mug represents the beginning of every day — a fresh start. I wanted to create something that people reach for first thing in the morning and feel a moment of calm.",
        category: "Art & Craft",
        productType: "Physical Product",
      },
      {
        id: "prod-2",
        dreamStoryId: "story-1",
        title: "Ocean Bowl Set (2 pcs)",
        description: "A set of two handcrafted bowls with deep ocean-blue glaze. Perfect for soups, salads, or as decorative pieces.",
        price: 5800,
        images: [
          "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop",
        ],
        whyIMadeThis: "The ocean has always been my biggest inspiration. These bowls carry the depth and movement of the sea in every swirl of glaze.",
        category: "Art & Craft",
        productType: "Physical Product",
      },
    ],
  },
  {
    ...storyDefaults,
    id: "story-2",
    userId: "user-2",
    title: "AI-Powered Tools for Small Farmers",
    statement:
      "I'm building affordable AI tools that help small-scale farmers predict weather patterns, optimize irrigation, and increase crop yields. Technology shouldn't only serve big agriculture — every farmer deserves smart tools.",
    coverImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop",
    creatorName: "Daniel Okafor",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    creatorBio: "Agricultural engineer and ML researcher. Born in Nigeria, now building tech that bridges the gap between Silicon Valley and rural farms worldwide.",
    originStory: "Growing up, I watched my grandparents farm by instinct alone — reading the sky, feeling the soil. When I studied computer science in college, I realized: what if we could give every farmer a digital farming advisor? I quit my BigTech job to make it happen.",
    impactStatement: "Each FarmSight kit deployed means one more family can make data-driven decisions about their land. Your purchase literally feeds communities.",
    isFeatured: true,
    creatorStage: "growing",
    category: "Technology",
    supporterCount: 89,
    followerCount: 156,
    createdAt: "2025-12-01",
    milestones: [
      { id: "m4", title: "Beta launch with 10 farms", targetDate: "2026-01-15", completed: true, sortOrder: 0 },
      { id: "m5", title: "Expand to 100 farms", targetDate: "2026-06-01", completed: false, sortOrder: 1 },
      { id: "m6", title: "Launch mobile app", targetDate: "2026-12-01", completed: false, sortOrder: 2 },
    ],
    products: [
      {
        id: "prod-3",
        dreamStoryId: "story-2",
        title: "FarmSight Starter Kit",
        description: "Soil sensor + weather station + 1-year subscription to the FarmSight AI dashboard. Everything a small farmer needs to start making data-driven decisions.",
        price: 12900,
        images: ["https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=600&fit=crop"],
        whyIMadeThis: "I grew up watching my grandparents farm by instinct alone. This kit is for every farmer who deserves the same technology that large farms use.",
        category: "Technology",
        productType: "Physical Product",
      },
    ],
  },
  {
    ...storyDefaults,
    id: "story-3",
    userId: "user-3",
    title: "Zero-Waste Bakery in Brooklyn",
    statement:
      "My dream is to open a fully zero-waste bakery in Brooklyn. Every ingredient sourced locally, every scrap composted or repurposed. Delicious bread shouldn't cost the earth.",
    coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=400&fit=crop",
    creatorName: "Sofia Martinez",
    creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    creatorBio: "Baker, sustainability nerd, Brooklyn local. Former chef at a Michelin-starred restaurant — now chasing sourdough and zero-waste dreams.",
    originStory: "After years working in fine dining, I was shocked by the waste. Mountains of perfectly good food thrown away nightly. I started baking at home with local flour, giving loaves to neighbors. The response was overwhelming — turns out people are hungry for bread that doesn't cost the earth.",
    impactStatement: "Each subscription diverts 5kg of food waste from landfills monthly and supports local organic farmers within 50 miles of Brooklyn.",
    isStaffPick: true,
    creatorStage: "established",
    category: "Food & Drink",
    supporterCount: 203,
    followerCount: 312,
    createdAt: "2025-10-20",
    milestones: [
      { id: "m7", title: "Raise seed funding", targetDate: "2025-12-15", completed: true, sortOrder: 0 },
      { id: "m8", title: "Sign lease for bakery space", targetDate: "2026-02-01", completed: true, sortOrder: 1 },
      { id: "m9", title: "Grand opening day", targetDate: "2026-05-01", completed: false, sortOrder: 2 },
    ],
    products: [
      {
        id: "prod-4",
        dreamStoryId: "story-3",
        title: "Monthly Bread Subscription Box",
        description: "4 artisan loaves delivered to your door every month. Sourdough, rye, whole wheat, and a seasonal special. All zero-waste, all delicious.",
        price: 4200,
        images: ["https://images.unsplash.com/photo-1549931319-a545753467c8?w=600&h=600&fit=crop"],
        whyIMadeThis: "Bread is the most universal food. By making it sustainably, I want to prove that everyday essentials can be both delicious and kind to the planet.",
        category: "Food & Drink",
        productType: "Physical Product",
      },
      {
        id: "prod-5",
        dreamStoryId: "story-3",
        title: "Baking Workshop — Learn Sourdough",
        description: "A 3-hour hands-on workshop where you'll learn to bake your own sourdough from scratch. Includes starter kit to take home.",
        price: 6500,
        images: ["https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&h=600&fit=crop"],
        whyIMadeThis: "Teaching is how dreams multiply. When you learn to bake, you carry a piece of this dream into your own kitchen.",
        category: "Food & Drink",
        productType: "Class",
      },
    ],
  },
  {
    ...storyDefaults,
    id: "story-4",
    userId: "user-4",
    title: "Free Coding Bootcamp for Refugees",
    statement:
      "I'm building a free online coding bootcamp designed specifically for refugees and displaced people. Technology skills are the great equalizer — they transcend borders and open doors everywhere.",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop",
    creatorName: "Amir Hassan",
    creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    creatorBio: "Software engineer, former refugee from Syria. Now a tech lead at a startup. Building the bootcamp I wish I had when I arrived with nothing.",
    originStory: "When I arrived in Germany as a refugee in 2015, I had no network, limited language skills, and zero job prospects. A free online course taught me to code, and within 18 months I had a developer job. I want to replicate that transformation for thousands more.",
    impactStatement: "Every student sponsored gains a career-launching skill. 87% of our graduates find tech employment within 6 months.",
    creatorStage: "established",
    category: "Education",
    supporterCount: 341,
    followerCount: 478,
    createdAt: "2025-09-10",
    milestones: [
      { id: "m10", title: "First cohort of 30 students", targetDate: "2025-11-01", completed: true, sortOrder: 0 },
      { id: "m11", title: "Partner with 5 tech companies for hiring", targetDate: "2026-04-01", completed: false, sortOrder: 1 },
      { id: "m12", title: "Scale to 500 students globally", targetDate: "2026-10-01", completed: false, sortOrder: 2 },
    ],
    products: [
      {
        id: "prod-6",
        dreamStoryId: "story-4",
        title: "Sponsor a Student — Full Bootcamp",
        description: "Your support covers one student's entire 12-week bootcamp: curriculum, mentorship, career coaching, and job placement support.",
        price: 15000,
        images: ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop"],
        whyIMadeThis: "Every student sponsored is a life changed. You're not just buying a product — you're investing in someone's future.",
        category: "Education",
        productType: "Service",
      },
    ],
  },
  {
    ...storyDefaults,
    id: "story-5",
    userId: "user-5",
    title: "Sustainable Fashion from Recycled Ocean Plastic",
    statement:
      "I'm turning ocean plastic waste into beautiful, durable fashion. Every garment we make removes plastic from the sea and proves that sustainability can be stylish.",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop",
    creatorName: "Lena Park",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    creatorBio: "Fashion designer and ocean conservation advocate. Studied at Parsons, interned at Patagonia. Now building the brand I always wanted to exist.",
    originStory: "During a surf trip in Bali, I saw beaches buried in plastic. I spent 3 months learning textile recycling and discovered you can make beautiful, soft fabrics from ocean waste. That trip changed everything — I came home and started designing.",
    impactStatement: "Each item sold removes measured ocean plastic. We've removed 450kg so far. Your purchase literally cleans the ocean.",
    isFeatured: true,
    creatorStage: "growing",
    category: "Fashion & Beauty",
    supporterCount: 178,
    followerCount: 234,
    createdAt: "2025-11-01",
    milestones: [
      { id: "m13", title: "First capsule collection launch", targetDate: "2026-01-01", completed: true, sortOrder: 0 },
      { id: "m14", title: "Remove 1 ton of ocean plastic", targetDate: "2026-06-01", completed: false, sortOrder: 1 },
      { id: "m15", title: "Open pop-up store", targetDate: "2026-09-01", completed: false, sortOrder: 2 },
    ],
    products: [
      {
        id: "prod-7",
        dreamStoryId: "story-5",
        title: "Ocean Tote Bag",
        description: "A stylish everyday tote made from 100% recycled ocean plastic fibers. Water-resistant, durable, and each one removes 0.5kg of ocean waste.",
        price: 4500,
        images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop"],
        whyIMadeThis: "I wanted to create something useful and beautiful from what we throw away. This bag is a daily reminder that waste can become wonder.",
        category: "Fashion & Beauty",
        productType: "Physical Product",
      },
      {
        id: "prod-8",
        dreamStoryId: "story-5",
        title: "Recycled Fiber Hoodie — Unisex",
        description: "Ultra-soft hoodie made from recycled ocean plastic yarn. Available in Ocean Blue and Sand. Each hoodie removes 1.2kg of plastic from the sea.",
        price: 8900,
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop"],
        whyIMadeThis: "Fashion is the second most polluting industry. This hoodie is proof that we can do better — and look great doing it.",
        category: "Fashion & Beauty",
        productType: "Physical Product",
      },
    ],
  },
  {
    ...storyDefaults,
    id: "story-6",
    userId: "user-6",
    title: "Community Music Studio for At-Risk Youth",
    statement:
      "I dream of giving every kid in my neighborhood access to professional music equipment and mentorship. Music saved my life, and I want to pay it forward.",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=400&fit=crop",
    creatorName: "Marcus Johnson",
    creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    creatorBio: "Producer, music teacher, and community organizer in South LA. Grammy-nominated backing vocalist turned full-time youth mentor.",
    originStory: "I grew up in a neighborhood where the only after-school options were the streets. A church basement with a beat-up keyboard changed my life. Now I have the skills, the vision, and the network — I just need the space and the gear to give the next generation that same chance.",
    impactStatement: "Each gift card directly funds mentorship sessions for at-risk youth. 90% of our students stay in school and report improved mental health.",
    isStaffPick: true,
    creatorStage: "established",
    category: "Social Impact",
    supporterCount: 256,
    followerCount: 390,
    createdAt: "2025-10-05",
    milestones: [
      { id: "m16", title: "Secure studio space", targetDate: "2025-12-01", completed: true, sortOrder: 0 },
      { id: "m17", title: "First class of 20 students", targetDate: "2026-03-01", completed: false, sortOrder: 1 },
      { id: "m18", title: "Student showcase concert", targetDate: "2026-07-01", completed: false, sortOrder: 2 },
    ],
    products: [
      {
        id: "prod-9",
        dreamStoryId: "story-6",
        title: "Studio Session Gift Card",
        description: "Give the gift of music. This card provides one youth with 4 studio sessions including equipment access and one-on-one mentorship.",
        price: 8000,
        images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=600&fit=crop"],
        whyIMadeThis: "Music taught me discipline, creativity, and hope. This gift card is a ticket to that same transformation for a young person who needs it.",
        category: "Social Impact",
        productType: "Service",
      },
    ],
  },
];

export const MOCK_SUPPORTERS: Supporter[] = [
  { id: "s1", name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop&crop=face", supportedAt: "2026-01-15", amount: 3500 },
  { id: "s2", name: "Jordan Lee", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face", supportedAt: "2026-01-12", amount: 5800 },
  { id: "s3", name: "Sam Patel", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=face", supportedAt: "2026-01-10", amount: 3500 },
  { id: "s4", name: "Casey Kim", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face", supportedAt: "2026-01-08", amount: 5800 },
  { id: "s5", name: "Riley Morgan", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop&crop=face", supportedAt: "2026-01-05", amount: 3500 },
  { id: "s6", name: "Taylor Swift", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop&crop=face", supportedAt: "2026-01-03", amount: 5800 },
  { id: "s7", name: "Jamie Fox", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=face", supportedAt: "2025-12-28", amount: 3500 },
  { id: "s8", name: "Morgan Yu", avatar: "https://images.unsplash.com/photo-1645830166230-187caf791b90?w=80&h=80&fit=crop&crop=face", supportedAt: "2025-12-25", amount: 3500 },
];

export const MOCK_COMMENTS: DreamCommentView[] = [
  { id: "c1", content: "Your ceramics are absolutely stunning! The sunrise mug is my favorite piece in my kitchen. So proud to support this dream!", userName: "Alex Rivera", userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop&crop=face", userId: "s1", createdAt: "2026-01-16" },
  { id: "c2", content: "Can't wait for the workshop! You're going to inspire so many people.", userName: "Jordan Lee", userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face", userId: "s2", createdAt: "2026-01-14" },
  { id: "c3", content: "Just received my ocean bowls — the glaze is even more beautiful in person. Keep dreaming, Maya!", userName: "Sam Patel", userAvatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=face", userId: "s3", createdAt: "2026-01-11" },
];

export function getStoryById(id: string): DreamStory | undefined {
  return MOCK_STORIES.find((s) => s.id === id);
}

export function getProductById(productId: string): {
  product: DreamStory["products"][number];
  story: DreamStory;
} | undefined {
  for (const story of MOCK_STORIES) {
    const product = story.products.find((p) => p.id === productId);
    if (product) return { product, story };
  }
  return undefined;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
