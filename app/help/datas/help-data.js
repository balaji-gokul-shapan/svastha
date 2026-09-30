/* ==========================================================================
   HELP & SUPPORT — demo content
   ========================================================================== */

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  Ear,
  Eye,
  FileText,
  Globe,
  HeartPulse,
  LifeBuoy,
  Mail,
  MessageCircle,
  PhoneCall,
  PlayCircle,
  ReceiptIndianRupee,
  Rocket,
  Send,
  Server,
  ShieldCheck,
  Syringe,
  ThumbsUp,
  Timer,
  Users,
  Video,
  Zap,
} from "lucide-react";

import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";

/* -------------------------------------------------------------------------- */
/* Topics                                                                     */
/* -------------------------------------------------------------------------- */

export const HELP_TOPICS = [
  {
    id: "getting-started",
    label: "Getting started",
    blurb:
      "Create your school, invite staff, assign screening camps and run your first health check.",
    icon: Rocket,
    tone: "brand",
    articles: 12,
    minutes: 24,
  },
  {
    id: "students",
    label: "Students & records",
    blurb:
      "Add or import students, fix duplicates, promote a class and keep photos tidy.",
    icon: Users,
    tone: "primary",
    articles: 18,
    minutes: 42,
  },
  {
    id: "screening",
    label: "Screening workflow",
    blurb:
      "Camps, class lists, offline capture, saving drafts and submitting a completed round.",
    icon: HeartPulse,
    tone: "physical",
    articles: 15,
    minutes: 36,
  },
  {
    id: "vision",
    label: "Vision screening",
    blurb:
      "Distance and near acuity entry, lens correction, referral grades and re-tests.",
    icon: Eye,
    tone: "vision",
    articles: 9,
    minutes: 18,
  },
  {
    id: "hearing",
    label: "Hearing & ENT",
    blurb:
      "Pure-tone results, ear examination findings, speech screening and ENT referrals.",
    icon: Ear,
    tone: "hearing",
    articles: 11,
    minutes: 22,
  },
  {
    id: "oral",
    label: "Oral health",
    blurb:
      "Tooth chart recording, gum health, severity scoring and the dental summary.",
    icon: ToothIcon,
    tone: "oral",
    articles: 8,
    minutes: 17,
  },
  {
    id: "immunization",
    label: "Immunisation",
    blurb:
      "Vaccination matrix, due and overdue students, and school-level coverage numbers.",
    icon: Syringe,
    tone: "immunization",
    articles: 7,
    minutes: 15,
  },
  {
    id: "reports",
    label: "Reports & exports",
    blurb:
      "Health cards, the consolidated report, PDF settings, letterheads and bulk export.",
    icon: BarChart3,
    tone: "primary",
    articles: 14,
    minutes: 31,
  },
  {
    id: "billing",
    label: "Billing & invoices",
    blurb:
      "Camp billing, tax invoices, payment status, credits and downloading statements.",
    icon: ReceiptIndianRupee,
    tone: "primary",
    articles: 10,
    minutes: 20,
  },
  {
    id: "account",
    label: "Account, roles & security",
    blurb:
      "Team logins, role permissions, two-step questions, sessions and data privacy.",
    icon: ShieldCheck,
    tone: "primary",
    articles: 13,
    minutes: 26,
  },
];

export const HELP_ARTICLE_TOTAL = HELP_TOPICS.reduce(
  (total, topic) => total + topic.articles,
  0,
);

export const HELP_READ_TOTAL = HELP_TOPICS.reduce(
  (total, topic) => total + topic.minutes,
  0,
);

/* -------------------------------------------------------------------------- */
/* Most-read articles                                                         */
/* -------------------------------------------------------------------------- */

