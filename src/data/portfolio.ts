/**
 * Project taxonomy — see docs/superpowers/specs/2026-08-08-project-taxonomy-design.md
 *
 * Categories sit on one axis (scope of ownership) and are ordered strongest-first.
 * Roles are a closed set: category says how big the system was, role says how much of
 * it was the author's. Both are typed so a typo fails the build.
 */
export const CATEGORIES = [
  "Simulation & Decision Support",
  "Full-Stack Platforms",
  "Enterprise Applications",
  "Process Automation",
  "Developer Enablement & R&D",
  "Competitions & Credentials",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Short forms for the card badge — the canonical names overflow the chip. */
export const CATEGORY_LABEL: Record<Category, string> = {
  "Simulation & Decision Support": "Simulation",
  "Full-Stack Platforms": "Platform",
  "Enterprise Applications": "Enterprise",
  "Process Automation": "Automation",
  "Developer Enablement & R&D": "Enablement",
  "Competitions & Credentials": "Competition",
};

export const ROLES = [
  "Sole developer",
  "Governance lead",
  "Instructor",
  "Competitor",
] as const;

export type Role = (typeof ROLES)[number];

export interface Project {
  id: string;
  title: string;
  description: string;
  category: Category;
  organization: string;
  role: Role;
  /** Absolute figures only. Left unset until the headcount question resolves. */
  scale?: string;
  tools: string[];
  learningPoints?: string;
  features?: string[];
  imageSource?: string;
}

export const featuredProject: Project = {
  id: "raid-air-2",
  title: "RSAF Facility Booking App",
  description:
    "An enterprise-grade facility reservation platform on Microsoft Dataverse + React to streamline operations for the entire RSAF.",
  category: "Enterprise Applications",
  organization: "RAiD",
  role: "Sole developer",
  tools: [
    "Microsoft Dataverse",
    "React",
    "PowerApps Code Apps",
    "Gemini 3.1",
    "Claude Opus 4.6",
    "Github Copilot",
  ],
  features: [
    "Role-based access control (4-tier permissions)",
    "Approval workflows with end-to-end visibility",
    "Real-time availability & conflict detection",
    "Recurring booking support for complex scheduling",
    "Comprehensive audit logging",
    "Multi-tenant-ready architecture using soft-delete patterns & departmental isolation",
  ],
  learningPoints:
    "Used Specs-Driven Development to design and implement the application end-to-end—delivering a full-stack experience across frontend UX, API integration, and database design in just 2 days. This project demonstrated the transition from no-code to AI-orchestrated engineering.",
};

export const projects: Project[] = [
  {
    id: "asv-logbook",
    title: "ASV Logbook & Maintenance Web App",
    description:
      "Customised web-based app for Air Specialist Vehicle (ASV) usage and maintenance records to track upcoming vehicle's servicing status.",
    category: "Process Automation",
    organization: "RAiD",
    role: "Sole developer",
    tools: ["PowerApps", "Lovable", "PowerDocu"],
    learningPoints:
      "Explored Lovable to create a fullstack app swiftly after proving functions in PowerApps. Navigated license issues and used PowerDocu to create documentation for reliable prompting.",
  },
  {
    id: "sg-airshow-2026",
    title: "Singapore Airshow 2026 Charity Auction",
    description:
      "Auction tool allowing RSAF personnel to bid for charity bears as part of a charity movement for the Singapore Airshow.",
    category: "Process Automation",
    organization: "RAiD",
    role: "Sole developer",
    tools: ["FormSG", "Plumber", "Sharepoint"],
    learningPoints:
      "Learnt how to make use of FormSG and Plumber (Open Government Products) to safely store sensitive data and user contact details on the Internet considering policy constraints.",
  },
  {
    id: "soar-scheduling",
    title: "SOAR Schedule App",
    description:
      "Calendar app to allocate pilot trainees for simulator training, generated using Code Apps.",
    category: "Process Automation",
    organization: "RAiD",
    role: "Sole developer",
    tools: ["PowerApps", "Github Copilot", "Google Ai Studio", "Lovable"],
    learningPoints:
      "Using Lovable to create a quick prototype on the spot to gain user feedback, deploying to PowerApps safely.",
  },
  {
    id: "ssb-loan-form",
    title: "SSB Loan Tracking System",
    description:
      "End to end workflow for SSB to track and approve the loaning of their logistic items.",
    category: "Process Automation",
    organization: "RAiD",
    role: "Sole developer",
    tools: ["FormSG"],
    learningPoints:
      "Rapid prototyping using simple no-code tools to create a functional system and deploy within a day.",
  },
  {
    id: "sage-copilot",
    title: "SAGE Copilot AI",
    description:
      "Integrating SAGE's ME5 Delta Agent into Copilot for training purposes using Open Source models.",
    category: "Developer Enablement & R&D",
    organization: "RAiD",
    role: "Sole developer",
    tools: ["Copilot", "Prompt Builder", "Dataverse", "PowerApps"],
    learningPoints:
      "Navigated license constraints creatively to replicate GPT 4.1 concepts, managing context engineering to prevent hallucinations.",
  },
  {
    id: "vibe-coding-rnd",
    title: "R&D for Vibe-Coding Code Apps",
    description:
      "Explored AI Vibe Coding tools to design an end-to-end development workflow for PowerApps Code Apps.",
    category: "Developer Enablement & R&D",
    organization: "RAiD",
    role: "Sole developer",
    tools: ["PowerApps Code Apps", "AI Coding Tools"],
    learningPoints:
      "Designed a systematic workflow that reduced development time from months to days for Digital Champions and RAiD developers.",
  },
  {
    id: "code-apps-policy",
    title: "Code Apps Policy Approval (M365 Tenant)",
    description:
      "Led the case to unlock Microsoft Power Apps Code Apps across the organisation's M365 environment, working through the relevant cybersecurity authorities within MINDEF.",
    category: "Developer Enablement & R&D",
    organization: "RAiD",
    role: "Governance lead",
    tools: ["Power Platform Governance", "M365 Administration", "Security Review"],
    learningPoints:
      "Every Code Apps project in this portfolio was built after this approval. Before it, Code Apps could not be deployed in the environment at all.",
  },
  {
    id: "powerdocu-clearance",
    title: "Documentation Generation Tool (PowerDocu)",
    description:
      "Collaboration with Cydef to clear an open-source documentation generation tool for PowerApps for personal use.",
    category: "Developer Enablement & R&D",
    organization: "RAiD",
    role: "Governance lead",
    tools: ["Github", "PowerDocu"],
    learningPoints:
      "Learnt about Cybersecurity Scanning architecture, policy constraints, and how to collaborate with departments to clear tools for citizen developers.",
  },
  {
    id: "bootcamp-815",
    title: "1-Day Power Platform Bootcamp (815 SQN)",
    description:
      "Condensed a 2-day bootcamp into 1 day for 35 users, curating new interactive learning materials.",
    category: "Developer Enablement & R&D",
    organization: "RAiD",
    role: "Instructor",
    tools: ["Lovable", "Power Platform"],
  },
  {
    id: "new-intern-guide",
    title: "Comprehensive Guide for New Interns",
    description:
      "Developed a guide using PowerLib, Google AI Studio, and Lovable to expedite learning curves for the PPCoE team.",
    category: "Developer Enablement & R&D",
    organization: "RAiD",
    role: "Instructor",
    tools: ["Documentation", "Mentoring"],
  },
  {
    id: "lead-ambassadors-cca",
    title: "App Development For Lead Ambassadors CCA",
    description:
      "Designed an application as a secretary to help automate monthly meeting attendance as well as update databases.",
    category: "Process Automation",
    organization: "Temasek Polytechnic",
    role: "Sole developer",
    tools: [
      "Agile App Dev",
      "Microsoft Power Apps",
      "Microsoft Power Automate",
    ],
  },
  {
    id: "huawei-track",
    title: "National AI Student Challenge 2025 - Huawei Track",
    description:
      "Mobile app to improve Citizen Engagement and Civic Services, allowing them to report issues and track their progress of their requests.",
    category: "Competitions & Credentials",
    organization: "Temasek Polytechnic",
    role: "Competitor",
    imageSource: "/huawei-track-cert.jpg",
    tools: [
      "Full-Stack Dev",
      "Machine Learning Algorithms",
      "Cloud Tech",
      "MLOps",
    ],
    learningPoints:
      "Exposure to ML algorithms, various Cloud Technologies in Huawei's ecosystem, and MLOps. Introduced to AI development field.",
  },
  {
    id: "whitehacks-2025",
    title: "Whitehacks 2025 (Cybersecurity CTF)",
    description:
      "Cybersecurity CTF Competition organised by SMU. Used tools such as Wireshark, John The Ripper, and Z-steg.",
    category: "Competitions & Credentials",
    organization: "Temasek Polytechnic",
    role: "Competitor",
    tools: [
      "Cybersecurity",
      "Digital Forensics",
      "OSINT",
      "Cryptography",
      "Steganography",
    ],
    learningPoints:
      "Introduced to various cybersecurity practices transitioning from an engineering background.",
  },
  {
    id: "mindsports-app",
    title: "App development for Mindsports CCA",
    description:
      "Developed an app for Mindsports club which automates all workflows, taking attendance, and monitoring various logistics.",
    category: "Process Automation",
    organization: "Temasek Polytechnic",
    role: "Sole developer",
    tools: [
      "Microsoft Power Platform",
      "Agile App Dev",
      "UI Design",
      "Data Visualization",
    ],
  },
  {
    id: "iron-viz",
    title: "Iron Viz Student Edition",
    description:
      "Data visualization contest to develop visualization skills. Conducted data analysis and created compelling visualizations.",
    category: "Competitions & Credentials",
    organization: "Temasek Polytechnic",
    role: "Competitor",
    tools: ["Tableau", "Data Visualization", "Data Analysis"],
  },
  {
    id: "workplace-checkin",
    title: "Workplace Check In/Out App",
    description:
      "Developed a PowerApp to simplify and automate the administrative workflow for duty management for duty personnel in an RSAF Unit.",
    category: "Process Automation",
    organization: "Freelance",
    role: "Sole developer",
    imageSource: "/WorkCICO Screenshot.jpg",
    tools: [
      "Microsoft Power Apps",
      "Microsoft Power Automate",
      "Digitalisation",
    ],
    features: [
      "Geofencing for check in/out at designated locations",
      "Logistics Accountability and tracking",
      "Noticeboards for centralized announcements",
      "Hand Over Features facilitating smooth transitions",
    ],
    learningPoints:
      "Significantly improved the efficiency and accuracy of attendance tracking for duty personnel.",
  },
  {
    id: "world-skills-training",
    title: "World Skills Training (Aircraft Maintenance)",
    description:
      "Acquired technical skills essential for Aircraft Maintenance at Lufthansa Technical Training Center, experiencing high-pressure scenarios.",
    category: "Competitions & Credentials",
    organization: "Temasek Polytechnic",
    role: "Competitor",
    tools: ["Aircraft Maintenance", "Aircraft Inspection", "Stress Management"],
    learningPoints:
      "Learnt riveting, soldering, and composite materials. Instilled resilience, self-discipline, and ability to handle stress.",
  },
  {
    id: "poly-forum-2024",
    title: "App Development for Poly Forum 2024 (SYLP)",
    description:
      "App developed for a nationwide event to efficiently manage attendance of 500 students through geofencing and score tabulation.",
    category: "Process Automation",
    organization: "Temasek Polytechnic",
    role: "Sole developer",
    tools: ["Microsoft Power Platform", "UI Design", "Agile App Dev"],
  },
  {
    id: "google-colab-bot",
    title: "Google Collab Text to Flowchart Bot",
    description:
      "Created an AI tool using Python and ChatGPT 3.5 that generates flowcharts from text.",
    category: "Developer Enablement & R&D",
    organization: "Temasek Polytechnic",
    role: "Sole developer",
    tools: ["Python", "OpenAI", "Flowgiston"],
    learningPoints:
      "Explored prompt engineering and integrating python libraries together in a single notebook for workflow tools.",
  },
];

export const experience = [
  {
    company: "RAiD (RSAF Agile innovation Digital)",
    role: "Power Platform Developer, Student Intern",
    period: "Oct 2025 - Present (7 months)",
    location: "Singapore",
    description:
      "Specializing in Power Apps and Power Platform within the PPCoE team. Focus on designing digital solutions that streamline processes, improve data quality, and support data-driven decision-making.",
  },
  {
    company: "Temasek Polytechnic",
    role: "PowerApp/ Power Platform Developer",
    period: "Dec 2023 - Present",
    location: "Singapore",
    description:
      "Self-learnt PowerApps to automate admin work for various CCAs, enhancing club efficiency.",
  },
  {
    company: "Freelance",
    role: "Software Engineer (Power Platform)",
    period: "Dec 2024 - Oct 2025",
    location: "Singapore",
    description:
      "Leveraged low code tools like PowerApps and Power Automate to develop tailored automation solutions.",
  },
  {
    company: "Personal Company",
    role: "Freelance / Mini Start Up",
    period: "Apr 2021 - Jan 2023",
    location: "Singapore",
    description:
      "Founded a business in the Anime industry animating 2D models using Live 2D Cubism, building a portfolio with low-code platforms and practicing SEO strategies.",
  },
];
