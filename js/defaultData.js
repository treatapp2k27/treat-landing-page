/**
 * Treat Landing Page - Default Configuration & Workflow Data
 * Aligned with media_1789639982971.jpg & treat-website-design.md
 */

const TREAT_DEFAULT_DATA = {
  brand: {
    appName: "Treat",
    tagline: "Funky Foodie Feasts & Squad Deals",
    heroHeadline: "Find Your Craving\nShare the Good Stuff\nMake It a Treat",
    heroCaption: "Treat connects modern foodies with dynamic platter deals, automated budget matching, instant 2-minute table holds, and real-time kitchen floor sync. The all-in-one culinary squad experience.",
    liveSocialProof: "10,000+ foodies saving daily • 2-min table holds • Smart budget matching",
    logoPath: "assets/images/treat_bubble_logo.png"
  },
  download: {
    mode: "coming_soon", // 'coming_soon' | 'play_store' | 'direct_apk' | 'store_and_apk'
    modalBadge: "DROPPING SOON • PRIVATE PREVIEW",
    modalTitle: "Something delicious is in the works.",
    modalSubtitle: "We're quietly perfecting a whole new way to feast with your squad. Drop your contact below to get an invite before doors open to the public.",
    modalNotifyBtnText: "Request Early Invite ✨",
    modalSuccessMsg: "You're on the invite list! Keep an eye on your inbox.",
    modalFooterNote: "Invite-only initial batch. No spam, just first access.",
    progressPercent: 85,
    progressLabel: "Launch Readiness",
    progressSublabel: "Private Beta & Kitchen Floor Sync",
    ctaText: "Download Treat",
    ctaSubtext: "Your next great meal is already waiting.",
    apkFileName: "Treat-v1.0.4-release.apk",
    apkVersion: "v1.0.4 (Android 9.0+)",
    apkSize: "24.8 MB",
    apkDownloadUrl: "assets/downloads/Treat-v1.0.4-release.apk",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.treat.app",
    webDemoUrl: "http://localhost:8080",
    releaseDate: "Launching Soon 2026",
    trustBadge: "100% Virus-Free • Android & iOS • Instant Table Sync"
  },
  // 4 Primary Flow Steps with Appetite-Focused Copy
  flowSteps: [
    {
      id: "step-1",
      number: "1",
      icon: "local_fire_department",
      title: "Discover a deal",
      description: "Browse handpicked dining drops near you with real discounts.",
      image: "assets/screens/01_explore.png",
      tag: "2-FOR-1 DROPS",
      accentColor: "#E040A0"
    },
    {
      id: "step-2",
      number: "2",
      icon: "tune",
      title: "Match your budget",
      description: "Set what you want to spend per person. No hidden surprises.",
      image: "assets/screens/02_budget.png",
      tag: "SMART SPLIT",
      accentColor: "#E040A0"
    },
    {
      id: "step-3",
      number: "3",
      icon: "timer",
      title: "Hold the table",
      description: "Lock your spot for 2 minutes with zero deposit while the squad gathers.",
      image: "assets/screens/04_hold.png",
      tag: "INSTANT HOLD",
      accentColor: "#E040A0"
    },
    {
      id: "step-4",
      number: "4",
      icon: "groups",
      title: "Share the feast",
      description: "Split the bill effortlessly, share dining moments, and level up perks.",
      image: "assets/screens/06_social.png",
      tag: "SQUAD SOCIAL",
      accentColor: "#E040A0"
    }
  ],
  availableScreens: [
    { id: "lib-0", title: "Welcome & Onboarding", image: "assets/screens/00_welcome.png", icon: "celebration" },
    { id: "lib-1", title: "Discover a deal", image: "assets/screens/01_explore.png", icon: "local_fire_department" },
    { id: "lib-2", title: "Match your budget", image: "assets/screens/02_budget.png", icon: "tune" },
    { id: "lib-3", title: "Platter Packages in Budget", image: "assets/screens/03_platters.png", icon: "restaurant" },
    { id: "lib-4", title: "Hold the table", image: "assets/screens/04_hold.png", icon: "timer" },
    { id: "lib-5", title: "Digital Voucher & Check-in", image: "assets/screens/05_voucher.png", icon: "qr_code_2" },
    { id: "lib-6", title: "Share the feast", image: "assets/screens/06_social.png", icon: "groups" },
    { id: "lib-7", title: "Kitchen Floor & Table Manager", image: "assets/screens/07_kitchen.png", icon: "table_restaurant" }
  ],
  foodPhotos: [
    { src: "assets/images/fiesta_platter.jpg", title: "Fiesta Platter Deluxe", tag: "2-for-1 Mega Platter", price: "৳ 380" },
    { src: "assets/images/churro_sundae.jpg", title: "Churro Lava Sundae", tag: "Dessert Craze", price: "৳ 145" },
    { src: "assets/images/taco_bodega.jpg", title: "Taco Bodega Box", tag: "Squad Feast (4-6)", price: "৳ 460" },
    { src: "assets/images/bistro_bella.jpg", title: "Bistro Truffle Feast", tag: "Chef Special", price: "৳ 520" }
  ],
  reviews: [
    {
      name: "Mila Candy",
      role: "Foodie • Squad of 6",
      avatar: "assets/images/churro_sundae.jpg",
      comment: "Found an amazing platter deal nearby. The 2-minute hold feature is a game changer!",
      rating: 5
    },
    {
      name: "Chef Marco V.",
      role: "Food Lover",
      avatar: "assets/images/taco_bodega.jpg",
      comment: "The budget matcher helped us find the perfect spot. Great food, great people!",
      rating: 5
    },
    {
      name: "Leo Chen",
      role: "Community Foodie",
      avatar: "assets/images/bistro_bella.jpg",
      comment: "The app is super smooth and the restaurant team is amazing. Highly recommended!",
      rating: 5
    }
  ],
  team: [
    {
      id: "member-1",
      name: "Eftakhar Amin Sakib",
      role: "Lead Full-Stack & Mobile Engineer",
      bio: "Architecting real-time mobile sync, interactive 3D UI, and clean cross-platform infrastructure.",
      avatar: "https://github.com/EFTAKHAR-AMIN-SAKIB.png",
      portfolioUrl: "https://github.com/EFTAKHAR-AMIN-SAKIB",
      githubUrl: "https://github.com/EFTAKHAR-AMIN-SAKIB",
      linkedinUrl: "https://www.linkedin.com/in/eftakhar-amin-sakib/",
      location: "Dhaka, Bangladesh"
    },
    {
      id: "member-2",
      name: "Ayesha Rahman",
      role: "Product & UI/UX Designer",
      bio: "Crafting playful human-centered foodie flows, squad budgeting systems, and delightful visual design.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      portfolioUrl: "https://dribbble.com",
      githubUrl: "https://github.com",
      linkedinUrl: "https://linkedin.com",
      location: "Dhaka, Bangladesh"
    },
    {
      id: "member-3",
      name: "Tanvir Ahmed",
      role: "Backend & Systems Engineer",
      bio: "Building low-latency restaurant kitchen sync, instantaneous 2-minute table locks, and resilient APIs.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      portfolioUrl: "https://github.com",
      githubUrl: "https://github.com",
      linkedinUrl: "https://linkedin.com",
      location: "Dhaka, Bangladesh"
    }
  ],
  developer: {
    name: "Eftakhar Amin Sakib",
    role: "Lead Full-Stack & Mobile Software Engineer",
    location: "Dhaka, Bangladesh",
    status: "Active Engineering • Dhaka",
    bio: "Passionate about engineering delightful, high-performance digital products. Focused on clean architecture, interactive 3D micro-interactions, and human-centered design that brings foodies and local kitchens together.",
    avatar: "https://github.com/EFTAKHAR-AMIN-SAKIB.png",
    portfolioUrl: "https://github.com/EFTAKHAR-AMIN-SAKIB",
    githubUrl: "https://github.com/EFTAKHAR-AMIN-SAKIB",
    linkedinUrl: "https://www.linkedin.com/in/eftakhar-amin-sakib/",
    repoUrl: "https://github.com/EFTAKHAR-AMIN-SAKIB/treat-landing-page",
    skills: ["Flutter & Android", "Tailwind CSS", "Node.js & APIs", "Interactive 3D UI", "Realtime Sync", "UI/UX Architecture"]
  },
  contact: {
    facebookUrl: "https://facebook.com/treat.official",
    facebookLabel: "Treat Official",
    supportEmail: "support.treat@gmail.com",
    copyrightText: "© 2026 Treat Inc."
  }
};

if (typeof window !== "undefined") {
  window.TREAT_DEFAULT_DATA = TREAT_DEFAULT_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = TREAT_DEFAULT_DATA;
}