export const HELP_ARTICLES = [
  {
    id: "art-01",
    title: "Invite your school staff and pick the right role",
    topicId: "account",
    type: "guide",
    readMinutes: 4,
    views: 2841,
    helpful: 96,
    updated: "2 days ago",
    featured: true,
  },
  {
    id: "art-02",
    title: "Run a screening camp from class list to submission",
    topicId: "screening",
    type: "video",
    readMinutes: 6,
    views: 2310,
    helpful: 94,
    updated: "5 days ago",
    featured: true,
  },
  {
    id: "art-03",
    title: "Import students from a spreadsheet without duplicates",
    topicId: "students",
    type: "guide",
    readMinutes: 5,
    views: 1988,
    helpful: 91,
    updated: "1 week ago",
  },
  {
    id: "art-04",
    title: "Print a class of health cards, front and back",
    topicId: "reports",
    type: "checklist",
    readMinutes: 3,
    views: 1740,
    helpful: 93,
    updated: "3 days ago",
  },
  {
    id: "art-05",
    title: "Reading the vision referral grades",
    topicId: "vision",
    type: "reference",
    readMinutes: 7,
    views: 1286,
    helpful: 89,
    updated: "2 weeks ago",
  },
  {
    id: "art-06",
    title: "What due and overdue mean in the immunisation matrix",
    topicId: "immunization",
    type: "guide",
    readMinutes: 4,
    views: 1104,
    helpful: 92,
    updated: "6 days ago",
  },
  {
    id: "art-07",
    title: "Understand your invoice, credits and payment status",
    topicId: "billing",
    type: "guide",
    readMinutes: 5,
    views: 962,
    helpful: 88,
    updated: "9 days ago",
  },
  {
    id: "art-08",
    title: "Record a tooth chart when a student is uncooperative",
    topicId: "oral",
    type: "guide",
    readMinutes: 4,
    views: 733,
    helpful: 90,
    updated: "1 week ago",
  },
];

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export const HELP_FAQ_GROUPS = [
  {
    id: "faq-access",
    label: "Setup & access",
    topicIds: ["getting-started", "account", "students"],
    items: [
      {
        id: "faq-01",
        topicId: "getting-started",
        question: "How do I add a second school under the same account?",
        answer:
          "Settings → School details has an Add school action for admins. Each school keeps its own students, camps and academic year, while staff you mark as organisation-wide can move between them from the school switcher in the top bar.",
        steps: [
          "Open Settings → School details.",
          "Choose Add school and enter the UDISE code.",
          "Assign the staff who should see both schools.",
        ],
        helpful: 142,
        updated: "3 days ago",
        tags: ["school", "onboarding", "admin"],
      },
      {
        id: "faq-02",
        topicId: "account",
        question: "A teacher cannot see the Students page. What should I check?",
        answer:
          "Access is role-based: the teacher must be attached to the same school as the student and hold the teacher role. If the role is right, ask them to sign out and back in — permissions are read from the session cookie at sign-in, so a role change takes effect on the next login.",
        helpful: 118,
        updated: "1 week ago",
        tags: ["roles", "permissions", "teacher"],
      },
      {
        id: "faq-03",
        topicId: "account",
        question: "We forgot the security questions for an admin login.",
        answer:
          "A user with the admin role can reset them from Settings → Team → the member → Security questions. If no admin can sign in, raise a P1 ticket from this page and our team verifies the school, then issues a one-time reset link valid for 30 minutes.",
        helpful: 96,
        updated: "2 weeks ago",
        tags: ["security", "login", "reset"],
      },
      {
        id: "faq-04",
        topicId: "students",
        question: "The same student appears twice after an import.",
        answer:
          "The importer matches on admission number, then name plus date of birth. A duplicate usually means the second file carried a different admission number for the same child — open Students, search the name, then use Merge records so screening history moves to the surviving profile.",
        helpful: 87,
        updated: "5 days ago",
        tags: ["import", "duplicate", "students"],
      },
    ],
  },
  {
    id: "faq-screening",
    label: "Screening day",
    topicIds: ["screening", "vision", "hearing", "oral", "immunization"],
    items: [
      {
        id: "faq-05",
        topicId: "screening",
        question: "Does screening work without internet?",
        answer:
          "Yes. The screening form keeps your entries on the device and retries the sync when the connection returns; the header shows a Saved on device, waiting to sync chip. Do not sign out while that chip is showing — pending entries live with the session.",
        helpful: 203,
        updated: "yesterday",
        tags: ["offline", "sync", "camp"],
      },
      {
        id: "faq-06",
        topicId: "vision",
        question: "Where do I record a re-test after a referral?",
        answer:
          "Open the student's card, then the Vision tab. Add re-test appears once a referral grade exists; the new reading keeps its own date, so the trend chart shows the improvement instead of overwriting the first result.",
        helpful: 74,
        updated: "1 week ago",
        tags: ["vision", "referral", "re-test"],
      },
      {
        id: "faq-07",
        topicId: "hearing",
        question: "A result was entered for the wrong ear. Can I correct it?",
        answer:
          "Yes, until the round is submitted: reopen the form and change the side. After submission the record becomes read-only for audit, so use Amend on the student's screening history, which stores the previous values alongside the correction.",
        helpful: 69,
        updated: "2 weeks ago",
        tags: ["hearing", "audit", "amend"],
      },
      {
        id: "faq-08",
        topicId: "oral",
        question: "How is the dental severity score calculated?",
        answer:
          "The score weights decayed teeth, filled teeth and gum findings, then maps the total onto the severity band shown on the summary. Two photographs of the same mouth under different light still score the same — the calculation uses the chart entries only, never the photo.",
        helpful: 58,
        updated: "9 days ago",
        tags: ["dental", "scoring", "oral"],
      },
    ],
  },
  {
    id: "faq-reports",
    label: "Reports, billing & data",
    topicIds: ["reports", "billing", "account"],
    items: [
      {
        id: "faq-09",
        topicId: "reports",
        question: "Why is a section missing from the exported health card?",
        answer:
          "The report follows Settings → Report → Sections. Turn a section off there and both the on-screen card and the PDF drop it, which is how a school keeps the sheet to a single page for parents.",
        helpful: 131,
        updated: "4 days ago",
        tags: ["report", "pdf", "sections"],
      },
      {
        id: "faq-10",
        topicId: "reports",
        question: "Can I export every student's card at once?",
        answer:
          "Yes: Students → filter to the class you want → Export → Health cards. The job is queued and emailed to you as one PDF, one card per student, usually within a couple of minutes for a class of forty.",
        helpful: 112,
        updated: "1 week ago",
        tags: ["export", "bulk", "pdf"],
      },
      {
        id: "faq-11",
        topicId: "billing",
        question: "Our invoice shows fewer students than we screened.",
        answer:
          "Billing counts unique students screened inside the camp's date range: a student screened twice counts once, and entries still waiting to sync are not billed yet. Re-open the camp after the devices sync and the invoice regenerates.",
        helpful: 84,
        updated: "6 days ago",
        tags: ["invoice", "billing", "camp"],
      },
      {
        id: "faq-12",
        topicId: "account",
        question: "How long do you keep screening photos and records?",
        answer:
          "Records are retained for the academic year plus seven years, in line with school health record-keeping guidance, and photos live in encrypted object storage behind time-limited links. A school administrator can request deletion of one student's photos at any time.",
        helpful: 76,
        updated: "3 weeks ago",
        tags: ["privacy", "retention", "data"],
      },
    ],
  },
];

