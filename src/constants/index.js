// Portfolio data constants
export const servicesData = [
  {
    title: "Full-Stack Development",
    description:
      "Your business deserves a fast, secure, and future-proof digital foundation. I develop custom web apps with clean architecture, optimized databases, and seamless integrations—ensuring reliability at every layer.",
    tags: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"],
    items: [
      {
        title: "Backend Engineering",
        description: "(REST/GraphQL APIs, Microservices, Auth Systems)",
      },
      {
        title: "Frontend Excellence",
        description: "(React, Next.js, TypeScript, Interactive UI/UX)",
      },
      {
        title: "Database Design",
        description: "(SQL/NoSQL Optimization, Scalable Structures)",
      },
    ],
  },
  {
    title: "DevOps & Cloud Solutions",
    description:
      "Deploying software shouldn't be a gamble. I automate infrastructure, enforce security, and leverage cloud platforms (AWS/Azure) to keep your app running smoothly—24/7, at any scale.",
    tags: ["AWS", "Docker", "Kubernetes", "GitHub Actions", "Nginx", "Linux"],
    items: [
      {
        title: "CI/CD Pipelines",
        description: "(GitHub Actions, Docker, Kubernetes)",
      },
      {
        title: "Server Management",
        description: "(Linux, Nginx, Load Balancing)",
      },
      {
        title: "Performance Tuning",
        description: "(Caching, Compression, Lighthouse 90+ Scores)",
      },
    ],
  },
  {
    title: "Security & Optimization",
    description:
      "Slow or hacked apps destroy trust. I harden security (XSS/SQLI protection, OAuth) and eliminate bottlenecks so your product stays fast, safe, and scalable as you grow.",
    tags: ["OAuth 2.0", "Core Web Vitals", "SSR", "Code Audits", "SEO Schema"],
    items: [
      {
        title: "Code Audits",
        description: "(Refactoring, Tech Debt Cleanup)",
      },
      {
        title: "Pen Testing",
        description: "(Vulnerability Assessments & Hardening)",
      },
      {
        title: "SEO Tech Stack",
        description: "(SSR, Metadata, Structured Data)",
      },
    ],
  },
  {
    title: "Web & Mobile Apps",
    description:
      "A clunky interface can sink even the best ideas. I craft responsive, pixel-perfect web and mobile apps (React Native/Flutter) that users love—bridging design and functionality seamlessly.",
    tags: ["React Native", "Flutter", "PWA", "Stripe", "Three.js", "GSAP"],
    items: [
      {
        title: "Cross-Platform Apps",
        description: "(Single codebase for iOS / Android / Web)",
      },
      {
        title: "PWAs",
        description: "(Offline Mode, Push Notifications)",
      },
      {
        title: "E-Commerce",
        description: "(Checkout Flows, Payment Gateways, Inventory APIs)",
      },
    ],
  },
];

