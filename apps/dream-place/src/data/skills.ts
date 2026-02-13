export interface SkillItem {
  name: string;
  tools?: string[];
}

export interface SkillSubcategory {
  name: string;
  skills: SkillItem[];
}

export interface SkillDomain {
  domain: string;
  categories: SkillSubcategory[];
}

// ─── 4-Level Skill Taxonomy (5 Domains, ~350 Skills) ──────

export const SKILL_DOMAINS: SkillDomain[] = [
  {
    domain: "Technology",
    categories: [
      {
        name: "Frontend Development",
        skills: [
          { name: "React / Next.js", tools: ["React", "Next.js", "Remix"] },
          { name: "Vue / Nuxt", tools: ["Vue.js", "Nuxt.js"] },
          { name: "Angular", tools: ["Angular", "RxJS"] },
          { name: "HTML / CSS", tools: ["Tailwind", "Sass", "CSS Modules"] },
          { name: "JavaScript / TypeScript" },
          { name: "Mobile (React Native)" },
          { name: "Mobile (Flutter)" },
          { name: "Mobile (Swift / iOS)" },
          { name: "Mobile (Kotlin / Android)" },
          { name: "Web Accessibility (a11y)" },
        ],
      },
      {
        name: "Backend Development",
        skills: [
          { name: "Node.js / Express", tools: ["Express", "Fastify", "NestJS"] },
          { name: "Python / Django", tools: ["Django", "FastAPI", "Flask"] },
          { name: "Go" },
          { name: "Rust" },
          { name: "Java / Spring", tools: ["Spring Boot", "Micronaut"] },
          { name: "Ruby / Rails" },
          { name: "PHP / Laravel" },
          { name: "C# / .NET" },
          { name: "GraphQL", tools: ["Apollo", "Relay"] },
          { name: "REST API Design" },
        ],
      },
      {
        name: "DevOps & Cloud",
        skills: [
          { name: "AWS", tools: ["EC2", "S3", "Lambda", "ECS"] },
          { name: "Google Cloud", tools: ["GCE", "Cloud Run", "BigQuery"] },
          { name: "Azure" },
          { name: "Docker / Containers" },
          { name: "Kubernetes" },
          { name: "CI/CD Pipelines", tools: ["GitHub Actions", "GitLab CI"] },
          { name: "Terraform / IaC" },
          { name: "Linux / System Admin" },
          { name: "Monitoring / Observability", tools: ["Datadog", "Grafana"] },
          { name: "Site Reliability Engineering" },
        ],
      },
      {
        name: "Data & AI",
        skills: [
          { name: "Machine Learning", tools: ["scikit-learn", "XGBoost"] },
          { name: "Deep Learning", tools: ["PyTorch", "TensorFlow"] },
          { name: "Natural Language Processing" },
          { name: "Computer Vision" },
          { name: "Data Engineering", tools: ["Spark", "Airflow", "dbt"] },
          { name: "Data Science / Analytics" },
          { name: "Data Visualization", tools: ["D3.js", "Tableau", "Matplotlib"] },
          { name: "AI/ML Ops", tools: ["MLflow", "Weights & Biases"] },
          { name: "Prompt Engineering / LLMs" },
          { name: "Statistical Modeling" },
        ],
      },
      {
        name: "Specialized Tech",
        skills: [
          { name: "Blockchain / Web3", tools: ["Solidity", "Ethers.js"] },
          { name: "Game Development", tools: ["Unity", "Unreal", "Godot"] },
          { name: "AR / VR Development" },
          { name: "Embedded Systems / IoT" },
          { name: "Cybersecurity" },
          { name: "Database Administration", tools: ["PostgreSQL", "MongoDB", "Redis"] },
          { name: "Robotics" },
          { name: "Quantum Computing" },
        ],
      },
    ],
  },
  {
    domain: "Business",
    categories: [
      {
        name: "Strategy & Operations",
        skills: [
          { name: "Business Strategy" },
          { name: "Business Development" },
          { name: "Operations Management" },
          { name: "Supply Chain Management" },
          { name: "Lean / Six Sigma" },
          { name: "Market Research" },
          { name: "Competitive Analysis" },
          { name: "OKRs / Goal Setting" },
          { name: "Process Optimization" },
        ],
      },
      {
        name: "Finance & Legal",
        skills: [
          { name: "Financial Planning / FP&A" },
          { name: "Fundraising / VC" },
          { name: "Accounting / Bookkeeping" },
          { name: "Tax Strategy" },
          { name: "Investment Analysis" },
          { name: "Legal Advisory" },
          { name: "Contract Negotiation" },
          { name: "Intellectual Property" },
          { name: "Compliance / Regulatory" },
          { name: "Corporate Governance" },
          { name: "Risk Management" },
        ],
      },
      {
        name: "Sales & Partnerships",
        skills: [
          { name: "B2B Sales" },
          { name: "B2C Sales" },
          { name: "Enterprise Sales" },
          { name: "Sales Strategy" },
          { name: "Account Management" },
          { name: "Partnership Development" },
          { name: "CRM Management", tools: ["Salesforce", "HubSpot"] },
          { name: "Negotiation" },
          { name: "Lead Generation" },
          { name: "Revenue Operations" },
        ],
      },
      {
        name: "Product Management",
        skills: [
          { name: "Product Strategy" },
          { name: "Product Roadmapping" },
          { name: "Agile / Scrum" },
          { name: "User Stories / Requirements" },
          { name: "A/B Testing / Experimentation" },
          { name: "Product Analytics", tools: ["Amplitude", "Mixpanel"] },
          { name: "Customer Discovery" },
          { name: "Prioritization Frameworks" },
        ],
      },
      {
        name: "Leadership & People",
        skills: [
          { name: "Team Leadership" },
          { name: "People Management" },
          { name: "Mentoring / Coaching" },
          { name: "Recruiting / Talent Acquisition" },
          { name: "Public Speaking" },
          { name: "Change Management" },
          { name: "Cross-functional Collaboration" },
          { name: "Stakeholder Management" },
          { name: "Decision Making" },
          { name: "Conflict Resolution" },
        ],
      },
    ],
  },
  {
    domain: "Creative",
    categories: [
      {
        name: "Design",
        skills: [
          { name: "UI Design", tools: ["Figma", "Sketch", "Adobe XD"] },
          { name: "UX Design" },
          { name: "User Research" },
          { name: "Graphic Design", tools: ["Illustrator", "Photoshop"] },
          { name: "Brand Identity" },
          { name: "Motion Design", tools: ["After Effects", "Lottie"] },
          { name: "3D Modeling", tools: ["Blender", "Cinema 4D"] },
          { name: "Design Systems" },
          { name: "Product Design" },
          { name: "Illustration" },
          { name: "Interaction Design" },
        ],
      },
      {
        name: "Content & Writing",
        skills: [
          { name: "Copywriting" },
          { name: "Content Strategy" },
          { name: "Technical Writing" },
          { name: "Storytelling" },
          { name: "Scriptwriting" },
          { name: "Blog / Article Writing" },
          { name: "SEO Writing" },
          { name: "Ghostwriting" },
          { name: "Editing / Proofreading" },
        ],
      },
      {
        name: "Audio & Video",
        skills: [
          { name: "Video Production", tools: ["Premiere Pro", "DaVinci Resolve"] },
          { name: "Video Editing" },
          { name: "Photography" },
          { name: "Animation", tools: ["After Effects", "Rive"] },
          { name: "Podcasting" },
          { name: "Music Production", tools: ["Ableton", "Logic Pro"] },
          { name: "Sound Design" },
          { name: "Voice Acting / Narration" },
          { name: "Live Streaming" },
        ],
      },
      {
        name: "Marketing",
        skills: [
          { name: "Digital Marketing" },
          { name: "Social Media Marketing" },
          { name: "Content Marketing" },
          { name: "SEO / SEM" },
          { name: "Email Marketing" },
          { name: "Growth Hacking" },
          { name: "Influencer Marketing" },
          { name: "Paid Advertising", tools: ["Google Ads", "Meta Ads"] },
          { name: "Community Building" },
          { name: "Brand Strategy" },
          { name: "PR / Communications" },
          { name: "Event Planning" },
        ],
      },
    ],
  },
  {
    domain: "Science",
    categories: [
      {
        name: "Life Sciences",
        skills: [
          { name: "Biotechnology" },
          { name: "Clinical Research" },
          { name: "Pharmaceutical Science" },
          { name: "Genomics / Bioinformatics" },
          { name: "Neuroscience" },
          { name: "Molecular Biology" },
          { name: "Public Health" },
        ],
      },
      {
        name: "Physical Sciences",
        skills: [
          { name: "Materials Science" },
          { name: "Environmental Science" },
          { name: "Chemistry" },
          { name: "Physics" },
          { name: "Renewable Energy" },
          { name: "Climate Science" },
        ],
      },
      {
        name: "Research & Academia",
        skills: [
          { name: "Scientific Research" },
          { name: "Academic Writing" },
          { name: "Laboratory Skills" },
          { name: "Quantitative Research" },
          { name: "Qualitative Research" },
          { name: "R&D Strategy" },
          { name: "Peer Review" },
          { name: "Grant Writing" },
          { name: "Data Analysis (Research)" },
        ],
      },
      {
        name: "Social Sciences",
        skills: [
          { name: "Psychology" },
          { name: "Behavioral Economics" },
          { name: "Sociology" },
          { name: "Anthropology" },
          { name: "Political Science" },
          { name: "Education / Pedagogy" },
        ],
      },
    ],
  },
  {
    domain: "Operations",
    categories: [
      {
        name: "Project & Program Management",
        skills: [
          { name: "Project Management", tools: ["Jira", "Asana", "Linear"] },
          { name: "Program Management" },
          { name: "Scrum Master" },
          { name: "Waterfall / Traditional PM" },
          { name: "Resource Planning" },
          { name: "Budget Management" },
          { name: "Risk Assessment" },
        ],
      },
      {
        name: "Customer & Support",
        skills: [
          { name: "Customer Success" },
          { name: "Customer Support" },
          { name: "Technical Support" },
          { name: "Community Management" },
          { name: "User Onboarding" },
          { name: "Customer Research" },
          { name: "Help Center / Documentation" },
        ],
      },
      {
        name: "Logistics & Admin",
        skills: [
          { name: "Supply Chain Logistics" },
          { name: "Procurement" },
          { name: "Inventory Management" },
          { name: "Office / Admin Management" },
          { name: "Vendor Management" },
          { name: "Quality Assurance / QA Testing" },
          { name: "Localization / i18n" },
          { name: "Data Entry / Organization" },
        ],
      },
    ],
  },
];

