import OpenAI from "openai";

export interface CoachResponse {
  message: string;
  suggestions: string[];
  encouragement: string;
}

export interface CoachRequest {
  userMessage: string;
  activityId: number;
  activityName: string;
  partNumber: number;
  userName?: string;
  dreamStatement?: string;
  context?: Record<string, unknown>;
  chatHistory?: { role: "user" | "coach"; text: string }[];
}

const SYSTEM_PROMPT = `You are Dream Planner's AI Coach, inspired by Simon Squibb's philosophy: "Everyone has the right to chase their dream."

Your role:
- Guide users through their dream planning journey (4 PARTs, 20 activities)
- Be encouraging, practical, and action-oriented
- Reference the user's own data when available
- Keep responses concise (2-4 sentences max for message, 1-2 sentences per suggestion)
- Never be preachy or generic. Be specific and personal.

Tone:
- Conversational, like a smart friend who believes in them
- Use "you" and "your" — make it personal
- Occasional humor is welcome
- Challenge them gently when they're playing it safe

PART context:
- PART 1 (Face My Reality): Skills inventory, resource map, time log, money flow, current state
- PART 2 (Discover My Dream): Experience mind map, failure resume, strengths redefine, market scan, why-what bridge
- PART 3 (Validate & Build): One-line proposal, hypothesis board, zero-cost MVP, value ladder
- PART 4 (Connect & Expand): First 10 fans, dream 5 network, rejection collection, sustainable system, traffic light, sustainability checklist

Respond ONLY with valid JSON:
{"message":"...","suggestions":["...","..."],"encouragement":"..."}

- "message": Direct response to the user (2-4 sentences)
- "suggestions": 1-3 actionable tips
- "encouragement": Short motivational nudge (1 sentence)`;