export const HELP_FAQ_COUNT = HELP_FAQ_GROUPS.reduce(
  (total, group) => total + group.items.length,
  0,
);

/* -------------------------------------------------------------------------- */
/* Start-here checklist                                                       */
/* -------------------------------------------------------------------------- */

export const HELP_ONBOARDING = [
  {
    id: "ob-01",
    title: "Add your school profile",
    detail: "Name, UDISE code, academic year and the logo used on report sheets.",
    minutes: 5,
    done: true,
    href: "/settings",
  },
  {
    id: "ob-02",
    title: "Invite the screening team",
    detail: "Doctors get the screening menus, teachers get students and reports.",
    minutes: 6,
    done: true,
    href: "/settings",
  },
  {
    id: "ob-03",
    title: "Import this year's students",
    detail: "Spreadsheet import maps class, section, admission number and DOB.",
    minutes: 8,
    done: true,
    href: "/students",
  },
  {
    id: "ob-04",
    title: "Plan a screening camp",
    detail: "Pick the classes and dates, then assign the doctors who will screen.",
    minutes: 4,
    done: false,
    href: "/health-checks",
  },
  {
    id: "ob-05",
    title: "Screen one class end to end",
    detail: "Vitals, vision, hearing, oral and immunisation on a real class list.",
    minutes: 12,
    done: false,
    href: "/health-checks",
  },
  {
    id: "ob-06",
    title: "Share the first health cards",
    detail: "Export a class of cards, or print them for the parent-teacher meeting.",
    minutes: 5,
    done: false,
    href: "/report",
  },
];

