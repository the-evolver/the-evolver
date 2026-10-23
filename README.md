<img width="100%" src="assets/header-animation.svg" alt="Atul Kumar — Backend Engineer · Java · Distributed Systems" />

<p align="center">
  <img width="100%" src="assets/typing-header.svg" alt="Backend Software Engineer — Java · Spring Boot · AWS · AIR 6, CodeChef Long Challenge · Global Rank 51, LeetCode Weekly 472 · Building Distributed Systems at Scale" />
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/atulcse/"><img src="assets/badges/linkedin.svg" alt="LinkedIn" /></a>&nbsp;
  <a href="https://the-evolver.github.io/"><img src="assets/badges/portfolio.svg" alt="Portfolio" /></a>&nbsp;
  <a href="https://leetcode.com/u/recursive_coder/"><img src="assets/badges/leetcode.svg" alt="LeetCode" /></a>&nbsp;
  <a href="mailto:contacts.atulsharma@gmail.com"><img src="assets/badges/email.svg" alt="Email" /></a>
</p>

<img width="100%" src="assets/divider.svg" alt="" />

## `> whoami`

**Backend Software Engineer** with 3 years of experience building scalable **Java and Spring Boot microservices**, event-driven systems on **Apache Kafka**, and cloud services on **AWS** — with a focus on low latency and reliability.

Senior Software Engineer at **Compro Technologies**, where I led a DynamoDB and S3 migration of 10M+ objects end to end, cut lookup latency from 800ms to under 20ms, and mentor newer engineers. Competitive programmer on the side: **Global Rank 51** in LeetCode Weekly 472 and **All India Rank 6** in CodeChef's Long Challenge.

I'm looking for high-impact backend roles on systems built for scale.

<img width="100%" src="assets/divider.svg" alt="" />

## 💼 Experience

### Senior Software Engineer · Compro Technologies
<sub>Jul 2023 – Present</sub>

- Led a **DynamoDB and S3 migration** end to end, moving **10M+ objects** through an idempotent pipeline; redesigned indexes cut lookup latency from **800ms to under 20ms** and read cost by **40%**.
- Architected a **Kafka event pipeline** that decoupled 4 downstream services and improved data freshness by **30%**.
- Designed **JWT authentication and role-based access control** across 6+ microservices with Redis-cached permission checks **under 10ms**; passed a third-party security audit with **zero critical findings**.
- Moved CI/CD to **GitHub Actions** with ECS rolling deploys, cutting hotfix releases from **4 hours to under 1 hour**.
- Raised test coverage from **under 30% to 87%** with JUnit 5 and Mockito, cutting production bugs by **40%**.
- Partnered daily with product managers and QA to deliver REST APIs and transactional workflows for a subscription-based assignment platform, growing feature adoption by **20% in two quarters**.
- Mentored and onboarded **3 junior engineers**, presented system designs in team reviews, and ran root-cause analysis on production issues using New Relic.

<img width="100%" src="assets/divider.svg" alt="" />

## 🚀 Projects

<h3 align="center">🧠 LLM Gateway</h3>

<p align="center">
  <img width="100%" src="assets/llm-gateway-animation.svg" alt="Animated diagram of the LLM Gateway: requests routed to the cheapest capable model, escalated on low confidence, and failed over across providers" />
</p>

<p align="center">
  <a href="https://github.com/the-evolver/p-llm-gateway"><img src="assets/badges/view-code.svg" alt="View code" /></a>
</p>

- Implemented an **API gateway over Anthropic, OpenAI, Groq and AWS Bedrock** that routes each request to the **cheapest capable model**, with **confidence-based escalation** and **cross-provider fallback**.
- Exposed **OpenAI-compatible streaming endpoints** with tool calling, per-key rate limits and daily budget caps.

<p align="center">
  <img src="assets/badges/chip-typescript.svg" alt="TypeScript" />
  <img src="assets/badges/chip-nodejs.svg" alt="Node.js" />
  <img src="assets/badges/chip-fastify.svg" alt="Fastify" />
  <img src="assets/badges/chip-bedrock.svg" alt="AWS Bedrock" />
</p>

<h3 align="center">⚡ Distributed Rate Limiter</h3>

<p align="center">
  <img width="100%" src="assets/footer-rate-limiter.svg" alt="Animated diagram of the distributed rate limiter: token bucket and sliding window" />
</p>

<p align="center">
  <a href="https://github.com/the-evolver/Distributed-rate-limiter-service"><img src="assets/badges/view-code.svg" alt="View code" /></a>
</p>