function buildUserPrompt(req: CoachRequest): string {
  const parts: string[] = [];

  parts.push(`Current: PART ${req.partNumber}, Activity ${req.activityId} (${req.activityName})`);

  if (req.userName) parts.push(`User: ${req.userName}`);
  if (req.dreamStatement) parts.push(`Dream: ${req.dreamStatement}`);

  if (req.context && Object.keys(req.context).length > 0) {
    parts.push(`Context: ${JSON.stringify(req.context).slice(0, 1500)}`);
  }

  if (req.chatHistory && req.chatHistory.length > 0) {
    const recent = req.chatHistory.slice(-4);
    parts.push(
      "Chat history:\n" +
        recent.map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`).join("\n")
    );
  }

  parts.push(`User: ${req.userMessage}`);

  return parts.join("\n\n");
}

const MOCK_HINTS: Record<number, CoachResponse> = {
  1: {
    message: "Your skills inventory is a goldmine. Don't just list job skills — include things people ask you for help with, hobbies that could become services, and skills you take for granted.",
    suggestions: ["Add at least 3 skills you use outside of work", "Rate each skill honestly — a 3 means you can get started"],
    encouragement: "The best businesses are built on skills you already have.",
  },
  2: {
    message: "Resource mapping is about awareness, not judgment. Low scores aren't failures — they're signals for where to find partners or get creative.",
    suggestions: ["Focus on your highest-scoring resource first", "For low scores, think: who in your network has this?"],
    encouragement: "You have more resources than you think.",
  },
  3: {
    message: "Time is your most honest mirror. Track a typical week, not your best week. The patterns will surprise you.",
    suggestions: ["Look for 'golden hours' when you're most productive", "Identify consumption time you could convert"],
    encouragement: "Awareness is the first step to change.",
  },
  4: {
    message: "Money reveals your real priorities, not the ones you think you have. Low satisfaction + high spending = your biggest opportunity.",
    suggestions: ["Sort expenses by satisfaction rating", "Find one expense you could redirect toward your dream"],
    encouragement: "Every dollar redirected is an investment in your future.",
  },
  5: {
    message: "Constraints aren't walls — they're the edges of your current map. Every limitation is a potential business idea waiting to happen.",
    suggestions: ["Be brutally honest about stress — clarity starts with truth", "Look for hidden opportunities in your constraints"],
    encouragement: "Your current reality is just your starting point.",
  },
  6: {
    message: "Your experience mind map is where connections happen. The most interesting ideas live at the intersection of different branches.",
    suggestions: ["Connect experiences from different life areas", "Look for patterns across branches"],
    encouragement: "Your unique combination of experiences is your superpower.",
  },
  7: {
    message: "Failures aren't setbacks — they're data. Every lesson from a failure is worth more than a year of theory.",
    suggestions: ["Focus on the lesson, not the emotion", "Look for recurring patterns in your failures"],
    encouragement: "The most successful people have the longest failure resumes.",
  },
  8: {
    message: "Reframing weaknesses is a superpower. 'Too detail-oriented' becomes 'Quality-focused'. 'Impatient' becomes 'Action-oriented'.",
    suggestions: ["Ask a friend how they'd reframe your weakness", "Think about when your weakness was actually helpful"],
    encouragement: "Your weaknesses are just strengths waiting to be reframed.",
  },
  9: {
    message: "30 minutes of market scanning can reveal more than weeks of planning. Look for gaps — what are people complaining about?",
    suggestions: ["Check YouTube comments for pain points", "Look for bestselling books in your area"],
    encouragement: "The best ideas solve real problems real people have.",
  },
  10: {
    message: "The Why-What Bridge connects your purpose to your product. Start with why you care, then figure out what to build.",
    suggestions: ["Use the twist matrix to unlock creative combinations", "Rate each idea honestly on all three axes"],
    encouragement: "The idea that excites you most is usually the right one.",
  },
  11: {
    message: "A one-line proposal forces clarity. If you can't explain it in one sentence, you don't understand it yet.",
    suggestions: ["Generate multiple combinations before choosing", "Test your proposal on someone outside your industry"],
    encouragement: "Simplicity is the ultimate sophistication.",
  },
  12: {
    message: "Hypotheses are free, assumptions are expensive. Test before you build. The goal is learning, not being right.",
    suggestions: ["Start with the riskiest assumption first", "Define success criteria before you test"],
    encouragement: "Every failed hypothesis saves you months of wasted effort.",
  },
  13: {
    message: "Your MVP doesn't need to be perfect. It needs to be real enough that people can say yes or no.",
    suggestions: ["What's the simplest version that delivers value?", "Can you test this in 48 hours with zero budget?"],
    encouragement: "Done is better than perfect. Ship it.",
  },
  14: {
    message: "The value ladder turns free followers into paying customers. Each step should deliver 10x the value of its price.",
    suggestions: ["Start with a free offering that showcases your expertise", "Make each tier feel like an obvious upgrade"],
    encouragement: "Build the ladder one step at a time.",
  },
  15: {
    message: "Your first 10 fans are more valuable than 10,000 followers. These are people who will tell others about you.",
    suggestions: ["Provide value before asking for anything", "Move each candidate through the pipeline step by step"],
    encouragement: "10 true fans can launch an empire.",
  },
  16: {
    message: "Your Dream 5 network is your board of advisors. Choose people who complement your weaknesses.",
    suggestions: ["Reach out to your mentor candidate this week", "Offer value to peers before asking for help"],
    encouragement: "You're the average of the 5 people you spend the most time with.",
  },
  17: {
    message: "Rejection is a skill. The more you practice, the less it hurts. Most successful people collected hundreds of rejections.",
    suggestions: ["Start with low-stakes rejections to build tolerance", "Write down what you learned after each one"],
    encouragement: "Every 'no' gets you closer to a 'yes'.",
  },
  18: {
    message: "A sustainable system beats motivation every time. Design your environment for success, not willpower.",
    suggestions: ["Block your top 3 distractions before they happen", "Build in rewards — you deserve them"],
    encouragement: "Systems beat goals. Build yours today.",
  },
  19: {
    message: "The traffic light analysis helps you stop wasting energy on things that don't matter. Be honest about what needs to go.",
    suggestions: ["Put at least one thing in the red column", "For yellow items, set a deadline to decide"],
    encouragement: "Saying no to the wrong things means saying yes to the right ones.",
  },
  20: {
    message: "Your sustainability checklist is a health check for your dream. Financial, mental, and social — all three matter.",
    suggestions: ["Address 'Needs Work' items with specific plans", "Check in on this monthly"],
    encouragement: "A sustainable dream is an achievable dream.",
  },
};

const CONVERSATIONAL_RESPONSES: CoachResponse[] = [
  {
    message: "That's a great question! Try breaking it down into smaller parts. What's the smallest first step you can take right now?",
    suggestions: ["Write down the one thing you can do today", "Don't wait for the perfect plan — start messy"],
    encouragement: "Progress beats perfection every time.",
  },
  {
    message: "I love that you're thinking about this. What if you approached it from the perspective of someone who already solved it? What would they tell you?",
    suggestions: ["Google someone who did something similar", "Reach out and ask them one question"],
    encouragement: "The answers are out there — go find them.",
  },
  {
    message: "You're on the right track. Don't overthink it — write down what feels true, then refine later. Your gut knows more than you think.",
    suggestions: ["Set a 5-minute timer and just write", "You can always edit later — get it on paper first"],
    encouragement: "Trust your instincts. They're smarter than you give them credit for.",
  },
  {
    message: "Interesting! Based on what you've shared, I'd suggest focusing on what excites you most. Energy is your best signal for finding your path.",
    suggestions: ["Circle the items that make you feel energized", "Drop the ones that feel like 'should' instead of 'want'"],
    encouragement: "Follow the energy. It knows the way.",
  },
  {
    message: "The goal isn't to have perfect answers. It's to build self-awareness. You're already doing that by asking this question.",
    suggestions: ["Keep going — every answer reveals something new", "Come back to this activity tomorrow with fresh eyes"],
    encouragement: "Self-awareness is the foundation of every successful dream.",
  },
];

// ── Stuck detection messages (per activity) ──
export const STUCK_MESSAGES: Record<number, CoachResponse> = {
  1: {
    message: "Looks like you've paused. Sometimes the hardest skills to list are the ones you take for granted. What do people ask you for help with?",
    suggestions: ["Think about last week — what did you help someone with?", "Include hobbies, not just job skills"],
    encouragement: "Everyone has hidden skills. Let's find yours.",
  },
  2: {
    message: "Resource mapping can feel overwhelming. Start with the one you feel most confident about, then work outward.",
    suggestions: ["Move the slider for your strongest resource first", "A 2 or 3 is perfectly normal — it's honest"],
    encouragement: "Honesty is the foundation of a great plan.",
  },
  3: {
    message: "Tracking time can feel tedious. Try just adding yesterday's schedule — it doesn't have to be perfect.",
    suggestions: ["Start with morning — what did you do first?", "Include breaks and scrolling time too"],
    encouragement: "Awareness is the first step to reclaiming your time.",
  },
  4: {
    message: "Don't overthink each expense. Just add the last 5 things you spent money on and rate how happy they made you.",
    suggestions: ["Check your recent bank or card transactions", "Focus on the satisfaction score — that's the insight"],
    encouragement: "Small changes in spending can fund big dreams.",
  },
  5: {
    message: "This is about honesty, not perfection. What's the one thing about your current situation that bothers you the most?",
    suggestions: ["Start with 'Concerns' — what keeps you up at night?", "Every constraint hides an opportunity"],
    encouragement: "Acknowledging reality is the bravest first step.",
  },
  6: {
    message: "Mind maps grow organically. Double-click anywhere to add a branch. Start with one memory that shaped who you are.",
    suggestions: ["Add a childhood memory that still matters to you", "Connect branches that share a theme"],
    encouragement: "Your experiences are the raw material of your dream.",
  },
  7: {
    message: "Listing failures takes courage. Remember: every successful person has a longer failure list than you think.",
    suggestions: ["What's one thing you tried that didn't work?", "Focus on the lesson, not the pain"],
    encouragement: "Failures are just lessons with bad PR.",
  },
  8: {
    message: "Stuck on reframing? Try this: take your biggest weakness and ask 'When has this actually helped me?'",
    suggestions: ["'Too sensitive' = Highly empathetic", "'Impatient' = Action-oriented"],
    encouragement: "Your weaknesses are strengths in disguise.",
  },
  9: {
    message: "The timer isn't running yet! Pick one tab and start scanning. 10 minutes is enough to find a goldmine.",
    suggestions: ["Try YouTube first — search for your topic and read comments", "Note what people complain about"],
    encouragement: "The best business ideas are hiding in plain sight.",
  },
  10: {
    message: "The Why can feel abstract. Try completing this sentence: 'I care about this because...' and see where it leads.",
    suggestions: ["Write your Why as if explaining to a 10-year-old", "What would you do if money wasn't a factor?"],
    encouragement: "Your Why is your compass. It doesn't have to be profound — just true.",
  },
  11: {
    message: "Writer's block on the proposal? Don't aim for perfect — aim for specific. Who exactly do you help?",
    suggestions: ["Fill in just the [TARGET] first", "Generate 3+ combos before picking a favorite"],
    encouragement: "Clarity comes from iteration, not inspiration.",
  },
  12: {
    message: "Hypotheses don't have to be complicated. 'I can get 3 people to say yes to X' is a great start.",
    suggestions: ["What's the riskiest assumption? Test that first", "Success criteria should be a specific number"],
    encouragement: "Testing is cheaper than guessing.",
  },
  13: {
    message: "The simplest MVP is often the best. Can you describe your offer on one Instagram post? That's a valid MVP.",
    suggestions: ["Choose the MVP type that you can launch this weekend", "Focus on steps, not perfection"],
    encouragement: "Ship something ugly today rather than something pretty never.",
  },
  14: {
    message: "Think of the value ladder as a journey: free sample → small purchase → main offer → premium experience.",
    suggestions: ["Start at the bottom — what can you give for free?", "Each rung should 10x the value for the price"],
    encouragement: "Start free, earn trust, then ask for money.",
  },
  15: {
    message: "Fans start as acquaintances. Think of 3 people who've shown interest in your topic — they're your first candidates.",
    suggestions: ["Who liked or commented on your last post about this?", "Offer value first — advice, a free template, your time"],
    encouragement: "10 true fans are worth more than 10,000 followers.",
  },
  16: {
    message: "Your Dream 5 doesn't have to include famous people. Look for 1 mentor, 2 peers doing similar things, and 2 potential partners.",
    suggestions: ["Who do you already admire in this space?", "Send a genuine compliment — that's how relationships start"],
    encouragement: "Your network is your net worth. Build it intentionally.",
  },
  17: {
    message: "Rejection feels scary, but it's just practice. Start with something small: ask for a discount at a coffee shop.",
    suggestions: ["Pick the easiest challenge first", "Write down your fear, then do it anyway"],
    encouragement: "The sting of rejection fades fast. The growth doesn't.",
  },
  18: {
    message: "Systems beat motivation. What's the one daily habit that would move the needle most for your dream?",
    suggestions: ["Choose 1 core activity — not 5", "Block your biggest distraction for 1 hour each day"],
    encouragement: "Small daily actions compound into extraordinary results.",
  },
  19: {
    message: "Be brutally honest: what are you doing that you should stop? That's your red light.",
    suggestions: ["If it doesn't excite or serve you, it's yellow at best", "Green = brings energy AND results"],
    encouragement: "Saying no is a superpower.",
  },
  20: {
    message: "The checklist is a mirror. Answer honestly — 'Needs Work' isn't failure, it's awareness.",
    suggestions: ["Start with Financial sustainability — be honest about the numbers", "For each 'No', write one small action to improve it"],
    encouragement: "Sustainable dreams last. Unsustainable ones burn out.",
  },
};

// ── Activity completion celebration messages ──
export const COMPLETION_MESSAGES: Record<number, CoachResponse> = {
  1: { message: "Skills mapped! You've uncovered abilities you probably take for granted. These become your building blocks in PART 3.", suggestions: ["Review your top 3 skills — they'll come back later"], encouragement: "Knowing what you have is half the battle." },
  2: { message: "Resource map complete! You now have an honest picture of your assets. Low scores aren't weaknesses — they're where to find partners.", suggestions: ["Note your strongest resource — lean into it"], encouragement: "Leverage what's strong, partner for what's not." },
  3: { message: "Time audit done! You now see where your hours actually go. Look for 'golden hours' you can redirect toward your dream.", suggestions: ["Find 2 hours of consumption time to convert"], encouragement: "Time is the only resource you can't buy more of." },
  4: { message: "Money flow tracked! You've found the gap between what you spend and what satisfies you. That gap funds your dream.", suggestions: ["Identify your lowest-satisfaction, highest-spend items"], encouragement: "Every redirected dollar is an investment in yourself." },
  5: { message: "Current state defined! You've faced reality — that takes guts. Every constraint you listed is a potential opportunity.", suggestions: ["Your constraints are the edges of your map — now expand it"], encouragement: "The first step to change is knowing where you stand." },
  6: { message: "Mind map complete! Your experiences are more connected than you think. Look for patterns across branches — that's where your unique value lives.", suggestions: ["Circle the nodes that excite you most"], encouragement: "Your unique experience combination is unreplicable." },
  7: { message: "Failure resume done! You've turned setbacks into data. Every lesson listed is a future advantage.", suggestions: ["Look for recurring themes — they point to your growth edge"], encouragement: "The most successful people have the longest failure lists." },
  8: { message: "Strengths & weaknesses reframed! You've turned every so-called weakness into a potential asset.", suggestions: ["Share your reframes with someone you trust"], encouragement: "Perspective is the ultimate superpower." },
  9: { message: "Market scan complete! You've spotted real-world signals in just 30 minutes. Real validation happens in the field, not in your head.", suggestions: ["Note the top 3 pain points you discovered"], encouragement: "Market awareness separates dreamers from builders." },
  10: { message: "Why-What Bridge complete! Your purpose now has a direction. This bridge connects who you are to what you'll build.", suggestions: ["Keep your Why visible — it's your compass"], encouragement: "A clear Why makes every decision easier." },
  11: { message: "Proposal locked! You now have a one-line pitch that makes your idea tangible. Test it on 5 people this week.", suggestions: ["Say it out loud — does it feel true?"], encouragement: "If you can say it simply, you understand it deeply." },
  12: { message: "Hypotheses tested! You've replaced assumptions with evidence. That's worth more than 100 business plans.", suggestions: ["Focus on what surprised you"], encouragement: "Data beats opinions. Always." },
  13: { message: "MVP defined! You have a real plan to build something with zero budget. Ship it before you doubt it.", suggestions: ["Set a launch date this week"], encouragement: "An imperfect MVP beats a perfect plan." },
  14: { message: "Value ladder built! You now see how free followers become paying customers. Each step should feel like an obvious upgrade.", suggestions: ["Start offering the freebie today"], encouragement: "Build trust, then ask for money." },
  15: { message: "Fan candidates identified! These 10 people are your launchpad. Serve them incredibly well.", suggestions: ["Reach out to your warmest candidate today"], encouragement: "10 true fans can change everything." },
  16: { message: "Dream 5 assembled! Your advisory board is set. These relationships will accelerate everything.", suggestions: ["Send your mentor a message this week"], encouragement: "You're the average of your Dream 5." },
  17: { message: "Rejections collected! You've proven that rejection doesn't break you — it builds you. Most people never even try.", suggestions: ["Challenge yourself to 3 more rejections this month"], encouragement: "Fear of rejection is more painful than rejection itself." },
  18: { message: "System designed! You now have a sustainable engine for daily progress. Motivation fades; systems don't.", suggestions: ["Start your core activity tomorrow morning"], encouragement: "Systems are the compound interest of effort." },
  19: { message: "Traffic lights sorted! You've decided what to stop, start, and improve. That clarity is worth its weight in gold.", suggestions: ["Act on one red-light item today"], encouragement: "Clarity of action is the rarest asset." },
  20: { message: "Sustainability check done! Your dream has a health score. Now you know exactly what needs attention.", suggestions: ["Address your weakest pillar first"], encouragement: "A dream that lasts is a dream worth building." },
};

// ── PART entry messages ──
export const PART_ENTRY_MESSAGES: Record<number, CoachResponse> = {
  1: {
    message: "Welcome to PART 1: Face My Reality! Before you can chase your dream, you need to know where you stand. Let's map your skills, resources, time, money, and current situation.",
    suggestions: ["Be honest — this is for you, not anyone else", "Take your time with each activity"],
    encouragement: "The journey of a lifetime starts with knowing yourself.",
  },
  2: {
    message: "Welcome to PART 2: Discover My Dream! You've faced reality. Now let's explore your experiences, find patterns in your failures, and bridge your WHY to your WHAT.",
    suggestions: ["Let your mind wander — the best ideas are unexpected", "Your PART 1 data will come back to help you later"],
    encouragement: "Your dream is already inside you. Let's uncover it.",
  },
  3: {
    message: "Welcome to PART 3: Validate & Build! You know your dream. Now let's prove it works. You'll create a proposal, test hypotheses, and build an MVP — all without spending a dime.",
    suggestions: ["Remember your Why from PART 2 — it guides everything here", "Speed over perfection — test fast, learn fast"],
    encouragement: "Ideas are free. Validated ideas are priceless.",
  },
  4: {
    message: "Welcome to PART 4: Connect & Expand! The final stretch. You'll find your first fans, build your dream team, collect rejections, and create a sustainable system.",
    suggestions: ["Your MVP and proposal from PART 3 are your tools now", "Focus on real people, not abstract audiences"],
    encouragement: "Dreams become real when other people believe in them too.",
  },
};

// ── Typing pause messages (5-10s pause after typing → deeper question) ──
export const TYPING_PAUSE_MESSAGES: Record<number, { message: string; suggestions: string[] }> = {
  1: { message: "I noticed you paused. What skill did you almost write but held back? Those hidden ones are often the most valuable.", suggestions: ["What do friends compliment you on?"] },
  2: { message: "Taking a moment to think? Consider this: which resource score makes you most uncomfortable? That discomfort is a signal.", suggestions: ["What resource would change everything if it doubled?"] },
  3: { message: "Pausing on time tracking? Here's a deeper question: what would your ideal day look like if you had full control?", suggestions: ["Where does your energy peak?"] },
  4: { message: "Thinking about money? Ask yourself: which expense brings you closest to your dream self?", suggestions: ["What spending secretly makes you proud?"] },
  5: { message: "Taking a breath? Good. Now ask: what part of your current reality is actually a hidden advantage?", suggestions: ["What constraint forced you to be creative?"] },
  6: { message: "Mind map growing? Look at the node you just hesitated on. There might be something deeper there worth exploring.", suggestions: ["What memory keeps coming back?"] },
  7: { message: "Processing a failure? Take a moment: what would you tell your younger self about this experience?", suggestions: ["What strength grew from this failure?"] },
  8: { message: "Pausing on a weakness? Sometimes the pause itself reveals what matters. What weakness are you secretly proud of?", suggestions: ["When has this 'weakness' actually saved you?"] },
  9: { message: "Something catch your eye in the market scan? Write down the first thought — unfiltered instincts are often the most insightful.", suggestions: ["What gap surprised you the most?"] },
  10: { message: "Thinking deeply about your Why? That's good. The real Why is usually hiding behind the first answer. Dig one layer deeper.", suggestions: ["Complete: 'I care because...'"] },
  11: { message: "Crafting your proposal? Remember: the best proposals make the listener think 'that's exactly what I need.'", suggestions: ["Would your target person nod when hearing this?"] },
  12: { message: "Thinking about your hypothesis? Make it as specific as possible. 'Some people might like this' is too vague.", suggestions: ["Can you add a number and a timeframe?"] },
  13: { message: "MVP step giving you pause? What's the absolute minimum you need to get feedback from one real person?", suggestions: ["Could you test this in 24 hours?"] },
  14: { message: "Pricing is emotional. Pause is natural. Ask yourself: what would you pay for this as a customer?", suggestions: ["What would make the price feel like a steal?"] },
  15: { message: "Thinking about a fan candidate? What specific problem could you solve for them right now, today?", suggestions: ["How would they describe their problem?"] },
  16: { message: "Choosing your Dream 5 carefully? Good. Ask: who makes you feel both supported AND challenged?", suggestions: ["Who would you call at 2 AM with a dream idea?"] },
  17: { message: "Nervous about rejection? That's the point. What's the smallest ask that still scares you a little?", suggestions: ["What's the worst that could actually happen?"] },
  18: { message: "Designing your system? Focus on the one activity that, if done daily, makes everything else easier.", suggestions: ["What's your keystone habit?"] },
  19: { message: "Categorizing activities? If it doesn't clearly bring energy or results, it's probably yellow or red.", suggestions: ["What would you stop if no one was watching?"] },
  20: { message: "Honest sustainability check? Areas you hesitate on are usually the ones that need the most attention.", suggestions: ["Which pillar feels most fragile right now?"] },
};

function getMockResponse(req: CoachRequest): CoachResponse {
  if (req.userMessage.trim().length < 10) {
    return MOCK_HINTS[req.activityId] || {
      message: `You're doing great on ${req.activityName}! Keep exploring and be honest with yourself.`,
      suggestions: ["Take your time — there are no wrong answers", "Try to fill in every field, even if briefly"],
      encouragement: "Every step forward counts.",
    };
  }

  return CONVERSATIONAL_RESPONSES[Math.floor(Math.random() * CONVERSATIONAL_RESPONSES.length)];
}

export async function getCoachResponse(req: CoachRequest): Promise<CoachResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getMockResponse(req);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(req) },
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content) as CoachResponse;

    if (!parsed.message || typeof parsed.message !== "string") {
      parsed.message = "Keep going — you're making great progress!";
    }
    if (!Array.isArray(parsed.suggestions)) {
      parsed.suggestions = [];
    }
    parsed.suggestions = parsed.suggestions.slice(0, 3).map(String);
    if (!parsed.encouragement || typeof parsed.encouragement !== "string") {
      parsed.encouragement = "You've got this!";
    }

    return parsed;
  } catch (error) {
    console.error("[AI Coach] OpenAI call failed, using mock:", error);
    return getMockResponse(req);
  }
}
