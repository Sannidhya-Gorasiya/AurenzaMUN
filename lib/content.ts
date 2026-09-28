/**
 * AurenzaMUN — single source of truth for all site copy.
 * Extracted from info.md. Plain data only (no JSX) so it can be
 * imported by both Server and Client Components.
 */

export type Accent = "blue" | "gold" | "ice";

export const site = {
  wordmark: "AURENZAMUN",
  copyright: "© 2026 AurenzaMUN · SVIS Kandivali",
} as const;

export const nav = [
  { label: "COUNTDOWN", href: "#countdown" },
  { label: "COMMITTEES", href: "#committees" },
  { label: "REGISTER", href: "#register" },
  { label: "TEAM", href: "#crew" },
  { label: "RESOURCES", href: "#resources" },
  { label: "CONTACT US", href: "#social" },
] as const;

export const hero = {
  badges: ["10 & 11 OCTOBER 2026", "SVIS KANDIVALI, MUMBAI"],
  venueMapUrl:
    "https://www.google.com/maps/place/Swami+Vivekanand+International+School,+Kandivali,+MG+Cross+Road+No.+1,+Kandivali,+Gokul+Nagari,+Kandivali+West,+Mumbai,+Maharashtra+400067/@19.2096745,72.8446805,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7b6d769be7cbb:0xe6a9f85dba3a9881!8m2!3d19.2096745!4d72.8472554!16s%2Fg%2F11bw417cc_?entry=ttu&g_ep=EgoyMDI2MDgxNi4wIKXMDSoASAFQAw%3D%3D",
  headline: ["AURENZA", "MUN"] as [string, string],
  subheadline:
    "A premier Model United Nations conference bringing together student diplomats from across Mumbai to debate, collaborate, and resolve the world's toughest challenges.",
  lede: "Two days of debate, diplomacy and resolution for student delegates from across Mumbai.",
  ctaPrimary: "REGISTER NOW",
  ctaSecondary: "EXPLORE COMMITTEES",
  stats: [
    { value: 13, label: "COMMITTEES" },
    { value: 2, label: "DAYS OF DEBATE" },
    { value: 400, label: "DELEGATES", suffix: "+" },
  ],
  floatingCards: [
    { label: "DATE", value: "Oct 10 to 11, 2026" },
    { label: "VENUE", value: "SVIS Kandivali, Mumbai" },
  ],
  marquee: [
    "13 COMMITTEES",
    "2 DAYS OF DEBATE",
    "SVIS KANDIVALI",
    "MODEL UNITED NATIONS",
    "MUMBAI 2026",
  ],
} as const;

export type Committee = {
  abbr: string;
  name: string;
  /** Omit until the secretariat confirms it; the card then drops its
      "Click for agendas" chip and the dialog says so in as many words. */
  agenda?: string;
  description: string;
  /** Named in the dialog's overview tab. Omit until the chair is confirmed —
      the row hides itself rather than print an empty label. */
  chair?: string;
  /** Rendered as the two-column "KEY FOCUS AREAS" list. */
  focus: string[];
  /** Heading for the second tab — "NATIONS", "CHARACTERS", "PORTFOLIOS"... */
  portfolioLabel?: string;
  /** Omit (or leave empty) and the second tab is hidden entirely. */
  portfolios?: string[];
};

export type Track = {
  id: "school" | "college" | "ip";
  tab: string;
  accent: Accent;
  committees: Committee[];
  emptyState?: string;
};

/**
 * The agendas and the portfolio matrices below are the confirmed ones, copied
 * from the secretariat's school and college matrix sheets. The descriptions and
 * focus areas are still DRAFT COPY written as a starting point.
 * Delete `portfolios` on any committee whose matrix is not public yet — the
 * second tab hides itself when the list is missing, which is what the
 * International Press does.
 */
