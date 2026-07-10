import type { LearningFocus } from '../../src/types';

export interface RawSuggestion {
  title: string;
  url: string;
}

/**
 * Per-focus "search results" for Fetch Suggestions — 10 per focus, standing
 * in for a real Hacker News/DEV.to/Medium/newsletter-API call. Each item is
 * intentionally only a title + url — `source` is derived from the url's
 * site host by parseArticleInput, same as a real fetch would hand raw
 * results to the content parser.
 *
 * Sourced from https://github.com/Infrasity-Labs/awesome-tech-newsletter
 * (a community-curated newsletter directory) — every url below is a real
 * newsletter homepage from that list, not a fabricated article link. The
 * title is "{newsletter name} — {its own tagline}", not an invented
 * headline, so nothing here claims a specific article exists that doesn't.
 *
 * That source repo has no dedicated Accessibility, Backend/System-Design, or
 * catch-all "Others" section, so those three focuses use the closest
 * available newsletters (design systems/human-centered engineering;
 * databases/APIs/distributed systems; general-interest engineering,
 * respectively) rather than a topic-exact match — everything else
 * (react-performance, frontend-system-design, typescript, ai-coding-agents)
 * pulls from that repo's matching or closely-adjacent section.
 */
export const SUGGESTION_SOURCES: Record<LearningFocus, RawSuggestion[]> = {
  'react-performance': [
    {
      title: 'Reactdevelopment — Advanced React, TypeScript patterns & performance deep dives',
      url: 'https://reactdevelopment.substack.com',
    },
    {
      title: "Addyo — Addy Osmani's newsletter on elevating your effectiveness",
      url: 'https://addyo.substack.com',
    },
    {
      title: 'Leerob — Things in tech and web development',
      url: 'https://leerob.substack.com',
    },
    {
      title: 'Frontend Weekly — hand-picked front-end development articles',
      url: 'https://medium.com/front-end-weekly',
    },
    {
      title: 'Frontend and beyond — web development done right',
      url: 'https://medium.com/frontend-and-beyond',
    },
    {
      title: 'UpWeb — stay ahead in web development, latest insights every Wednesday',
      url: 'https://webdeveloper.beehiiv.com',
    },
    {
      title: 'Jsdevspace — in-depth JavaScript programming articles and tutorials',
      url: 'https://jsdevspace.substack.com',
    },
    {
      title: 'Front End Web Development Feeds and Newsletters',
      url: 'https://leftalign.substack.com',
    },
    {
      title: 'Hibiki HTML — weekly roundup of open-source software for front-end engineers',
      url: 'https://console.substack.com',
    },
    {
      title: 'Jarrod Overson — JavaScript, Rust, WebAssembly, Security',
      url: 'https://jsoverson.medium.com',
    },
  ],
  'frontend-system-design': [
    {
      title: 'High Scalability — architectures of successful, highly scalable websites',
      url: 'https://highscalability.com/',
    },
    {
      title: 'ByteByteGo — complex systems explained in simple terms',
      url: 'https://blog.bytebytego.com/',
    },
    {
      title: 'ByteByteGo System Design Alliance — explain complex systems with simple terms',
      url: 'https://medium.com/bytebytego-system-design-alliance',
    },
    {
      title: 'Musings on computer systems — testing, performance, engineering architecture',
      url: 'https://buttondown.email/nelhage',
    },
    {
      title: 'Ripples in Middleware — system design, SOA, REST, microservices, scalability',
      url: 'https://medium.com/systems-architectures',
    },
    {
      title: 'Software Architecture Is About Things Hard to Change — mental models, primitives, trade-offs',
      url: 'https://tomasjurasek.substack.com',
    },
    {
      title: 'Software Architecture and Philosophical Anthropology — on humans and agents',
      url: 'https://michaelmangialardi.substack.com',
    },
    {
      title: 'Kousik Nath — distributed systems, computing concepts, real-life systems designing',
      url: 'https://kousiknath.medium.com',
    },
    {
      title: 'Vedcraft — sharing practical knowledge, from Sanskrit "Ved" (knowledge) as "Craft"',
      url: 'https://medium.com/vedcraft',
    },
    {
      title: 'Pointer — a reading club for developers on engineering leadership and best practices',
      url: 'https://www.pointer.io/',
    },
  ],
  typescript: [
    {
      title: 'FOSS Weekly — the easiest way to keep up with free & open-source software',
      url: 'https://fossweekly.beehiiv.com',
    },
    {
      title: 'Trusted Value — open to learning and working with any web technology',
      url: 'https://helitharupasinghe.hashnode.dev',
    },
    {
      title: "Jacob's Tech Tavern — advanced concurrency and language performance, 10 minutes a week",
      url: 'https://jacobbartlett.substack.com',
    },
    {
      title: 'Rust Trends — a weekly newsletter covering the Rust ecosystem and community',
      url: 'https://rusttrends.com/',
    },
    {
      title: 'Golang Weekly — a weekly newsletter about the Go programming language',
      url: 'https://golangweekly.com/',
    },
    {
      title: 'Python Weekly — hand-curated news, articles, and new releases, every week',
      url: 'https://pythonweekly.com/',
    },
    {
      title: 'Thepythoncodingstack — the articles I wish I had when I was learning to code',
      url: 'https://thepythoncodingstack.substack.com',
    },
    {
      title: 'Tom Smykowski — Staff Engineer, Product, UX, Full-Stack',
      url: 'https://tomaszs2.medium.com',
    },
    {
      title: 'PythonIQ — practical, thought-provoking, insightful articles on programming in Python',
      url: 'https://medium.com/pythoniq',
    },
    {
      title: 'Elton Minetto — Principal Software Engineer, Google Developer Expert in Go',
      url: 'https://medium.com/@eminetto',
    },
  ],
  'ai-coding-agents': [
    {
      title: 'Agentic Coding with Discipline and Skill — production-ready agentic coding practice',
      url: 'https://agenticcoding.substack.com',
    },
    {
      title: 'Agents, harnessed — coding agent harnesses and harness engineering',
      url: 'https://codagent.beehiiv.com',
    },
    {
      title: 'HN AI Newsletter — weekly AI-curated digest of top AI stories from Hacker News',
      url: 'https://hn-ai-newsletter.beehiiv.com',
    },
    {
      title: 'Theagentstack — how modern AI agents work under the hood: control loops, memory, orchestration',
      url: 'https://theagentstack.substack.com',
    },
    {
      title: 'Software That Builds Itself — how AI agents reason, plan, remember, and act',
      url: 'https://jdsemrau.substack.com',
    },
    {
      title: 'In multi-agent systems, the skill is the abstraction level — not the agent count',
      url: 'https://hariph.hashnode.dev',
    },
    {
      title: 'I built an eval harness for my own AI, and it caught my digital twin lying',
      url: 'https://akashpersetti.hashnode.dev',
    },
    {
      title: "We let AI write the code. We just don't let it check its own work.",
      url: 'https://lingchong.substack.com',
    },
    {
      title: 'How to AI — artificial intelligence and product strategy for builders and founders',
      url: 'https://ruben.substack.com',
    },
    {
      title: 'Guide to AI — artificial intelligence, startups, and policy for tech professionals',
      url: 'https://nathanbenaich.substack.com',
    },
  ],
  accessibility: [
    {
      title: 'Design Systems Collective — scalable, consistent design for designers and developers',
      url: 'https://medium.com/design-systems-collective',
    },
    {
      title: 'The Personable Engineer — designing systems, processes, culture, and tools that are human friendly',
      url: 'https://fernandovillalba.substack.com',
    },
    {
      title: 'Figma-to-code: the real shift happening',
      url: 'https://christinevallaure.substack.com',
    },
    {
      title: 'Front-End versus Back-End — software design is an exercise in human relationships',
      url: 'https://tidyfirst.substack.com',
    },
    {
      title: "Hiding the Button Isn't Authorization: Why You Must Gate the Request",
      url: 'https://emeka-nwosa.hashnode.dev',
    },
    {
      title: 'Computer Things — Formal Methods, Software History and Culture',
      url: 'https://buttondown.email/hillelwayne',
    },
    {
      title: 'The Documentation System Every Startup Should Have',
      url: 'https://virginiamwegahashnodedev.hashnode.dev',
    },
    {
      title: 'On Coding — thoughts about writing code',
      url: 'https://medium.com/on-coding',
    },
    {
      title: 'Software Craft as Plumbing and Art',
      url: 'https://emptyingmyhead.substack.com',
    },
    {
      title: "The Metagame — an engineer's thoughts on human behavior, productivity, and living well",
      url: 'https://themetagame.beehiiv.com',
    },
  ],
  'backend-system-design': [
    {
      title: 'DB Weekly — a weekly round-up of database technology news and articles',
      url: 'https://dbweekly.com/',
    },
    {
      title: 'Data warehouse is the new back end — infrastructure and surfing',
      url: 'https://pchase.substack.com',
    },
    {
      title: 'not_afraid — Software Engineer passionate about Backend, PostgreSQL, infra & web security',
      url: 'https://not-afraid.medium.com',
    },
    {
      title: 'Javarevisited Newsletter — master Java and System Design interviews',
      url: 'https://javarevisited.substack.com',
    },
    {
      title: 'Levels.fyi used Google Sheets for their back end — system design and engineering fundamentals',
      url: 'https://bytesizeddesign.substack.com',
    },
    {
      title: 'API Complexity Is a Lie — curated API moves, unfiltered expert takes',
      url: 'https://apichangelog.substack.com',
    },
    {
      title: 'Albert Wong — eCommerce, Java, Database, k8s, Automation',
      url: 'https://atwong.medium.com',
    },
    {
      title: 'tajawal — tech blog',
      url: 'https://medium.com/tech-tajawal',
    },
    {
      title: 'API Developer Weekly — the business, design, development, and deployment of APIs',
      url: 'https://apideveloperweekly.com/',
    },
    {
      title: 'Engineering At Scale — simplifying databases, system design, architecture',
      url: 'https://engineeringatscale.substack.com',
    },
  ],
  others: [
    {
      title: 'The Pragmatic Engineer — big tech and startups, from the inside',
      url: 'https://newsletter.pragmaticengineer.com',
    },
    {
      title: 'TLDR — a daily newsletter with links and TLDRs of the best tech, science, and coding news',
      url: 'https://tldr.tech',
    },
    {
      title: 'Changelog News — a healthy dose of tech news, with a focus on open source',
      url: 'https://changelog.com/news',
    },
    {
      title: 'Bytes — a JavaScript newsletter that doesn’t suck',
      url: 'https://bytes.dev',
    },
    {
      title: 'Software Lead Weekly — for busy engineering leaders who want to build phenomenal teams',
      url: 'https://softwareleadweekly.com',
    },
    {
      title: 'Hacker Newsletter — a weekly newsletter of the best articles from Hacker News',
      url: 'https://hackernewsletter.com',
    },
    {
      title: 'Devopsish — news and analysis roughly weekly, mostly about DevOps and platform engineering',
      url: 'https://devopsish.com',
    },
    {
      title: 'Console — the best tools for developers, in your inbox every week',
      url: 'https://console.dev',
    },
    {
      title: 'The Overflow — Stack Overflow’s blog on software and technology culture',
      url: 'https://stackoverflow.blog',
    },
    {
      title: "Cassidy Williams' Newsletter — musings on tech, careers, and developer culture",
      url: 'https://cassidoo.co',
    },
  ],
};