export const projects = [
  {
    id: 1,
    name: "Mobile Accessories E-Commerce",
    category: "E-Commerce",
    role: "Lead Full-Stack Engineer",
    timeline: "6 Weeks",
    performance: "98 / 100",
    year: "2025",
    description:
      "An online store specializing in phone accessories including cases, chargers, cables, and power banks with MagSafe compatibility and instant cart workflows.",
    highlights: [
      "Server-rendered product catalog with sub-second search & filter latency",
      "Real-time inventory sync backed by MongoDB aggregation pipelines",
      "Mobile-first checkout experience designed for high conversion",
    ],
    href: "https://github.com/Manindra-Roy",
    image: "/assets/projects/mobile-accessories-store.jpg",
    bgImage: "/assets/backgrounds/blanket.jpg",
    frameworks: [
      { id: 1, name: "React" },
      { id: 2, name: "Next.js" },
      { id: 3, name: "Node.js" },
      { id: 4, name: "MongoDB" },
      { id: 5, name: "Tailwind CSS" },
    ],
  },
  {
    id: 2,
    name: "Plant Shop E-Commerce",
    category: "E-Commerce",
    role: "Full-Stack & UI Engineer",
    timeline: "4 Weeks",
    performance: "97 / 100",
    year: "2025",
    description:
      "A curated online store for rare and decorative plants featuring care guides, seamless Stripe payments, and a calm, editorial shopping experience.",
    highlights: [
      "End-to-end Stripe Checkout with webhook-driven order tracking",
      "Care-level & sunlight filtering tailored for indoor plant collectors",
      "Optimized responsive imagery achieving 97+ Lighthouse performance",
    ],
    href: "https://github.com/Manindra-Roy",
    image: "/assets/projects/plant-shop.jpg",
    bgImage: "/assets/backgrounds/curtains.jpg",
    frameworks: [
      { id: 1, name: "React" },
      { id: 2, name: "Next.js" },
      { id: 3, name: "Stripe API" },
      { id: 4, name: "Tailwind CSS" },
    ],
  },
  {
    id: 3,
    name: "Apple Tech Marketplace",
    category: "Web Apps",
    role: "Full-Stack Architect",
    timeline: "8 Weeks",
    performance: "96 / 100",
    year: "2024",
    description:
      "A high-speed marketplace for Apple products and accessories with tiered deals, specification comparisons, and multi-facet category filtering.",
    highlights: [
      "Typed full-stack architecture using Blazor and ASP.NET Core",
      "Indexed SQL Server queries for instant SKU & spec filtering",
      "Role-based admin dashboard for flash sales and stock updates",
    ],
    href: "https://github.com/Manindra-Roy",
    image: "/assets/projects/apple-tech-store.jpg",
    bgImage: "/assets/backgrounds/map.jpg",
    frameworks: [
      { id: 1, name: "Blazor" },
      { id: 2, name: "ASP.NET Core" },
      { id: 3, name: "SQL Server" },
      { id: 4, name: "Bootstrap" },
    ],
  },
  {
    id: 4,
    name: "Electronics & Gadgets Store",
    category: "E-Commerce",
    role: "Full-Stack Developer",
    timeline: "5 Weeks",
    performance: "95 / 100",
    year: "2024",
    description:
      "A multi-category online shop featuring electronics, home appliances, and gaming gear with promotional bundles and live deal timers.",
    highlights: [
      "Reactive Vue.js storefront powered by a clean Laravel REST API",
      "Automated coupon engine and dynamic bundle pricing rules",
      "Structured MySQL schema supporting thousands of product variants",
    ],
    href: "https://github.com/Manindra-Roy",
    image: "/assets/projects/electronics-store.jpg",
    bgImage: "/assets/backgrounds/poster.jpg",
    frameworks: [
      { id: 1, name: "Vue.js" },
      { id: 2, name: "Laravel" },
      { id: 3, name: "MySQL" },
      { id: 4, name: "SCSS" },
    ],
  },
  {
    id: 5,
    name: "Home Decor Marketplace",
    category: "Platforms",
    role: "Frontend & GraphQL Engineer",
    timeline: "6 Weeks",
    performance: "96 / 100",
    year: "2024",
    description:
      "A curated collection of designer home decor items—including sculptural furniture and artisan vases—built around visual discovery.",
    highlights: [
      "Flexible GraphQL API fetching tailored editorial collections",
      "Real-time wishlists and instant authentication via Firebase",
      "Accessible Material UI component architecture with dark accents",
    ],
    href: "https://github.com/Manindra-Roy",
    image: "/assets/projects/home-decor-store.jpg",
    bgImage: "/assets/backgrounds/table.jpg",
    frameworks: [
      { id: 1, name: "Angular" },
      { id: 2, name: "Firebase" },
      { id: 3, name: "GraphQL" },
      { id: 4, name: "Material UI" },
    ],
  },
  {
    id: 6,
    name: "Digital Game Store",
    category: "Platforms",
    role: "Full-Stack Engineer",
    timeline: "5 Weeks",
    performance: "99 / 100",
    year: "2024",
    description:
      "A fast digital gaming storefront featuring discounted titles, top-seller leaderboards, and instant genre-based discovery.",
    highlights: [
      "Ultra-lightweight Svelte frontend with crisp micro-interactions",
      "Dynamic genre & tag recommendation API powered by Node & MongoDB",
      "Instant library delivery flow with verified digital key management",
    ],
    href: "https://github.com/Manindra-Roy",
    image: "/assets/projects/game-store.jpg",
    bgImage: "/assets/backgrounds/curtains.jpg",
    frameworks: [
      { id: 1, name: "Svelte" },
      { id: 2, name: "Node.js" },
      { id: 3, name: "MongoDB" },
      { id: 4, name: "Chakra UI" },
    ],
  },
];