export const committees = {
  eyebrow: "13 COMMITTEES · 3 TRACKS",
  heading: ["CHOOSE YOUR", "COMMITTEE"] as [string, string],
  description:
    "Agendas are live. Select a track to explore the committees available for delegation.",
  note: "Tap any committee for its agenda, focus areas and portfolio matrix.",
  portfolioNote: "Portfolios are subject to availability at the time of registration.",
  tracks: [
    {
      id: "school",
      tab: "School Committees",
      accent: "blue",
      committees: [
        {
          abbr: "MARVEL",
          name: "Marvel Crisis Committee",
          agenda:
            "The rise of Doctor Doom and the emerging threat to global security: addressing the consolidation of power, sovereignty, weaponisation of advanced technology, and the international response to a new global threat.",
          description:
            "A fast-moving crisis committee set in the Marvel universe. Delegates take on the powers, allegiances and grudges of iconic heroes and villains while an escalating threat forces the room to negotiate under pressure.",
          chair: "Trisha Shinde",
          focus: [
            "Respond to crisis updates in real time",
            "Balance personal agendas against a common threat",
            "Negotiate alliances across hero and villain lines",
            "Weigh collateral damage against decisive action",
          ],
          portfolioLabel: "CHARACTERS",
          portfolios: [
            "Doctor Doom", "Mister Fantastic", "Invisible Woman", "The Thing",
            "Human Torch", "Captain America", "Iron Man", "Thor", "Doctor Strange",
            "Wong", "Professor X", "Wolverine", "Storm", "Black Panther", "Namor",
            "Loki", "Scarlet Witch", "Deadpool", "Nick Fury", "Bob Reynolds",
            "Spider Man", "Nebula", "Black Widow", "Winter Soldier", "Ant Man", "Wasp",
          ],
        },
        {
          abbr: "AIPPM",
          name: "All India Political Parties Meet",
          agenda:
            "Agenda A: discussion and deliberation on the constitutional validity of anti-conversion laws in India.\n\nAgenda B: discussion upon Article 19(1)(a), freedom of speech and expression, with special emphasis on press freedom in India.",
          description:
            "The All India Political Parties Meet puts leaders from across the political spectrum in one room. Delegates argue as sitting politicians, defending a party line in public while searching for a consensus the country can actually live with.",
          chair: "Atharva Devedkar",
          focus: [
            "Argue from a real party position",
            "Build cross-party consensus on contested reform",
            "Handle press scrutiny and public opinion",
            "Separate electoral posturing from policy",
          ],
          portfolioLabel: "PORTFOLIOS",
          portfolios: [
            "Amit Shah", "Nitin Gadkari", "Yogi Adityanath", "Nainar Nagendran",
            "Rahul Gandhi", "Mallikarjun Kharge", "DK Shivakumar", "Akbaruddin Owaisi",
            "Arwind Kejriwal", "Mamata Banerjee", "Narendra Modi", "Akhilesh Yadav",
            "Lalu Prasad Yadav", "Dhananjay Munde", "Shashi Tharoor", "Sharad Pawar",
            "M. K. Stalin", "Uddhav Thackeray", "Eknath Shinde", "Devendra Fadnavis",
            "Sonia Gandhi", "Pawan Kalyan", "Revanth Reddy", "N. Biran Singh",
            "Anurag Singh Thakur", "Godam Nagesh", "Pappu Yadav (Rajesh Ranjan)",
            "Hemant Soren", "Tejashwi Yadav", "Rajeev Rai", "Dr. Vivek Joshi",
            "N. R. Madhava Menon", "Pawan Kumar Sharma", "Sanjay Kumar",
            "Bhanu Prakash Yeturu", "Vivek Yadav", "Sanjay Goel",
            "Sandip Janardanpat Sagale", "Sanjeev Kumar Jha", "Dr. Sukhbir Singh Sandhu",
            "Shri Gyanesh Kumar",
          ],
        },
        {
          abbr: "UNSC",
          name: "United Nations Security Council",
          agenda:
            "The crisis in Haiti: restoring security, political stability and state authority amidst gang violence, humanitarian crisis and foreign intervention.",
          description:
            "The Security Council carries primary responsibility for international peace and security. Fifteen members debate under the shadow of the veto, where a single vote decides whether the Council acts at all.",
          chair: "Sarthak Sabde",
          focus: [
            "Draft resolutions that can survive the veto",
            "Balance sovereignty against intervention",
            "Authorise peacekeeping and sanctions regimes",
            "Respond to crisis updates from the field",
          ],
          portfolioLabel: "NATIONS",
          portfolios: [
            "Iraq", "Israel", "India", "Pakistan", "Ukraine", "Nigeria", "Russia", "USA",
            "China", "France", "Afghanistan", "Iran", "Palestine", "UK", "Germany",
            "Jordan", "Saudi Arabia", "Somalia", "Kenya", "Morocco", "Philippines",
            "Indonesia", "Malaysia", "Bangladesh", "Australia", "Canada", "Sweden",
            "Norway", "Italy", "Syria", "Turkey", "United Arab Emirates", "Lebanon",
            "Qatar",
          ],
        },
        {
          abbr: "WHO",
          name: "World Health Organization",
          agenda:
            "Global biosecurity: balancing high-risk pathogen research with the prevention of biological threats.",
          description:
            "The World Health Organization convenes member states on global health. Delegates negotiate the financing, equity and emergency machinery that decide how the world responds when the next outbreak crosses a border.",
          chair: "Shaurya Gupta",
          focus: [
            "Strengthen pandemic preparedness and response",
            "Close the gap in vaccine and medicine access",
            "Fund health systems in developing states",
            "Balance sovereignty with global reporting duties",
          ],
          portfolioLabel: "NATIONS",
          portfolios: [
            "USA", "UK", "China", "Russia", "France", "Germany", "India", "Japan",
            "South Korea", "Canada", "Australia", "Singapore", "Netherlands",
            "Switzerland", "Sweden", "Italy", "Spain", "Belgium", "Israel", "Iran",
            "Iraq", "Brazil", "South Africa", "United Arab Emirates", "Thailand",
            "Vietnam", "Pakistan", "Norway", "Argentina", "Denmark", "Portugal",
            "Greece", "Uzbekistan",
          ],
        },
        {
          abbr: "NEETI AAYOG",
          name: "National Institution for Transforming India",
          agenda:
            "Transforming Indian agriculture: addressing farmer welfare, technology, climate resilience, rural development, food security and economic growth.",
          description:
            "NITI Aayog is the policy think tank of the Union government. Its Governing Council seats the Prime Minister, Union ministers and every Chief Minister, making it the room where national targets meet state realities.",
          chair: "Dibyaranjan Swain",
          focus: [
            "Reconcile centre and state fiscal priorities",
            "Design measurable development targets",
            "Weigh growth against sustainability",
            "Translate policy into implementable schemes",
          ],
          portfolioLabel: "PORTFOLIOS",
          portfolios: [
            "Narendra Modi", "Amit Shah", "Nirmala Sitharaman", "Shivraj Singh Chouhan",
            "Piyush Goyal", "Ashwini Vaishnav", "Bhupendra Yadav", "Jitan Ram Manjhi",
            "Devendra Fadnavis", "Yogi Adityanath", "M.K. Stalin", "Revanth Reddy",
            "Mamata Banerjee", "Himanta Biswa Sarma", "Sanjay Seth",
            "N. R. Narayan Murthy", "Radhika Gupta", "Tukaram Mundhe", "Rahul Gandhi",
            "Sonia Gandhi", "Rajnath Singh", "Nitin Gadkari", "H. D. Kumaraswamy",
            "Sharad Pawar", "Pawan Kalyan", "Shashi Tharoor", "Raghav Chadha",
            "Omar Abdullah", "Prof. Ramesh Chand", "Dr. Ashok Gulati", "Gunwant Patil",
            "Dr. Himanshu Pathak", "Subhash Palekar", "Dr. N. K. Singh", "P. Sainath",
          ],
        },
        {
          abbr: "MAHABHARATA",
          name: "A committee set on Mahabharata.",
          agenda:
            "The Kurukshetra war: preventing, reshaping or waging the Great War: political alliances, succession, diplomacy and the fate of Hastinapura.",
          description:
            "Set in the Sabha of Hastinapura on the edge of the Kurukshetra war. Delegates embody the characters of the epic and argue dharma against ambition, kinship against justice, with the fate of a kingdom on the table.",
          chair: "Kaushal Barge",
          focus: [
            "Embody a character and its contradictions",
            "Weigh kinship against justice",
            "Negotiate the terms of war and peace",
            "Defend a claim to the throne of Hastinapura",
          ],
          portfolioLabel: "CHARACTERS",
          portfolios: [
            "Yudhishthira", "Bhima", "Arjuna", "Nakula", "Sahadeva", "Krishna",
            "Draupadi", "Subhadra", "Abhimanyu", "Dhrishtadyumna", "Shikhandi",
            "Satyaki", "Virata", "Uttara", "Drupada", "Duryodhana", "Dushasana",
            "Shakuni", "Karna", "Bhishma", "Dronacharya", "Kripacharya", "Ashwatthama",
            "Vidura", "Dhritarashtra", "Gandhari", "Sanjaya", "Jayadratha", "Shalya",
            "Kritavarma", "Balarama", "Rukmi", "Bhagadatta", "Shishupala", "Ekalavya",
            "Kunti", "Ghatotkacha", "Yuyutsu", "Somadatta", "Bahlika",
          ],
        },
      ],
    },
    {
      id: "college",
      tab: "College Committees",
      accent: "gold",
      committees: [
        {
          abbr: "LOK SABHA",
          name: "House of the People",
          agenda:
            "Examining constitutional rights, democratic representation, education and employment of India’s young population.",
          description:
            "The House of the People, where the government of the day must defend its bills on the floor. Delegates sit as Members of Parliament and use motions, questions and division of the House to make or break legislation.",
          chair: "Maaz Momin",
          focus: [
            "Master parliamentary rules of procedure",
            "Defend or dismantle a bill clause by clause",
            "Use questions, motions and adjournments",
            "Represent a constituency, not just a party",
          ],
          portfolioLabel: "PORTFOLIOS",
          portfolios: [
            "Narendra Modi", "Dharmendra Pradhan", "Mansukh Mandaviya",
            "Ashwini Vaishnaw", "Arjun Ram Meghwal", "Amit Shah", "Nirmala Sitharaman",
            "Jitendra Singh", "Annapurna Devi", "Virendra Kumar", "Manohar Lal",
            "Jyotiraditya Scindia", "Kiren Rijiju", "Piyush Goyal",
            "Prof. Pradeep Kumar Joshi", "J. P. Nadda", "Sukanta Majumdar",
            "Rahul Gandhi", "Jayant Chaudhary", "Mallikarjun Kharge",
            "Priyanka Gandhi Vadra", "Shashi Tharoor", "K. C. Venugopal", "Sharad Pawar",
            "Uddhav Thackeray", "Sanjay Raut", "M. K. Stalin", "Omar Abdullah",
            "Arvind Kejriwal", "Bhagwat Mann", "Pinarayi Vijayan", "Prahlad Joshi",
          ],
        },
        {
          abbr: "RAJYA SABHA",
          name: "Council of States",
          agenda:
            "Deliberation on the need for comprehensive reform of the anti-defection law, to strike a balance between party discipline, political stability and the constitutional freedoms of elected representatives.",
          description:
            "The Council of States reviews what the Lok Sabha passes and speaks for the states within the Union. Debate here is slower and more technical, and it is often where a bill is actually reshaped.",
          chair: "Aditya Tripathi",
          focus: [
            "Scrutinise legislation clause by clause",
            "Represent state interests in the Union",
            "Use the rulings of the Chair and points of order",
            "Build cross-party support for amendments",
          ],
          portfolioLabel: "PORTFOLIOS",
          portfolios: [
            "Narendra Modi", "Amit Shah", "Rahul Gandhi", "Sonia Gandhi",
            "Mamata Banerjee", "Nirmala Sitharaman", "Piyush Goyal", "Shashi Tharoor",
            "Sharad Pawar", "Kapil Sibal", "Priyanka Gandhi Vadra", "Akhilesh Yadav",
            "Abhishek Banerjee", "Tejashwi Yadav", "Uddhav Thackeray", "Eknath Shinde",
            "Raj Thackeray", "Devendra Fadnavis", "Kris Gopalakrishnan",
            "Mallikarjun Kharge", "Raghav Chadha", "Supriya Sule", "Nandan Nilekani",
            "Arjun Ram Meghwal", "Arwind Kejriwal", "M. K. Stalin", "Omar Abdullah",
            "Nitish Kumar", "Jitan Ram Manjhi", "Asauddin Owaisi", "P. Chidambaram",
            "Yogi Adityanath", "Sachin Pilot",
          ],
        },
        {
          abbr: "BRICS SUMMIT",
          name: "BRICS Summit",
          agenda:
            "To examine the evolving role of BRICS in challenging dollar dominance, and its implications for global financial power, international trade and the future of the international financial system.",
          description:
            "A summit of major emerging economies coordinating on trade, finance and a multipolar order. Heads of delegation negotiate outside the established financial architecture, with currencies, development banks and energy on one table.",
          chair: "Dhruv Thakkar",
          focus: [
            "Coordinate trade and currency settlement",
            "Fund development without external conditionality",
            "Balance member rivalries inside the bloc",
            "Position the bloc against G7 policy",
          ],
          portfolioLabel: "NATIONS",
          portfolios: [
            "Brazil", "Russia", "India", "China", "South Africa", "Iran", "Israel",
            "USA", "Palestine", "Yemen", "Iraq", "Lebanon", "Syria", "Qatar", "Oman",
            "Jordan", "Egypt", "Pakistan", "Indonesia", "Bangladesh", "Malaysia",
            "Ethiopia", "UK", "France", "Germany", "Italy", "Spain", "Canada",
            "Australia", "Japan", "South Korea", "Kuwait", "Netherlands", "Greece",
            "Uzbekistan", "Nigeria", "Kenya",
          ],
        },
        {
          abbr: "INDIAN WAR CABINET",
          name: "Indian War Cabinet",
          agenda:
            "Resolving the political deadlock between the Indian National Congress and the All-India Muslim League over India’s constitutional future during wartime.",
          description:
            "A closed-door crisis cabinet convened as a national security emergency unfolds. Delegates hold political, military and intelligence portfolios, and every directive they pass has consequences the next update reports back.",
          chair: "Rudra Joshi",
          focus: [
            "Issue directives on incomplete intelligence",
            "Balance military options against diplomatic cost",
            "Manage escalation and the nuclear threshold",
            "Control the public and press narrative",
          ],
          portfolioLabel: "PORTFOLIOS",
          portfolios: [
            "Lord Linlithgow", "Winston Churchill", "Jawaharlal Nehru", "Mahatma Gandhi",
            "Maulana Abdul Kalam Azad", "Sardar Vallabhbhai Patel", "C. Rajagopalachari",
            "Dr. Rajendra Prasad", "Govind Ballabh Pant", "Khan Abdul Ghaffar Khan",
            "Asaf Ali", "Muhammad Ali Jinnah", "Sardar Abdur Rab Nishtar",
            "Subhash Chandra Bose", "Sir R. F. Mudie", "Sir Muhammad Zafarullah",
            "Nawab of Bahawalpur", "Maharaja of Mysore", "Maharaja of Baroda",
            "Sir Malik Feroz Khan Noon", "Sir Muhammad Zafarullah Khan",
          ],
        },
        {
          abbr: "UNHRC",
          name: "United Nations Human Rights Council",
          agenda:
            "Ensuring accountability for human rights violations during the suppression of protests, and protecting fundamental freedoms.",
          description:
            "The Human Rights Council investigates and reports on violations wherever they occur. Delegates negotiate resolutions that name states, mandate rapporteurs and test how far sovereignty shields a government from scrutiny.",
          chair: "Sarthak Sinha",
          focus: [
            "Investigate violations without politicising the mandate",
            "Balance sovereignty against accountability",
            "Protect civil society and human rights defenders",
            "Mandate special rapporteurs and inquiries",
          ],
          portfolioLabel: "NATIONS",
          portfolios: [
            "Iran", "Myanmar", "Venezuela", "Bangladesh", "Kenya", "Turkey", "China",
            "Russia", "Egypt", "Sudan", "Ethiopia", "Nigeria", "Rwanda", "DR Congo",
            "Morocco", "South Africa", "India", "Pakistan", "Nepal", "Sri Lanka",
            "Indonesia", "Thailand", "Philippines", "Afghanistan", "Iraq", "Israel",
            "USA", "UK", "France", "Germany", "Ukraine", "Armenia", "Mexico", "Colombia",
            "Peru", "Argentina", "Brazil",
          ],
        },
        {
          abbr: "C.C.C",
          name: "Continuous Crisis Committee",
          agenda:
            "1975: a world where the Axis won; shaping the future of a new world order.",
          description:
            "A continuous crisis committee that never resets. Directives, updates and consequences carry forward across every session, so a decision taken in the first hour is still shaping the room on day two.",
          chair: "Jai Melwani",
          focus: [
            "React to updates as they break",
            "Write directives with clear, workable mandates",
            "Track consequences across sessions",
            "Coordinate covert and public strategy",
          ],
          portfolioLabel: "PORTFOLIOS",
          portfolios: [
            "President of the United States", "Vice President of the United States",
            "Secretary of State of the United States",
            "Secretary of Defense of the United States",
            "National Security Advisor of the United States",
            "Director of National Intelligence of the United States",
            "President of Russia", "Prime Minister of Russia",
            "Foreign Minister of Russia", "Defense Minister of Russia",
            "President of China", "Premier of China", "Foreign Minister of China",
            "Defense Minister of China", "Prime Minister of India",
            "Minister of External Affairs of India", "Defence Minister of India",
            "National Security Advisor of India", "Prime Minister of the United Kingdom",
            "Foreign Secretary of the United Kingdom", "President of France",
            "Foreign Minister of France", "Chancellor of Germany",
            "Foreign Minister of Germany", "President of Turkey",
            "Prime Minister of Japan", "Prime Minister of Australia",
            "Prime Minister of Canada", "Prime Minister of Israel", "President of Iran",
            "Crown Prince / Prime Minister of Saudi Arabia", "Secretary-General of NATO",
            "President of the European Commission",
            "Secretary-General of the United Nations", "Director-General of the WHO",
            "President of the World Bank", "Managing Director of the IMF",
          ],
        },
      ],
    },
    {
      id: "ip",
      tab: "IP Committee",
      accent: "ice",
      committees: [
        {
          abbr: "IP",
          name: "International Press · open to both school & college delegates",
          description:
            "The International Press covers every committee at the conference. Delegates work as reporters, photographers and caricaturists, filing copy on debates as they happen and holding the floor to account.",
          chair: "Shriya Rajan",
          focus: [
            "File accurate copy under deadline",
            "Interview delegates and chairs on the record",
            "Capture the conference in photograph and caricature",
            "Separate reporting from editorial opinion",
          ],
        },
      ],
    },
  ] satisfies Track[],
} as const;