/* -------------------------------------------------------------------------- */
/* Tickets raised by this school (demo)                                       */
/* -------------------------------------------------------------------------- */

export const HELP_TICKETS = [
  {
    id: "SV-4821",
    subject: "Vision re-test is not showing on the health card",
    topicId: "vision",
    status: "open",
    priority: "high",
    channel: "in-app",
    created: "2 days ago",
    updated: "40 min ago",
    assignee: { name: "Priya N", role: "Support engineer", initials: "PN" },
    slaHoursLeft: 5,
    messages: 4,
  },
  {
    id: "SV-4798",
    subject: "Bulk PDF export stuck at 78 of 120 cards",
    topicId: "reports",
    status: "waiting",
    priority: "normal",
    channel: "email",
    created: "4 days ago",
    updated: "1 day ago",
    assignee: { name: "Arun K", role: "Support engineer", initials: "AK" },
    slaHoursLeft: 18,
    messages: 7,
  },
  {
    id: "SV-4763",
    subject: "Teacher account cannot open the dental chart",
    topicId: "oral",
    status: "pending",
    priority: "normal",
    channel: "phone",
    created: "6 days ago",
    updated: "2 days ago",
    assignee: { name: "Meera S", role: "Customer success", initials: "MS" },
    slaHoursLeft: 0,
    messages: 5,
  },
  {
    id: "SV-4702",
    subject: "Duplicate students after two imports of the same sheet",
    topicId: "students",
    status: "resolved",
    priority: "normal",
    channel: "in-app",
    created: "3 weeks ago",
    updated: "2 weeks ago",
    assignee: { name: "Arun K", role: "Support engineer", initials: "AK" },
    slaHoursLeft: 0,
    messages: 9,
  },
  {
    id: "SV-4688",
    subject: "Invoice credit not reflected after the second instalment",
    topicId: "billing",
    status: "resolved",
    priority: "high",
    channel: "email",
    created: "1 month ago",
    updated: "3 weeks ago",
    assignee: { name: "Meera S", role: "Customer success", initials: "MS" },
    slaHoursLeft: 0,
    messages: 6,
  },
];

/* Priority → the colour the badge should wear, plus the SLA the desk honours. */
export const HELP_PRIORITY = {
  urgent: { label: "Urgent", tone: "bad", slaHours: 2 },
  high: { label: "High", tone: "warning", slaHours: 8 },
  normal: { label: "Normal", tone: "primary", slaHours: 24 },
  low: { label: "Low", tone: "muted", slaHours: 48 },
};

export const HELP_STATUS = {
  open: { label: "Open", tone: "warning", hint: "With our support team" },
  waiting: { label: "Waiting on you", tone: "bad", hint: "We need an answer" },
  pending: { label: "Pending", tone: "primary", hint: "Scheduled work" },
  resolved: { label: "Resolved", tone: "good", hint: "Closed" },
};