- Open-sourced **Token Bucket** and **Sliding Window** limiters using **Redis Lua scripts**: **12,000 req/sec, p99 under 5ms**.
- Created a **Spring AOP `@RateLimit`** annotation for per-user, per-IP and per-key limits, with **circuit-breaker fallback**.

<p align="center">
  <img src="assets/badges/chip-java.svg" alt="Java 17" />
  <img src="assets/badges/chip-springboot.svg" alt="Spring Boot 3" />
  <img src="assets/badges/chip-redis.svg" alt="Redis" />
</p>

<h3 align="center">🔔 Notification Engine</h3>

<p align="center">
  <img width="100%" src="assets/notification-engine-animation.svg" alt="Animated dashboard of the notification engine: delivery pipeline, audit log and metrics" />
</p>

<p align="center">
  <a href="https://github.com/the-evolver/notification-engine"><img src="assets/badges/view-code.svg" alt="View code" /></a>
</p>

- Engineered a **50,000+ notifications/hour** engine on **priority-tiered Kafka topics** with **Redis deduplication**, exponential backoff and **dead-letter queues** for duplicate-free delivery.
- Modeled a **delivery state machine** on MySQL with Redis caching, serving real-time status reads in **under 50ms**.

<p align="center">
  <img src="assets/badges/chip-java.svg" alt="Java" />
  <img src="assets/badges/chip-springboot.svg" alt="Spring Boot" />
  <img src="assets/badges/chip-kafka.svg" alt="Apache Kafka" />
  <img src="assets/badges/chip-mysql.svg" alt="MySQL" />
  <img src="assets/badges/chip-redis.svg" alt="Redis" />
</p>

<details>
<summary><b>More projects</b></summary>
<br/>

| Project | Description | Stack |
|---------|-------------|-------|
| [Smart Contact Manager](https://github.com/the-evolver/smart_contact_manager) | Contact management with Spring Security, CSRF protection and MVC | Java, Spring Boot, Hibernate |
| [AirBnBee](https://github.com/the-evolver/AirBnBee) | Full-stack accommodation platform with SSR and OAuth | Next.js, React, MongoDB, Prisma |

</details>

<img width="100%" src="assets/divider.svg" alt="" />

## 🛠️ Technical Skills

<p align="center">
  <img width="100%" src="assets/tech-stack.svg" alt="Languages: Java, C++, SQL, JavaScript, TypeScript. Frameworks: Spring Boot, Spring Security, Spring Data JPA, Hibernate, Node.js, REST APIs, Microservices. Data & Messaging: MySQL, DynamoDB, MongoDB, Redis, Apache Kafka. Cloud & DevOps: AWS (ECS, ECR, S3, Lambda, IAM, VPC), Docker, Kubernetes, GitHub Actions, CI/CD. Testing & Observability: JUnit 5, Mockito, New Relic." />
</p>

<p align="center"><sub><b>Engineering:</b> System Design · Distributed Systems · Event-Driven Architecture · Design Patterns · Agile</sub></p>

<img width="100%" src="assets/divider.svg" alt="" />

## 🏆 Achievements

<p align="center">
  <img width="100%" src="assets/achievements.svg" alt="All India Rank 6 in CodeChef Long Challenge · Global Rank 51 in LeetCode Weekly Contest 472 · 1000+ problems solved, 336 hard · LeetCode Top 11%, rating 1724+" />
</p>

<p align="center"><sub>
  Verify: <a href="https://leetcode.com/contest/weekly-contest-472/ranking/2/?region=global_v2">LeetCode Weekly 472 ranking</a> ·
  <a href="https://www.codechef.com/rankings/OCT221C">CodeChef Long Challenge ranking</a> ·
  <a href="https://leetcode.com/u/recursive_coder/">LeetCode profile</a>
</sub></p>

<img width="100%" src="assets/divider.svg" alt="" />

## 📊 Stats

<p align="center">
  <img width="49%" src="assets/stats/github.svg" alt="GitHub contribution streak, stars, PRs and repositories" />
  <img width="49%" src="assets/stats/leetcode.svg" alt="LeetCode problems solved by difficulty and contest rating" />
</p>
<p align="center">
  <img width="100%" src="assets/stats/contributions.svg" alt="GitHub contribution activity over the last year" />
</p>

<p align="center"><sub>Rendered from live data by this repo's own GitHub Action — refreshed daily.</sub></p>

<img width="100%" src="assets/divider.svg" alt="" />

## 🎓 Education

**Bachelor of Technology, Computer Science and Engineering** · CGPA **9.2 / 10**<br/>
JK Institute of Applied Physics and Technology, University of Allahabad · Jul 2019 – Jun 2023

<img width="100%" src="assets/footer-wave.svg" alt="" />