export const registration = {
  eyebrow: "DELEGATE REGISTRATION",
  heading: ["JOIN THE", "DEBATE"] as [string, string],
  description:
    "Registrations for AurenzaMUN are now open. Follow the steps below to secure your seat at the conference.",
  steps: [
    {
      index: "01",
      title: "Fill the Google Form",
      body: "Complete the delegate registration form with your personal details, school/college name, and committee preferences.",
    },
    {
      index: "02",
      title: "Choose Your Committees",
      body: "Rank your top 3 committee preferences. Allotments are made based on availability and experience level.",
    },
    {
      index: "03",
      title: "Await Confirmation",
      body: "You will receive an email confirmation with your committee allotment, delegate guide, and payment details.",
    },
    {
      index: "04",
      title: "Join AurenzaMUN!",
      body: "Arrive at SVIS Kandivali on 10th October ready to debate, collaborate, and represent your nation.",
    },
  ],
  card: {
    body: "The delegate registration form is live. Fill in your details and committee preferences, and the secretariat will follow up with your allotment.",
    button: "Open the Google Form",
    /** Live Google Form. The card's button opens it in a new tab. */
    href: "https://forms.gle/33XbJd9G31vzCe4J7",
    /** A school sending a whole contingent files one of these instead of a
        form per delegate, so it sits under the individual form rather than
        beside it. */
    delegation: {
      note: "Registering a full delegation from your school or college?",
      button: "Delegation Form",
      href: "https://forms.gle/AJZYRNoBjeMimcPY8",
    },
  },
  details: [
    { label: "Deadline", value: "Late September 2026" },
    { label: "Eligibility", value: "Open to school & college students" },
    { label: "Location", value: "SVIS Kandivali, Mumbai" },
  ],
} as const;