/* -------------------------------------------------------------------------- */
/* Article kind → the chip it wears                                           */
/* -------------------------------------------------------------------------- */

export const HELP_ARTICLE_TYPES = {
  guide: { label: "Guide", icon: BookOpen },
  video: { label: "Watch", icon: PlayCircle },
  checklist: { label: "Checklist", icon: CheckCircle2 },
  reference: { label: "Reference", icon: FileText },
};

/* -------------------------------------------------------------------------- */
/* Platform status                                                            */
/* -------------------------------------------------------------------------- */

export const HELP_SERVICES = [
  {
    id: "svc-web",
    name: "Web app",
    icon: Globe,
    state: "operational",
    uptime: "99.98%",
    latency: "180 ms",
  },
  {
    id: "svc-api",
    name: "Screening API",
    icon: Server,
    state: "operational",
    uptime: "99.95%",
    latency: "240 ms",
  },
  {
    id: "svc-db",
    name: "Records & backups",
    icon: Database,
    state: "operational",
    uptime: "100%",
    latency: "nightly",
  },
  {
    id: "svc-pdf",
    name: "Reports & PDF export",
    icon: FileText,
    state: "degraded",
    uptime: "99.40%",
    latency: "1.9 s",
  },
  {
    id: "svc-msg",
    name: "WhatsApp & email",
    icon: MessageCircle,
    state: "operational",
    uptime: "99.70%",
    latency: "320 ms",
  },
];

export const HELP_SERVICE_STATE = {
  operational: {
    label: "Operational",
    dot: "bg-success",
    chip: "border-success/30 bg-success/15 text-success",
  },
  degraded: {
    label: "Slower than usual",
    dot: "bg-warning",
    chip: "border-warning/30 bg-warning/15 text-warning",
  },
  outage: {
    label: "Outage",
    dot: "bg-destructive",
    chip: "border-destructive/30 bg-destructive/15 text-destructive",
  },
};

export const HELP_INCIDENTS = [
  {
    id: "inc-1",
    when: "18 Sep 2026 · 09:40 IST",
    title: "Bulk health card export running slow",
    impact: "Reports & PDF export",
    state: "monitoring",
    duration: "1h 12m",
    updates: 3,
  },
  {
    id: "inc-2",
    when: "11 Sep 2026 · 16:05 IST",
    title: "WhatsApp delivery delayed for 38 minutes",
    impact: "Notifications",
    state: "resolved",
    duration: "38m",
    updates: 2,
  },
  {
    id: "inc-3",
    when: "02 Sep 2026 · 11:20 IST",
    title: "Login latency spike during morning assembly",
    impact: "Web app",
    state: "resolved",
    duration: "22m",
    updates: 4,
  },
];

export const HELP_STATS = [
  {
    id: "stat-response",
    label: "First reply",
    value: "12 min",
    meta: "median, last 30 days",
    icon: Zap,
    tone: "primary",
  },
  {
    id: "stat-resolution",
    label: "Time to fix",
    value: "6.4 h",
    meta: "median, last 30 days",
    icon: Timer,
    tone: "brand",
  },
  {
    id: "stat-csat",
    label: "Rated helpful",
    value: "96%",
    meta: "from 1,204 answers",
    icon: ThumbsUp,
    tone: "good",
  },
  {
    id: "stat-tickets",
    label: "Tickets this month",
    value: "18",
    meta: "3 still open",
    icon: LifeBuoy,
    tone: "neutral",
  },
];

/* -------------------------------------------------------------------------- */
/* How to reach a human                                                      */
/* -------------------------------------------------------------------------- */

const DESK_ADDRESS =
  "6/PC2-1, Sri Sudharsanam Hospital, TNHB Road, Avadi Municipal Corporation Office, Avadi, Chennai, Tiruvallur, Tamil Nadu 600054";

