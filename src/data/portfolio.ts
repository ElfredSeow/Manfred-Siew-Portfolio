export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  organization: string;
  tools: string[];
  learningPoints?: string;
  features?: string[];
  imageSource?: string;
  githubUrl?: string;
  mockupType?: string;
  isPersonal?: boolean;
  featured?: boolean;
}

export const featuredProject: Project = {
  id: "raid-air-2",
  title: "RSAF Facility Booking App",
  description:
    "An enterprise-grade facility reservation platform on Microsoft Dataverse + React to streamline operations for the entire RSAF.",
  category: "Enterprise",
  organization: "RAiD",
  featured: true,
  mockupType: "facility-booking",
  tools: [
    "Microsoft Dataverse",
    "React",
    "PowerApps Code Apps",
    "Gemini 2.5",
    "Claude Opus 4",
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

export const workProjects: Project[] = [
  {
    id: "facility-booking-app",
    title: "Facility Booking App",
    description:
      "Enterprise-grade facility reservation platform built on Microsoft Dataverse + React to streamline booking operations for the entire RSAF.",
    category: "Enterprise",
    organization: "RAiD",
    featured: true,
    mockupType: "facility-booking",
    tools: ["Microsoft Dataverse", "React", "PowerApps Code Apps", "Claude Opus 4"],
    features: [
      "Role-based access control (4-tier permissions)",
      "Approval workflows with end-to-end visibility",
      "Real-time availability & conflict detection",
      "Recurring booking support",
      "Comprehensive audit logging",
    ],
    learningPoints:
      "Used Specs-Driven Development to design and implement the application end-to-end—delivering a full-stack experience in just 2 days.",
  },
  {
    id: "network-service-recovery",
    title: "Network Service Recovery App",
    description:
      "Command-center app for managing network service recovery operations — dual-role system for ground repair teams and command center, backed by Microsoft Dataverse.",
    category: "Enterprise",
    organization: "RAiD",
    featured: true,
    mockupType: "nsr",
    tools: ["React 19", "TypeScript", "Microsoft Dataverse", "Azure AD", "TanStack Query", "Material-UI", "Docker"],
    features: [
      "Role A: Ground Repair Team mobile-optimized dashboard",
      "Role B: Command Center desktop dashboard",
      "Real-time demand lifecycle tracking",
      "Azure AD MSAL authentication",
      "Configurable mock/Dataverse API adapter",
      "Docker-ready multi-stage builds",
    ],
    learningPoints:
      "Designed a dual-API adapter pattern so the same codebase runs on mock localStorage in development and real Dataverse in production without any code changes.",
  },
  {
    id: "receipt-reader",
    title: "Fuel Up! — Receipt Reader",
    description:
      "Mobile-first React PWA for military fuel receipt submission. Gemini AI OCR auto-fills forms from photographed receipts, syncing to Firebase and Dataverse via n8n.",
    category: "Enterprise",
    organization: "RAiD",
    featured: true,
    mockupType: "fuel-up",
    tools: ["React", "Firebase Firestore", "Google Gemini AI", "n8n", "Power Automate", "Microsoft Dataverse"],
    features: [
      "AI OCR scanning via Gemini 2.5-flash",
      "Two form types: Aviation Fuel & Vehicle Fuel",
      "OTP email authentication with corporate whitelist",
      "Role-based access (Admin/EFO, MTO, User)",
      "Audit log with field-level diff tracking",
      "Admin panel with CSV bulk whitelist management",
    ],
    learningPoints:
      "Learned to architect a multi-system integration pipeline: React → Firebase → n8n → Power Automate → Dataverse. The graceful OCR fallback to manual entry was critical for field reliability.",
  },
  {
    id: "invoice-scanner",
    title: "Invoice Scanner App",
    description:
      "Power Apps Code App for scanning and managing invoices. React + Dataverse with AI-assisted extraction, approval workflow, and ACO server-side trust boundary.",
    category: "Enterprise",
    organization: "RAiD",
    mockupType: "invoice-scanner",
    tools: ["React", "TypeScript", "PowerApps Code Apps", "Microsoft Dataverse", "Power Automate", "Vite"],
    features: [
      "AI-assisted invoice field extraction",
      "4-table Dataverse schema (Invoice, Line Items, Supplier, Profile)",
      "Server-side approval gate with field-level security",
      "ACO approval workflow via Power Automate flow",
      "Spec-driven development with OpenSpec",
    ],
    learningPoints:
      "Migrated approval trust boundary off the client to a Power Automate flow — important security pattern to prevent client-side bypass of ACO workflow.",
  },
  {
    id: "rsaf-vehicle-logbook",
    title: "RSAF Vehicle Logbook",
    description:
      "Full-stack web application for RSAF Air Specialist Vehicle (ASV) usage, maintenance tracking, trip logging, and inspection management.",
    category: "Enterprise",
    organization: "RAiD",
    mockupType: "vehicle-logbook",
    tools: ["React", "TypeScript", "Supabase", "Tailwind CSS", "shadcn-ui", "Lovable"],
    features: [
      "Trip recording with odometer and driver details",
      "Vehicle inspection checklists",
      "Upcoming servicing status tracking",
      "Approval workflows for trip logs",
      "Admin management panel",
      "Activity logs and payload history",
    ],
    learningPoints:
      "Explored Lovable to rapidly scaffold a fullstack app, then customised it with Supabase for real data persistence. Used PowerDocu for documentation-driven prompting.",
  },
  {
    id: "mavis-app",
    title: "MAVIS — Maintenance System",
    description:
      "Maintenance and vehicle inspection system for RSAF, supporting defect reporting, preventive maintenance scheduling, and live workshop status tracking.",
    category: "Enterprise",
    organization: "RAiD",
    mockupType: "mavis",
    tools: ["React", "TypeScript", "Supabase", "Tailwind CSS", "shadcn-ui", "Lovable"],
    features: [
      "Defect reporting with severity classification",
      "Preventive maintenance scheduling",
      "Live workshop status board",
      "Maintenance reports generation",
      "Admin role management",
    ],
    learningPoints:
      "First end-to-end maintenance system built entirely with Lovable + Supabase, demonstrating AI-first app development for operational military software.",
  },
  {
    id: "bootcamp-815",
    title: "Power Platform Bootcamp Training",
    description:
      "Interactive training slides web app condensing a 2-day bootcamp into 1 day for 35 users. Built with Lovable, featuring a controls dictionary, designer tour, and quiz engine.",
    category: "Trainings",
    organization: "RAiD",
    mockupType: "bootcamp",
    tools: ["React", "TypeScript", "Lovable", "Tailwind CSS", "Power Platform"],
    features: [
      "Interactive table of contents navigation",
      "Controls dictionary reference",
      "App Designer guided tour",
      "Quiz with answers & feedback",
      "Progress tracking per section",
    ],
    learningPoints:
      "Curated new interactive learning materials to increase engagement vs static slides. The quiz engine proved most impactful for knowledge retention.",
  },
  {
    id: "soar-scheduling",
    title: "SOAR Schedule App",
    description:
      "Calendar app to allocate pilot trainees for simulator training, generated using Code Apps.",
    category: "Requested",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["PowerApps", "Github Copilot", "Google Ai Studio", "Lovable"],
    learningPoints:
      "Using Lovable to create a quick prototype on the spot to gain user feedback, deploying to PowerApps safely.",
  },
  {
    id: "ssb-loan-form",
    title: "SSB Loan Tracking System",
    description:
      "End to end workflow for SSB to track and approve the loaning of their logistic items.",
    category: "Requested",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["FormSG"],
    learningPoints:
      "Rapid prototyping using simple no-code tools to create a functional system and deploy within a day.",
  },
  {
    id: "sage-copilot",
    title: "SAGE Copilot AI",
    description:
      "Integrating SAGE's ME5 Delta Agent into Copilot for training purposes using Open Source models.",
    category: "Requested",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["Copilot", "Prompt Builder", "Dataverse", "PowerApps"],
    learningPoints:
      "Navigated license constraints creatively to replicate GPT 4.1 concepts, managing context engineering to prevent hallucinations.",
  },
  {
    id: "vibe-coding-rnd",
    title: "R&D for Vibe-Coding Code Apps",
    description:
      "Explored AI Vibe Coding tools to design an end-to-end development workflow for PowerApps Code Apps.",
    category: "R&D",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["PowerApps Code Apps", "AI Coding Tools"],
    learningPoints:
      "Designed a systematic workflow that reduced development time from months to days for Digital Champions and RAiD developers.",
  },
  {
    id: "powerdocu-clearance",
    title: "Documentation Generation Tool (PowerDocu)",
    description:
      "Collaboration with Cydef to clear an open-source documentation generation tool for PowerApps for personal use.",
    category: "R&D",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["Github", "PowerDocu"],
    learningPoints:
      "Learnt about Cybersecurity Scanning architecture, policy constraints, and how to collaborate with departments to clear tools for citizen developers.",
  },
  {
    id: "app-brandings",
    title: "Improved App Brandings using SVG",
    description:
      "Created animated logos through SVG codes to improve app brandings, beneficial for marketing.",
    category: "R&D",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["SVG", "UI/UX Design"],
  },
  {
    id: "sg-airshow-2026",
    title: "Singapore Airshow 2026 Charity Auction",
    description:
      "Auction tool allowing RSAF personnel to bid for charity bears as part of a charity movement for the Singapore Airshow.",
    category: "Enterprise",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["FormSG", "Plumber", "Sharepoint"],
    learningPoints:
      "Learnt how to make use of FormSG and Plumber (Open Government Products) to safely store sensitive data on the Internet considering policy constraints.",
  },
  {
    id: "new-intern-guide",
    title: "Comprehensive Guide for New Interns",
    description:
      "Developed a guide using PowerLib, Google AI Studio, and Lovable to expedite learning curves for the PPCoE team.",
    category: "Trainings",
    organization: "RAiD",
    mockupType: "power-platform",
    tools: ["Documentation", "Mentoring", "Lovable"],
  },
  {
    id: "lead-ambassadors-cca",
    title: "Lead Ambassadors CCA App",
    description:
      "Designed an application as a secretary to help automate monthly meeting attendance as well as update databases.",
    category: "Tools/Automation",
    organization: "Temasek Polytechnic",
    mockupType: "power-platform",
    tools: ["Agile App Dev", "Microsoft Power Apps", "Microsoft Power Automate"],
  },
  {
    id: "huawei-track",
    title: "National AI Student Challenge 2025 — Huawei",
    description:
      "Mobile app to improve Citizen Engagement and Civic Services, allowing them to report issues and track their progress of their requests.",
    category: "Competitions",
    organization: "Temasek Polytechnic",
    imageSource: "/huawei-track-cert.jpg",
    mockupType: "competition",
    tools: ["Full-Stack Dev", "Machine Learning", "Cloud Tech", "MLOps"],
    learningPoints:
      "Exposure to ML algorithms, various Cloud Technologies in Huawei's ecosystem, and MLOps. Introduced to AI development field.",
  },
  {
    id: "whitehacks-2025",
    title: "Whitehacks 2025 (Cybersecurity CTF)",
    description:
      "Cybersecurity CTF Competition organised by SMU. Used tools such as Wireshark, John The Ripper, and Z-steg.",
    category: "Competitions",
    organization: "Temasek Polytechnic",
    mockupType: "competition",
    tools: ["Cybersecurity", "Digital Forensics", "OSINT", "Cryptography", "Steganography"],
    learningPoints:
      "Introduced to various cybersecurity practices transitioning from an engineering background.",
  },
  {
    id: "mindsports-app",
    title: "App Development for Mindsports CCA",
    description:
      "Developed an app for Mindsports club which automates all workflows, taking attendance, and monitoring various logistics.",
    category: "Tools/Automation",
    organization: "Temasek Polytechnic",
    mockupType: "power-platform",
    tools: ["Microsoft Power Platform", "Agile App Dev", "UI Design", "Data Visualization"],
  },
  {
    id: "iron-viz",
    title: "Iron Viz Student Edition",
    description:
      "Data visualization contest to develop visualization skills. Conducted data analysis and created compelling visualizations.",
    category: "Competitions",
    organization: "Temasek Polytechnic",
    mockupType: "competition",
    tools: ["Tableau", "Data Visualization", "Data Analysis"],
  },
  {
    id: "workplace-checkin",
    title: "Workplace Check In/Out App",
    description:
      "Developed a PowerApp to simplify and automate the administrative workflow for duty management for duty personnel in an RSAF Unit.",
    category: "Tools/Automation",
    organization: "Freelance",
    imageSource: "/WorkCICO Screenshot.jpg",
    mockupType: "power-platform",
    tools: ["Microsoft Power Apps", "Microsoft Power Automate", "Digitalisation"],
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
    category: "Aerospace",
    organization: "Temasek Polytechnic",
    mockupType: "aerospace",
    tools: ["Aircraft Maintenance", "Aircraft Inspection", "Stress Management"],
    learningPoints:
      "Learnt riveting, soldering, and composite materials. Instilled resilience, self-discipline, and ability to handle stress.",
  },
  {
    id: "poly-forum-2024",
    title: "Poly Forum 2024 App (SYLP)",
    description:
      "App developed for a nationwide event to efficiently manage attendance of 500 students through geofencing and score tabulation.",
    category: "Tools/Automation",
    organization: "Temasek Polytechnic",
    mockupType: "power-platform",
    tools: ["Microsoft Power Platform", "UI Design", "Agile App Dev"],
  },
  {
    id: "google-colab-bot",
    title: "Google Colab Text to Flowchart Bot",
    description:
      "Created an AI tool using Python and ChatGPT 3.5 that generates flowcharts from text.",
    category: "R&D",
    organization: "Temasek Polytechnic",
    mockupType: "power-platform",
    tools: ["Python", "OpenAI", "Flowgiston"],
    learningPoints:
      "Explored prompt engineering and integrating python libraries together in a single notebook for workflow tools.",
  },
];

export const personalProjects: Project[] = [
  {
    id: "simply-clik",
    title: "Simply Clik",
    description:
      "Self-hosted RPA for the agent era. Record & replay browser flows in Edge, automate any Windows desktop app, and let Claude or Copilot drive it through MCP — with a live feed, approval gate, and kill switch.",
    category: "Personal",
    organization: "Personal",
    isPersonal: true,
    featured: true,
    mockupType: "simply-clik",
    tools: ["Node.js", "JavaScript", "MCP Server", "Firebase", "Playwright", "Windows Automation", "Claude API"],
    features: [
      "Browser automation with Edge record & replay",
      "Desktop automation for any Windows app",
      "AI agent control via MCP (Claude, Copilot)",
      "Live feed with approval gate and kill switch",
      "Per-machine licensing, not per-robot",
      "Self-hosted — no cloud dependency",
    ],
    learningPoints:
      "Built a full RPA platform from scratch. Key insight: structuring the approval gate so AI agents need explicit human approval before executing destructive actions.",
  },
  {
    id: "powercodex",
    title: "PowerCodex",
    description:
      "Spec-driven development initializer for Power Apps Code Apps. Combines a customized starter template, OpenSpec artifacts, and GitHub Copilot prompt files so development moves from idea to reviewed requirements to implementation.",
    category: "Personal",
    organization: "Personal",
    isPersonal: true,
    featured: true,
    mockupType: "powercodex",
    githubUrl: "https://github.com/ElfredSeow/PowerCodex",
    tools: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Zustand", "TanStack Query", "GitHub Actions"],
    features: [
      "Automated project scaffolding via CLI: codespec init",
      "OpenSpec configuration tailored for Power Apps",
      "11 GitHub Copilot skill folders pre-configured",
      "CodeQL, GHAS, and quality check workflows",
      "Vitest + Playwright testing setup",
      "Integrated security scanning and dependency review",
    ],
    learningPoints:
      "Designed an opinionated scaffold that encodes spec-first development discipline. The OpenSpec + Copilot integration keeps all design decisions in the repository, not lost in chat history.",
  },
  {
    id: "pc-monitoring",
    title: "VitalsDash — PC Monitor",
    description:
      "Lightweight Windows desktop app for real-time monitoring of CPU, RAM, GPU, NPU usage and temperatures. Features a compact semi-transparent overlay mode perfect for gaming.",
    category: "Personal",
    organization: "Personal",
    isPersonal: true,
    mockupType: "pc-monitor",
    githubUrl: "https://github.com/ElfredSeow/PC-Monitoring-System",
    tools: ["C#", ".NET 10.0", "Windows Forms", "WMI", "PowerShell"],
    features: [
      "Real-time CPU, RAM, GPU, NPU monitoring",
      "Temperature readings for CPU and GPU",
      "Compact overlay mode stays on top of other windows",
      "Multi-monitor support for overlay placement",
      "Draggable overlay (Alt + Left Click)",
      "System tray integration",
    ],
    learningPoints:
      "First C# / WinForms project. Explored Windows WMI APIs for hardware telemetry. The overlay mode required learning multi-monitor DPI handling.",
  },
  {
    id: "sbom",
    title: "Software Bill of Materials",
    description:
      "SBOM template and reporting tool for cataloging software components, dependencies, and vulnerability metadata. Built as part of learning cybersecurity supply chain security practices.",
    category: "Personal",
    organization: "Personal",
    isPersonal: true,
    mockupType: "sbom",
    githubUrl: "https://github.com/ElfredSeow/Software-Bill-of-Materials",
    tools: ["HTML", "Cybersecurity", "SBOM", "Dependency Analysis"],
    learningPoints:
      "Learned about supply chain security, library vulnerability monitoring, and SBOM standards (SPDX/CycloneDX). Explored how to surface risk from transitive dependencies.",
  },
  {
    id: "local-paw-pantry",
    title: "Local Paw Pantry",
    description:
      "Android app for tracking pet food consumption, operating fully offline on-device with no cloud dependency. Supports CSV export for data portability.",
    category: "Personal",
    organization: "Personal",
    isPersonal: true,
    mockupType: "paw-pantry",
    githubUrl: "https://github.com/ElfredSeow/Local_Paw_Pantry",
    tools: ["Kotlin", "Android", "Material Design", "Room DB", "CsvHelper"],
    features: [
      "Fully local — no internet required",
      "Pet food tracking with date logging",
      "CSV data export",
      "Repository pattern with local database",
      "Material Design UI",
    ],
    learningPoints:
      "First Kotlin/Android project. Learned the Android lifecycle, Room database patterns, and how to design for fully-offline experiences.",
  },
  {
    id: "auto-github-commit",
    title: "Auto GitHub Commit",
    description:
      "Git automation tool that watches your project files and automatically stages, commits, and pushes changes to GitHub after a 3-second debounce — eliminating manual git commands.",
    category: "Personal",
    organization: "Personal",
    isPersonal: true,
    mockupType: "auto-commit",
    githubUrl: "https://github.com/ElfredSeow/Auto-Github-Commit",
    tools: ["Node.js", "JavaScript", "Git", "File System Watcher", "npx"],
    features: [
      "Watches project files for any change",
      "3-second debounce prevents commit spam",
      "Auto git pull before push for multi-device support",
      "Ignores node_modules, build, dist folders",
      "Interactive CLI setup",
      "Works via npx with no global install",
    ],
    learningPoints:
      "Built a developer quality-of-life tool used in daily workflow. The debounce logic and conflict resolution on multi-device sync were the hardest parts to get right.",
  },
];

// Combined for backward compat
export const projects: Project[] = [...workProjects];

export const experience = [
  {
    company: "RAiD (RSAF Agile Innovation Digital)",
    role: "Power Platform Solution Architect, Student Intern",
    period: "Oct 2025 – Present (7 months)",
    location: "Singapore",
    description:
      "Specializing in Power Apps and Power Platform within the PPCoE team. Focus on designing digital solutions that streamline processes, improve data quality, and support data-driven decision-making.",
  },
  {
    company: "Temasek Polytechnic",
    role: "PowerApp / Power Platform Developer",
    period: "Dec 2023 – Present",
    location: "Singapore",
    description:
      "Self-learnt PowerApps to automate admin work for various CCAs, enhancing club efficiency.",
  },
  {
    company: "Freelance",
    role: "Software Engineer (Power Platform)",
    period: "Dec 2024 – Oct 2025",
    location: "Singapore",
    description:
      "Leveraged low code tools like PowerApps and Power Automate to develop tailored automation solutions.",
  },
  {
    company: "Personal Company",
    role: "Freelance / Mini Start Up",
    period: "Apr 2021 – Jan 2023",
    location: "Singapore",
    description:
      "Founded a business in the Anime industry animating 2D models using Live 2D Cubism, building a portfolio with low-code platforms and practicing SEO strategies.",
  },
];