export type TeamMember = {
  name: string;
  /** Uppercase department line, shown on the panel's pill. */
  role: string;
  /** Square portrait under `public/team/`, cropped with the nose dead
      centre. Omit and the panel falls back to initials. */
  photo?: string;
};

export type TeamGroup = {
  /** Sub-heading above the group's grid — "GENERALS", "HEADS"... */
  label: string;
  members: TeamMember[];
  /**
   * Reserve a fixed grid instead of sizing it to `members`. Every slot past
   * the last name renders as a dashed placeholder, which lets a tier that is
   * still being announced hold its space so the section does not reflow under
   * the reader each time a name lands. Omit for a tier that is fully known.
   */
  panelRows?: number;
};

export const secretariat = {
  eyebrow: "LEADERSHIP",
  heading: ["MEET THE", "TEAM"] as [string, string],
  description:
    "AurenzaMUN is guided by a dedicated team committed to delivering an exceptional conference experience.",
  /* The roster renders as one labelled grid per tier, top down. Adding a name
     is a matter of appending it to the right group's `members`. */
  groups: [
    {
      label: "GENERALS",
      members: [
        { name: "Ruqaiyah Bharmal", role: "SECRETARY GENERAL", photo: "/team/ruqaiyah-bharmal.webp" },
        { name: "Arnav Bohra", role: "DIRECTOR GENERAL", photo: "/team/arnav-bohra.webp" },
      ],
    },
    {
      label: "HEADS",
      /* Department heads, in announcement order. */
      members: [
        { name: "Sannidhya Gorasiya", role: "HEAD OF TECHNICALS & DEVELOPMENT", photo: "/team/sannidhya-gorasiya.webp" },
        { name: "Agastya Maurya", role: "HEAD OF MARKETING & SPONSORS", photo: "/team/agastya-maurya.webp" },
        { name: "Bhoomi Bharadiya", role: "HEAD OF CREATIVE & FINE ARTS", photo: "/team/bhoomi-bharadiya.webp" },
        { name: "Neev Mehta", role: "HEAD OF PHOTOGRAPHY", photo: "/team/neev-mehta.webp" },
        { name: "Ariana Chauhan", role: "HEAD OF HOSPITALITY", photo: "/team/ariana-chauhan.webp" },
        { name: "Aarav Jain", role: "HEAD OF SECURITY", photo: "/team/aarav-jain.webp" },
        { name: "Diya Joshi", role: "HEAD OF BRANDING & SUPPLIES", photo: "/team/diya-joshi.webp" },
        { name: "Daveena Hada", role: "HEAD OF DIGITAL MEDIA", photo: "/team/daveena-hada.webp" },
        { name: "Zeal Joshi", role: "HEAD OF GRAPHICAL DEVELOPMENT", photo: "/team/zeal-joshi.webp" },
        { name: "Atharva Devedkar", role: "HEAD OF DELEGATE AFFAIRS", photo: "/team/atharva-devedkar.webp" },
      ],
    },
    {
      label: "SUB-HEADS",
      /* Grouped by department, alphabetically, and alphabetically by name
         within a department — so the two who share one land side by side and
         each line names the department its head carries above, letting the
         pair read together. At three across the creative pair opens a row
         and the hospitality and marketing pairs each land within one.
         No `panelRows`: the tier is announced, so the grid ends at the last
         name rather than reserving a slot nobody is going to fill. */
      members: [
        { name: "Mahi Salla", role: "SUB-HEAD OF CREATIVE & FINE ARTS", photo: "/team/mahi-salla.webp" },
        { name: "Risha Mehta", role: "SUB-HEAD OF CREATIVE & FINE ARTS", photo: "/team/risha-mehta.webp" },
        { name: "Shreya Sheth", role: "SUB-HEAD OF DIGITAL MEDIA", photo: "/team/shreya-sheth.webp" },
        { name: "Tiksha Pant", role: "SUB-HEAD OF GRAPHICAL DEVELOPMENT", photo: "/team/tiksha-pant.webp" },
        { name: "Kiara Parmar", role: "SUB-HEAD OF HOSPITALITY", photo: "/team/kiara-parmar.webp" },
        { name: "Saanvi Bhambid", role: "SUB-HEAD OF HOSPITALITY", photo: "/team/saanvi-bhambid.webp" },
        { name: "Hajel Rathod", role: "SUB-HEAD OF MARKETING & SPONSORS", photo: "/team/hazel-rathod.webp" },
        { name: "Sai Nanivadekar", role: "SUB-HEAD OF MARKETING & SPONSORS", photo: "/team/sai-nanivadekar.webp" },
        { name: "Mohit Fatnani", role: "SUB-HEAD OF PHOTOGRAPHY", photo: "/team/mohit-fatnani.webp" },
        { name: "Diyaan Doshi", role: "SUB-HEAD OF SECURITY", photo: "/team/diyaan-doshi.webp" },
      ],
    },
  ] as TeamGroup[],
  panelsPerRow: 3,
} as const;