export const HELP_CHANNELS = [
  // {
  //   id: "chan-chat",
  //   label: "In-app chat",
  //   detail: "Fastest route — the agent can see your page and role",
  //   availability: "Mon–Sat · 09:00–20:00 IST",
  //   response: "first reply in about 12 min",
  //   icon: MessageCircle,
  //   tone: "primary",
  // },
  {
    id: "chan-chat",
    label: "Visit our Website for Support",
    detail: "www.sms24hrs.org",
    // detail: "Fastest route — get support directly from our website",
    availability: "Mon–Sat · 09:00–20:00 IST",
    icon: MessageCircle,
    tone: "primary",
    /* "www." on screen, https:// in the href — a bare www. link is a relative
       path, which would 404 back into the app. */
    href: "https://www.sms24hrs.org",
  },
  {
    id: "chan-phone",
    label: "Support line",
    detail: "+91 90000 48210",
    availability: "Mon–Sat · 09:00–18:00 IST",
    response: "answered in about 3 min",
    icon: PhoneCall,
    tone: "brand",
    /* An explicit href, never inferred: a dialled number has to be one the
       desk published, not one guessed out of the surrounding text. */
    href: "tel:+919000048210",
  },
  // {
  //   id: "chan-whatsapp",
  //   label: "WhatsApp",
  //   detail: "+91 90000 48211",
  //   availability: "Mon–Sat · 09:00–18:00 IST",
  //   response: "first reply in about 45 min",
  //   icon: Send,
  //   tone: "good",
  // },
  {
    id: "chan-email",
    label: "Email",
    detail: "support@sms24hrs.org",
    availability: "Any time, answered next working day",
    response: "first reply in about 6 h",
    icon: Mail,
    tone: "primary",
    href: "mailto:support@sms24hrs.org",
  },
  {
    id: "chan-remote",
    label: "Reach us",
    detail: DESK_ADDRESS,
    availability: "Mon–Fri · 11:00–17:00 IST",
    response: "booked within 1 business day",
    icon: Video,
    tone: "brand",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      DESK_ADDRESS,
    )}`,
  },
];

export const HELP_HOURS = [
  {
    id: "hours-wd",
    days: "Monday – Friday",
    time: "09:00 – 18:00",
    note: "Full support: chat, phone and email",
  },
  {
    id: "hours-sat",
    days: "Saturday",
    time: "09:00 – 14:00",
    note: "Chat and email only",
  },
  {
    id: "hours-sun",
    days: "Sunday & public holidays",
    time: "Closed",
    note: "P1 tickets are still triaged",
  },
  {
    id: "hours-camp",
    days: "On a screening day",
    time: "24 × 7",
    note: "School health officer on call",
  },
];

export const HELP_TIMEZONE = "All timings are IST (UTC+5:30).";

export const HELP_ESCALATION = [
  {
    id: "tier-1",
    tier: "Tier 1 — Support desk",
    who: "Front-line agents",
    respond: "within 2 business hours",
    scope: "How-to questions, data entry corrections, resends",
  },
  {
    id: "tier-2",
    tier: "Tier 2 — Engineering",
    who: "Screening and report engineers",
    respond: "within 1 business day",
    scope: "Export failures, sync gaps, permission bugs",
  },
  {
    id: "tier-3",
    tier: "Tier 3 — On-call engineer",
    who: "Duty engineer",
    respond: "P1 within 30 minutes",
    scope: "Platform down, or screening blocked on camp day",
  },
];

export const HELP_AGENTS = [
  { name: "Priya N", role: "Support engineer", initials: "PN" },
  { name: "Arun K", role: "Support engineer", initials: "AK" },
  { name: "Meera S", role: "Customer success", initials: "MS" },
];

export const HELP_SUGGESTED_SEARCHES = [
  "offline sync",
  "duplicate students",
  "export health card",
  "who can see reports",
  "immunisation overdue",
];