export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/manindra_roy_official" },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@TechTentaclesOfficial",
  },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/manindraroyofficial" },
  { name: "GitHub", href: "https://github.com/Manindra-Roy" },
];

export const techStack = [
  { name: "React", icon: "mdi:react", category: "Frontend" },
  { name: "Next.js", icon: "ri:nextjs-fill", category: "Frontend" },
  { name: "TypeScript", icon: "mdi:language-typescript", category: "Frontend" },
  { name: "Tailwind CSS", icon: "mdi:tailwind", category: "Frontend" },
  { name: "Three.js", icon: "tabler:brand-threejs", category: "Cloud & 3D" },
  { name: "Node.js", icon: "mdi:nodejs", category: "Backend" },
  { name: "GraphQL", icon: "mdi:graphql", category: "Backend" },
  { name: "MongoDB", icon: "simple-icons:mongodb", category: "Backend" },
  { name: "PostgreSQL", icon: "akar-icons:postgresql-fill", category: "Backend" },
  { name: "Docker", icon: "mdi:docker", category: "Cloud & 3D" },
  { name: "AWS", icon: "mdi:aws", category: "Cloud & 3D" },
  { name: "Git", icon: "mdi:git", category: "Cloud & 3D" },
];

export const aboutStats = [
  { value: "20+", num: 20, suffix: "+", label: "Projects Shipped" },
  { value: "99+", num: 99, suffix: "+", label: "Lighthouse Score" },
  { value: "100%", num: 100, suffix: "%", label: "Client Satisfaction" },
  { value: "24/7", num: null, suffix: "", label: "Cloud Uptime" },
];

export const aboutHighlights = [
  {
    icon: "lucide:code-2",
    title: "Open Source",
    desc: "Shipping & experimenting with modern developer tools and UI systems.",
  },
  {
    icon: "lucide:video",
    title: "Creator & Mentor",
    desc: "Teaching developers on YouTube & streams—because rising tides lift all ships.",
  },
  {
    icon: "lucide:mountain",
    title: "Rock Climbing",
    desc: "Problem-solving with real stakes, balance, and calculated routes.",
  },
  {
    icon: "lucide:music",
    title: "Guitar & Flow",
    desc: "Strumming chords while CI pipelines pass—multitasking at its finest.",
  },
];

export const workflowSteps = [
  {
    step: "01",
    title: "Discovery & Strategy",
    desc: "Mapping business goals, user flows, and technical requirements before writing a single line of code.",
  },
  {
    step: "02",
    title: "Architecture & UI",
    desc: "Designing scalable database schemas, APIs, and responsive, high-converting interfaces.",
  },
  {
    step: "03",
    title: "Full-Stack Build",
    desc: "Engineering clean, modular frontend and backend code with automated testing and CI/CD.",
  },
  {
    step: "04",
    title: "Launch & Scale",
    desc: "Zero-downtime cloud deployment, Lighthouse 99+ tuning, and ongoing performance monitoring.",
  },
];