// Flatten helpers

/** Legacy 2-level format for backwards compatibility with existing TagSelector */
export interface SkillCategory {
  name: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = SKILL_DOMAINS.flatMap(
  (domain) =>
    domain.categories.map((cat) => ({
      name: cat.name,
      skills: cat.skills.map((s) => s.name),
    }))
);

export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((cat) => cat.skills);

export const DOMAIN_NAMES = SKILL_DOMAINS.map((d) => d.domain);

/** Get all skills for a given domain name */
export function getSkillsByDomain(domain: string): string[] {
  const d = SKILL_DOMAINS.find((x) => x.domain === domain);
  if (!d) return [];
  return d.categories.flatMap((cat) => cat.skills.map((s) => s.name));
}

/** Count skills per domain */
export function getSkillCountByDomain(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const d of SKILL_DOMAINS) {
    counts[d.domain] = d.categories.reduce(
      (sum, cat) => sum + cat.skills.length,
      0
    );
  }
  return counts;
}

export const INDUSTRY_OPTIONS = [
  "AI / Machine Learning",
  "EdTech",
  "FinTech",
  "HealthTech",
  "Climate Tech",
  "E-Commerce",
  "SaaS / B2B",
  "Social Impact",
  "Creator Economy",
  "Gaming",
  "Music / Entertainment",
  "Real Estate",
  "Food / Agriculture",
  "Fashion",
  "Travel / Hospitality",
  "Media / Publishing",
  "Cybersecurity",
  "Web3 / Blockchain",
  "Robotics / Hardware",
  "Productivity",
];