export const resources = {
  eyebrow: "DELEGATE RESOURCES",
  heading: ["PREP FOR", "CONFERENCE"] as [string, string],
  description:
    "All resources, study guides, and official documents will be uploaded here before the conference. Bookmark this page and check back regularly for updates.",
  statusBadge: "Resources uploading before October 2026",
  cards: [
    {
      title: "Delegate Study Guide",
      tag: "ALL DELEGATES",
      description:
        "Comprehensive guide covering research methodology, position paper writing, and committee preparation strategies for all tracks.",
      state: "Coming Soon",
    },
    {
      title: "Rules of Procedure",
      tag: "REQUIRED READING",
      description:
        "The official AurenzaMUN Rules of Procedure document governing all committee sessions, motions, and voting procedures.",
      state: "Coming Soon",
    },
    {
      title: "IP Press Guidelines",
      tag: "IP COMMITTEE",
      description:
        "Specific guidelines for International Press delegates covering article formats, reporting standards, and press conference etiquette.",
      state: "Coming Soon",
    },
  ],
  closing: "Resources will be made available ahead of the conference. Stay tuned for updates.",
} as const;

export const social = {
  eyebrow: "STAY CONNECTED",
  heading: ["FOLLOW", "AURENZAMUN"] as [string, string],
  description:
    "Follow along for committee announcements, delegate spotlights, and behind-the-scenes updates as we build toward October 2026.",
  platforms: [
    {
      name: "Instagram",
      handle: "@AurenzaMUN",
      href: "https://www.instagram.com/aurenza_mun",
      cta: "Follow on Instagram",
      external: true,
    },
    {
      name: "Mail Us",
      handle: "aurenzamun26@gmail.com",
      href: "mailto:aurenzamun26@gmail.com",
      cta: "Email us directly",
      external: false,
    },
  ],
} as const;
