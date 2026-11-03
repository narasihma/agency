/** Redraft preview (/redraft/): copy and assets from the "Redraft" group in the Figma file */

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/redraft/${name}`;

export interface RedraftLink {
  label: string;
  href: string;
}

export interface RedraftBenefit {
  title: string;
  description: string;
  number: string;
}

export interface RedraftDay {
  /** Milestone label shown above the date ("Day 1"), only on milestone days */
  label?: string;
  date: string;
}

export interface RedraftStep {
  label: string;
  title: string;
  body: string;
}

export interface RedraftProject {
  image: string;
  alt: string;
}

export interface RedraftPerson {
  name: string;
  avatar: string;
  footerAvatar: string;
}

export const REDRAFT_ASSETS = {
  logo: asset("logo.svg"),
  wordmark: asset("wordmark.svg"),
  texture: asset("texture.jpg"),
  grain: asset("grain.png"),
  iconChat: asset("icon-chat.svg"),
  iconSound: asset("icon-sound.svg"),
  iconUser: asset("icon-user.svg"),
  iconMenu: asset("icon-menu.svg"),
  arrow: asset("arrow.svg"),
  arrowOnAccent: asset("arrow-on-accent.svg"),
  chart: asset("chart.svg"),
  emptySlot: asset("empty-slot.svg"),
  caret: asset("caret.svg"),
  linkedIn: asset("linkedin.svg"),
  teamMark: asset("team-mark.svg"),
};

export const REDRAFT = {
  brand: "1BRAND",
  hero: {
    headline: "Your custom website, live in 10 days.",
    headlineMuted: "A team behind your growth.",
    priceFrom: "From",
    price: "€89",
    pricePeriod: "/month",
  },
  primaryCta: { label: "Book a call", caption: "20min – No commitment", href: "#contact" },
  secondaryCta: { label: "Explore our plans", href: "#plans" },
  team: [
    { name: "Adrien", avatar: asset("avatar-adrien-approach.png"), footerAvatar: asset("avatar-adrien.png") },
    { name: "Agathe", avatar: asset("avatar-agathe-approach.png"), footerAvatar: asset("avatar-agathe.png") },
  ] satisfies RedraftPerson[],
  approach: {
    title: "A website that works for you.",
    titleMuted: "Not the other way around.",
    body: "Your tailor-made website is online in 10 days, with no setup fee. Your budget goes to what matters: analysing it, improving it and turning it into a real asset. From month 13, it is yours.",
    cta: { label: "Get started", href: "#plans" },
    benefits: [
      { title: "Performance", description: "Designed to be visible. Built to be useful.", number: "01." },
      { title: "Subscription", description: "Website creation included. A predictable budget.", number: "02." },
      { title: "Improvement", description: "Your website gets better. Every month.", number: "03." },
      { title: "Ownership", description: "Your website is yours from month 13.", number: "04." },
    ] satisfies RedraftBenefit[],
  },
  process: {
    eyebrow: "Our process, in 10 days",
    title: "A simple process",
    titleMuted: "in three steps.",
    days: [
      { label: "Day 1", date: "Wed, Nov 4" },
      { date: "Thu, Nov 5" },
      { date: "Fri, Nov 6" },
      { label: "Day 4", date: "Mon, Nov 9" },
      { date: "Tue, Nov 10" },
      { date: "Thu, Nov 12" },
      { label: "Day 7", date: "Fri, Nov 13" },
      { date: "Mon, Nov 16" },
      { date: "Tue, Nov 17" },
      { label: "Day 10", date: "Wed, Nov 18" },
    ] satisfies RedraftDay[],
    steps: [
      {
        label: "Step 01",
        title: "You share the essentials.",
        body: "A simple 5-minute questionnaire helps us understand your business, your goals and what your website needs to achieve.",
      },
      {
        label: "Step 02",
        title: "You discover a first design.",
        body: "We present a fully developed proposal, then refine it with you based on your feedback.",
      },
      {
        label: "Step 03",
        title: "Your website comes to life.",
        body: "Once you approve the result, we handle development, testing and launch.",
      },
    ] satisfies RedraftStep[],
    closingMuted: "Going live is just one step.",
    closing: "The journey continues to turn your website into a real",
    closingAccent: "asset",
  },
  work: {
    eyebrow: "Our work",
    title: "Made for you.",
    titleMuted: "Without limits.",
    projects: [
      { image: asset("project-1.png"), alt: "Executive recruitment website" },
      { image: asset("project-2.png"), alt: "Alma Vera studio website" },
      { image: asset("project-3.png"), alt: "Pipoulette website" },
      { image: asset("project-4.png"), alt: "CB1 signalling inhibitors website" },
      { image: asset("project-5.png"), alt: "Cinema website" },
      { image: asset("project-6.png"), alt: "Euphorie website" },
      { image: asset("project-7.png"), alt: "Events agency website" },
    ] satisfies RedraftProject[],
    slotTitle: "Your website, ready on",
    slotDate: "Wednesday, November 18, 2026",
  },
  footer: {
    pitchMuted: "This is only the end of the page.",
    pitch: "Imagine what comes next.",
    explore: {
      title: "Explore",
      links: [
        { label: "Websites by subscription", href: "#" },
        { label: "How we create it", href: "#" },
        { label: "Our work", href: "#work" },
        { label: "Pricing", href: "#plans" },
        { label: "FAQ", href: "#" },
        { label: "Resources", href: "#" },
      ] satisfies RedraftLink[],
    },
    legal: {
      title: "Legal",
      links: [
        { label: "Sitemap", href: "#" },
        { label: "Legal notice", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Cookies", href: "#" },
      ] satisfies RedraftLink[],
    },
    language: "EN · EUR (€)",
    copyright: "© 1BRAND 2027 — All rights reserved.",
  },
};
