export interface ReasoningStage {
  stage: 'EVENT' | 'TECHNICAL ISSUE' | 'INVESTIGATION' | 'DECISION' | 'ACTION' | 'RESULT';
  title: string;
  summary: string;
  detail: string;
  evidenceRef: string;
}

export interface CitationRecord {
  documentId: string;
  title: string;
  type: 'ADR' | 'RFC' | 'INCIDENT' | 'SLACK' | 'BENCHMARK';
  code: string;
  date: string;
  author: string;
  role: string;
  summary: string;
  quote: string;
  relevance: string;
  sourceHash: string;
  relatedDecision: string;
}

export interface TimelineMilestone {
  stage: 'Proposal' | 'Evaluation' | 'Decision' | 'Migration' | 'Result';
  date: string;
  title: string;
  description: string;
  leadStakeholder: string;
  documentRef: string;
}

export interface ForensicScenario {
  id: string;
  tag: string;
  title: string;
  question: string;
  targetInquiry: string;
  directAnswer: string;
  confidenceScore: 'high' | 'medium' | 'low';
  confidencePercentage: number;
  confidenceRationale: string;
  keyFacts: {
    decision: string;
    why: string;
    who: string;
    when: string;
    impact: string;
  };
  reasoningTrail: ReasoningStage[];
  citations: CitationRecord[];
  timeline: TimelineMilestone[];
}

export const MERIDIAN_SCENARIOS: Record<string, ForensicScenario> = {
  postgres: {
    id: 'postgres',
    tag: 'ARCHITECTURE DECISION',
    title: 'PostgreSQL & pgvector Migration',
    question: 'Why did we migrate to PostgreSQL and change the vector index on August 12?',
    targetInquiry: 'Why did we migrate to PostgreSQL and change the vector index on August 12?',
    directAnswer:
      'PostgreSQL with pgvector was selected to eliminate cross-network latency between relational order records and vector embedding stores. On August 12, HNSW indexing and an RDS upgrade to db.r6g.2xlarge were mandated after staging tests failed to catch index lockouts under 3.8M production embeddings.',
    confidenceScore: 'high',
    confidencePercentage: 94,
    confidenceRationale:
      'Corroborated across ADR-042 (formal ADR), RFC-204 (architecture specification), and verified Slack #arch-council transcripts.',
    keyFacts: {
      decision: 'Adopt PostgreSQL + pgvector with HNSW indexing; scale primary RDS to db.r6g.2xlarge.',
      why: 'PCI-DSS transaction safety + sub-15ms p99 vector recommendation latency.',
      who: 'Architecture Review Board led by Alice Chen (Principal Architect), signed off by Marcus Vance (VP Eng).',
      when: 'August 12, 2024 (RFC ratified July 15; HNSW index emergency patch applied August 12).',
      impact: 'Catalog latency reduced from 4.2s to 12ms with zero scheduled transaction downtime.',
    },
    reasoningTrail: [
      {
        stage: 'EVENT',
        title: 'Monolith Write Contention During Flash Sale',
        summary: 'On July 10, 2024, order checkout latency spiked to 4.2 seconds under heavy database write locks.',
        detail:
          'The legacy monolith database suffered severe lock contention during concurrent inventory reservations, impacting 18,000 checkout attempts.',
        evidenceRef: 'RFC-204: Monolith Migration Strategy (Section 1.1)',
      },
      {
        stage: 'TECHNICAL ISSUE',
        title: 'ACID Boundary & Embedding Isolation Mismatch',
        summary: 'Standalone NoSQL clusters could not maintain strict serializable ledger isolation required for payments.',
        detail:
          'Benchmark evaluation ADR-038 showed MongoDB had an 8.4% transaction abort rate under concurrent bursts, while separate vector stores introduced unacceptable cross-datacenter hop latency.',
        evidenceRef: 'ADR-038: Database Benchmark Report',
      },
      {
        stage: 'INVESTIGATION',
        title: 'Comparative Benchmark Evaluation (ADR-042)',
        summary: 'Architecture Committee tested unified PostgreSQL relational tables paired with the native pgvector extension.',
        detail:
          'Staging benchmarks validated 98.4% retrieval accuracy and confirmed transactional integrity across ledger entries.',
        evidenceRef: 'ADR-042: Database Selection Review',
      },
      {
        stage: 'DECISION',
        title: 'Ratification of PostgreSQL & Phase 1 Execution',
        summary: 'Approved migrating order domains to PostgreSQL + Kafka event streaming starting August 1, 2024.',
        detail:
          'Alice Chen and Marcus Vance authorized decomposition. Team Nova assigned to execute cutover in Phase 1.',
        evidenceRef: 'RFC-204 Sign-off Record',
      },
      {
        stage: 'ACTION',
        title: 'Emergency HNSW Indexing & RDS Scaling (Aug 12)',
        summary: 'Vector index build locked catalog tables for 45 minutes in staging; switched immediately to HNSW with 64GB RAM.',
        detail:
          'In Slack #arch-council, SRE Dave Miller reported index locks. Alice Chen mandated HNSW (m=16, ef_construction=64) and Marcus Vance authorized RDS db.r6g.2xlarge budget.',
        evidenceRef: 'Slack Transcript #arch-council (Aug 12, 14:22 UTC)',
      },
      {
        stage: 'RESULT',
        title: 'Restored Sub-15ms p99 Latency & Zero Outages',
        summary: 'Production cutover completed with 99.99% availability and verified zero write-lock anomalies.',
        detail:
          'Memory-resident HNSW vectors delivered 12ms p99 search speed with complete ACID compliance on payment ledgers.',
        evidenceRef: 'Infrastructure Telemetry Post-Cutover Audit #112',
      },
    ],
    citations: [
      {
        documentId: 'doc-adr-042',
        title: 'ADR-042: Database Selection Review',
        type: 'ADR',
        code: 'ADR-042',
        date: 'July 15, 2024',
        author: 'Alice Chen',
        role: 'Principal Architect',
        summary:
          'Formal evaluation of MongoDB, MySQL, and PostgreSQL for decoupled order services. PostgreSQL approved unanimously.',
        quote:
          'Adopt Kafka + PostgreSQL starting August 1, 2024. Team Nova will execute migration in Phase 1 with pgvector HNSW index caching.',
        relevance: 'Primary architectural charter establishing the database standard.',
        sourceHash: 'SHA256:7f4a2b9...1c0',
        relatedDecision: 'Core Database Migration to PostgreSQL',
      },
      {
        documentId: 'doc-rfc-204',
        title: 'RFC-204: Monolith Migration to Event-Driven Microservices',
        type: 'RFC',
        code: 'RFC-204',
        date: 'July 15, 2024',
        author: 'Platform Engineering & Team Nova',
        role: 'Architecture Review Committee',
        summary:
          'Decomposition milestones, transaction consistency rules, and event stream replication architecture.',
        quote:
          'Decomposition milestones require strict ACID guarantees for payment ledger. Relational PostgreSQL is mandatory.',
        relevance: 'Technical specification establishing core transaction consistency criteria.',
        sourceHash: 'SHA256:9c1e4a3...4e8',
        relatedDecision: 'Zero-Downtime Data Cutover Architecture',
      },
      {
        documentId: 'doc-slack-arch',
        title: 'Slack Transcript #arch-council: Database Migration Emergency',
        type: 'SLACK',
        code: 'SLACK-ARCH',
        date: 'August 12, 2024',
        author: 'Marcus Vance',
        role: 'VP of Engineering',
        summary:
          'Emergency sync regarding pgvector indexing memory exhaustion and hardware scaling sign-off.',
        quote:
          'Approved the budget increase for the 2xlarge instance for Q3. Switch immediately to HNSW indexing.',
        relevance: 'Executive authorization for RDS hardware scaling and indexing switch.',
        sourceHash: 'SHA256:3d8b1f2...9a1',
        relatedDecision: 'RDS Sizing & Hardware Budget Authorization',
      },
    ],
    timeline: [
      {
        stage: 'Proposal',
        date: 'July 10, 2024',
        title: 'Monolith Lock Contention Identified',
        description: 'Flash sale write-lock contention caused 4.2s latency spikes; RFC-204 drafted.',
        leadStakeholder: 'Alice Chen (Principal Architect)',
        documentRef: 'RFC-204',
      },
      {
        stage: 'Evaluation',
        date: 'July 15, 2024',
        title: 'ADR-042 Benchmark Completed',
        description: 'Comparative testing evaluated PostgreSQL, MySQL, and MongoDB; PostgreSQL approved.',
        leadStakeholder: 'Architecture Review Board',
        documentRef: 'ADR-042',
      },
      {
        stage: 'Decision',
        date: 'August 1, 2024',
        title: 'Phase 1 Cutover Authorized',
        description: 'Engineering committee formally approved Kafka + PostgreSQL cutover roadmap.',
        leadStakeholder: 'Marcus Vance (VP Eng) & Bob Martinez',
        documentRef: 'RFC-204',
      },
      {
        stage: 'Migration',
        date: 'August 12, 2024',
        title: 'HNSW Indexing Emergency Shift',
        description: 'IVFFlat index locks mitigated by switching to HNSW and scaling RDS to db.r6g.2xlarge.',
        leadStakeholder: 'Dave Miller (Senior SRE)',
        documentRef: 'Slack #arch-council',
      },
      {
        stage: 'Result',
        date: 'August 20, 2024',
        title: 'Postmortem #88 & Verified Stability',
        description: 'Concurrently flag enforced; p99 latency stabilized at 12ms across 3.8M embeddings.',
        leadStakeholder: 'Dave Miller & Alice Chen',
        documentRef: 'Incident Retrospective #88',
      },
    ],
  },
  scaling: {
    id: 'scaling',
    tag: 'INFRASTRUCTURE DECISION',
    title: 'AWS RDS Scaling Approval',
    question: 'Who approved scaling the AWS RDS instances?',
    targetInquiry: 'Who approved scaling the AWS RDS instances?',
    directAnswer:
      'Marcus Vance, VP of Engineering, formally approved the budget increase to scale the AWS RDS primary instance to db.r6g.2xlarge (64GB RAM, 8 vCPUs) on August 12, 2024, during an emergency session in Slack #arch-council.',
    confidenceScore: 'high',
    confidencePercentage: 96,
    confidenceRationale:
      'Direct verbatim quote extracted from authenticated Slack transcripts and AWS Cost Allocation change tags.',
    keyFacts: {
      decision: 'Upgrade primary production RDS instance from db.r6g.large to db.r6g.2xlarge.',
      why: 'Buffer cache memory starvation during production HNSW vector index generation.',
      who: 'Authorized by Marcus Vance (VP of Engineering), requested by Alice Chen (Principal Architect).',
      when: 'August 12, 2024 at 15:10 UTC.',
      impact: 'Eliminated disk thrashing; restored p99 latency from 180ms to 12ms.',
    },
    reasoningTrail: [
      {
        stage: 'EVENT',
        title: 'Production Embedding Scale-up',
        summary: 'Production catalog expanded to 3.8M embeddings, exceeding staging mock volume by 380x.',
        detail: 'Staging tests used 10k rows; real production dataset caused severe memory pressure on RDS.',
        evidenceRef: 'Slack Transcript #arch-council (14:35 UTC)',
      },
      {
        stage: 'TECHNICAL ISSUE',
        title: 'RDS Buffer Cache Hit Rate Dropped to 68%',
        summary: 'Low RAM forced pgvector index calculations to swap to disk, degrading response times.',
        detail: 'Database CPU utilization hit 98% and IOPS saturated available baseline bandwidth.',
        evidenceRef: 'AWS CloudWatch Metrics Log #882',
      },
      {
        stage: 'INVESTIGATION',
        title: 'Memory Sizing Calculation for HNSW',
        summary: 'Platform team determined minimum 48GB dedicated RAM was required for resident vector graphs.',
        detail: 'HNSW indexing requires graph nodes to remain resident in memory for sub-20ms neighbor traversal.',
        evidenceRef: 'ADR-042 Hardware Addendum',
      },
      {
        stage: 'DECISION',
        title: 'VP of Engineering Budget Authorization',
        summary: 'Marcus Vance approved the cloud expenditure increase for Q3.',
        detail: 'Quoting: "Approved the budget increase for the 2xlarge instance for Q3."',
        evidenceRef: 'Slack Transcript #arch-council (15:10 UTC)',
      },
      {
        stage: 'ACTION',
        title: 'Zero-Downtime Failover Execution',
        summary: 'SRE Dave Miller executed maintenance failover to provisioned 2xlarge replica in window #2.',
        detail: 'Failover completed in 4.2 seconds with no client connection drops.',
        evidenceRef: 'SRE Deployment Log #409',
      },
      {
        stage: 'RESULT',
        title: 'RAM Utilization Stabilized at 54%',
        summary: 'Vector index comfortably resident in 64GB RAM; zero disk thrashing observed.',
        detail: 'System handled peak flash sale traffic with zero query degradation.',
        evidenceRef: 'Post-Deployment Infrastructure Telemetry',
      },
    ],
    citations: [
      {
        documentId: 'doc-slack-arch',
        title: 'Slack Transcript #arch-council: Database Migration Emergency',
        type: 'SLACK',
        code: 'SLACK-ARCH',
        date: 'August 12, 2024',
        author: 'Marcus Vance',
        role: 'VP of Engineering',
        summary: 'Direct authorization of budget increase for db.r6g.2xlarge RDS instances.',
        quote: 'Approved the budget increase for the 2xlarge instance for Q3.',
        relevance: 'Primary executive sign-off for financial cloud scaling.',
        sourceHash: 'SHA256:3d8b1f2...9a1',
        relatedDecision: 'Cloud Budget Allocation Approval',
      },
      {
        documentId: 'doc-retro-88',
        title: 'Incident Retrospective #88: Vector Index Lockout',
        type: 'INCIDENT',
        code: 'POSTMORTEM-88',
        date: 'August 20, 2024',
        author: 'Dave Miller',
        role: 'Senior SRE',
        summary: 'Postmortem documenting hardware sizing correction and memory headroom verification.',
        quote: 'Upgraded RDS primary to db.r6g.2xlarge with 64GB RAM to prevent memory starvation.',
        relevance: 'SRE verification confirming hardware adequacy.',
        sourceHash: 'SHA256:4a8c9b1...2f3',
        relatedDecision: 'Operational Hardware Standards',
      },
    ],
    timeline: [
      {
        stage: 'Proposal',
        date: 'August 12, 2024 14:22',
        title: 'Memory Starvation Alert',
        description: 'Alert fired: RDS memory buffer hit 94% during index generation.',
        leadStakeholder: 'Dave Miller (Senior SRE)',
        documentRef: 'CloudWatch Alert #401',
      },
      {
        stage: 'Evaluation',
        date: 'August 12, 2024 14:40',
        title: 'Sizing Analysis',
        description: 'Alice Chen recommended minimum 64GB instance for resident HNSW graph.',
        leadStakeholder: 'Alice Chen (Principal Architect)',
        documentRef: 'Slack #arch-council',
      },
      {
        stage: 'Decision',
        date: 'August 12, 2024 15:10',
        title: 'Budget Approved',
        description: 'VP of Engineering Marcus Vance authorized 2xlarge upgrade spend.',
        leadStakeholder: 'Marcus Vance (VP Eng)',
        documentRef: 'Slack #arch-council',
      },
      {
        stage: 'Migration',
        date: 'August 12, 2024 16:30',
        title: 'Instance Provisioned',
        description: 'SRE executed failover to db.r6g.2xlarge during scheduled window #2.',
        leadStakeholder: 'Dave Miller (Senior SRE)',
        documentRef: 'SRE Log #409',
      },
      {
        stage: 'Result',
        date: 'August 13, 2024',
        title: 'Stable Telemetry Confirmed',
        description: 'RAM headroom verified at 46%; query p99 latency restored to 12ms.',
        leadStakeholder: 'Platform Operations',
        documentRef: 'Telemetry Audit #112',
      },
    ],
  },
  incident: {
    id: 'incident',
    tag: 'INCIDENT POSTMORTEM',
    title: 'Incident Retrospective #88',
    question: 'What happened during Incident Retrospective #88?',
    targetInquiry: 'What happened during Incident Retrospective #88?',
    directAnswer:
      'Incident #88 was a 32-minute catalog degradation on August 12, 2024, caused by creating a pgvector index without the CONCURRENTLY flag, which placed an exclusive write-lock on production tables. The retrospective mandated pgBouncer connection pooling, enforced the CONCURRENTLY directive for all DDL, and standardized Supabase for local development.',
    confidenceScore: 'high',
    confidencePercentage: 98,
    confidenceRationale:
      'Extracted directly from authenticated Incident Retrospective #88 with complete action item owner sign-offs.',
    keyFacts: {
      decision: 'Enforce CONCURRENTLY flag for all index creation; standardize pgBouncer connection pooling.',
      why: 'Exclusive table write locks starved database connections during live traffic.',
      who: 'Facilitated by Dave Miller (Senior SRE); action items approved by Alice Chen.',
      when: 'Incident occurred August 12, 2024; Retrospective published August 20, 2024.',
      impact: 'Prevented future lockouts; standard DDL guardrails codified into CI/CD pipelines.',
    },
    reasoningTrail: [
      {
        stage: 'EVENT',
        title: 'Catalog Search Degradation Alert',
        summary: 'Monitoring detected 32-minute API timeout spike across order checkout endpoints.',
        detail: 'Client connections queued while waiting for exclusive table lock to release.',
        evidenceRef: 'Incident Retrospective #88 (Section 1)',
      },
      {
        stage: 'TECHNICAL ISSUE',
        title: 'Missing CONCURRENTLY DDL Flag',
        summary: 'CREATE INDEX command was executed synchronously without background non-blocking execution.',
        detail: 'PostgreSQL default index creation acquires an ACCESS EXCLUSIVE lock on the target table.',
        evidenceRef: 'Postmortem Root Cause Analysis (Item 2)',
      },
      {
        stage: 'INVESTIGATION',
        title: 'Staging vs Production Divergence',
        summary: 'Investigation found staging tests did not surface locks because mock table had only 10k rows.',
        detail: 'On 3.8M production rows, index creation took 45 minutes rather than 3 seconds.',
        evidenceRef: 'Incident Retrospective #88 (Unresolved Context)',
      },
      {
        stage: 'DECISION',
        title: 'Strict CI/CD DDL Linting Policy',
        summary: 'Mandated automated linters rejecting any database migration lacking the CONCURRENTLY directive.',
        detail: 'All future index migrations require zero-lock execution verification in staging.',
        evidenceRef: 'Engineering Council Policy RFC-210',
      },
      {
        stage: 'ACTION',
        title: 'Deployment of Connection Pooling Guardrails',
        summary: 'Deployed pgBouncer connection proxies to cap pod connections at 25 per node.',
        detail: 'Prevented connection bursts from exhausting primary database thread pools.',
        evidenceRef: 'SRE Runbook v4.2',
      },
      {
        stage: 'RESULT',
        title: 'Zero Subsequent Locking Incidents',
        summary: 'Subsequent vector re-indexing completed with 0ms table locking impact.',
        detail: 'Production resilience verified across 4 continuous deployment cycles.',
        evidenceRef: 'Q3 SRE Reliability Report',
      },
    ],
    citations: [
      {
        documentId: 'doc-retro-88',
        title: 'Incident Retrospective #88: Vector Index Lockout',
        type: 'INCIDENT',
        code: 'POSTMORTEM-88',
        date: 'August 20, 2024',
        author: 'Dave Miller',
        role: 'Senior SRE Facilitator',
        summary: 'Full postmortem report detailing root cause, timeline, and remediation items.',
        quote:
          'Enforce CONCURRENTLY flag for all future index creations (Owner: Dave Miller, Completed: 2024-08-14).',
        relevance: 'Mandated remediation policy preventing production table locks.',
        sourceHash: 'SHA256:4a8c9b1...2f3',
        relatedDecision: 'Zero-Downtime Indexing Standard',
      },
    ],
    timeline: [
      {
        stage: 'Proposal',
        date: 'August 12, 2024 14:15',
        title: 'Incident Declared (SEV-2)',
        description: 'Catalog response latency spiked past 4,000ms; incident room opened.',
        leadStakeholder: 'Dave Miller (Incident Commander)',
        documentRef: 'Slack #incident-88',
      },
      {
        stage: 'Evaluation',
        date: 'August 12, 2024 14:47',
        title: 'Locking Query Identified',
        description: 'Exclusive lock on catalog embeddings pinpointed to migration job.',
        leadStakeholder: 'Alice Chen (Principal Architect)',
        documentRef: 'pg_stat_activity Log',
      },
      {
        stage: 'Decision',
        date: 'August 14, 2024',
        title: 'Policy Codified',
        description: 'Mandated CONCURRENTLY directive and pgBouncer proxy deployment.',
        leadStakeholder: 'Architecture Review Board',
        documentRef: 'Retrospective Action Items',
      },
      {
        stage: 'Migration',
        date: 'August 18, 2024',
        title: 'pgBouncer Rollout',
        description: 'Connection pool limits applied across 42 microservice pods.',
        leadStakeholder: 'Platform SRE Team',
        documentRef: 'Kubernetes Config #281',
      },
      {
        stage: 'Result',
        date: 'August 20, 2024',
        title: 'Retrospective Signed Off',
        description: 'Formal sign-off by VP Eng and SRE Lead; incident closed.',
        leadStakeholder: 'Marcus Vance & Dave Miller',
        documentRef: 'Incident Retrospective #88',
      },
    ],
  },
  mongodb: {
    id: 'mongodb',
    tag: 'TECHNOLOGY EVALUATION',
    title: 'MongoDB Rejection Rationale',
    question: 'Why was MongoDB rejected for the Order and Payment domains?',
    targetInquiry: 'Why was MongoDB rejected for the Order and Payment domains?',
    directAnswer:
      'MongoDB was formally rejected in ADR-038 because distributed multi-document ACID transactions introduced unacceptable latency spikes under concurrent checkout bursts, and strict PCI-DSS compliance required PostgreSQL serializable isolation and immutable audit logs for the financial payment ledger.',
    confidenceScore: 'high',
    confidencePercentage: 92,
    confidenceRationale:
      'Verified across comparative benchmark ADR-038 and PCI-DSS compliance specifications in Project Meridian.',
    keyFacts: {
      decision: 'Reject MongoDB for Order and Payment domains; approve PostgreSQL as single source of truth.',
      why: '8.4% transaction abort rate under high concurrency; missing serializable ledger isolation.',
      who: 'Data Platform Team and SecOps Committee, approved by Alice Chen.',
      when: 'July 15, 2024 (Formalized in ADR-038 & RFC-204).',
      impact: 'Eliminated split-brain financial reconciliation risks across ledger entities.',
    },
    reasoningTrail: [
      {
        stage: 'EVENT',
        title: 'NoSQL vs Relational Evaluation Initiated',
        summary: 'Architecture team evaluated whether MongoDB document models offered superior schema flexibility.',
        detail: 'Evaluated MongoDB replica sets against PostgreSQL for the new microservice boundaries.',
        evidenceRef: 'ADR-038 Evaluation Scope',
      },
      {
        stage: 'TECHNICAL ISSUE',
        title: 'Distributed Lock Contention on Payments',
        summary: 'Benchmark testing showed an 8.4% transaction abort rate during simultaneous inventory checkouts.',
        detail: 'Distributed locking across multi-document transactions generated severe commit latency spikes.',
        evidenceRef: 'ADR-038 Benchmark Results (Table 3)',
      },
      {
        stage: 'INVESTIGATION',
        title: 'PCI-DSS Compliance Audit Verification',
        summary: 'Security compliance required immutable transaction logs and serializable isolation.',
        detail: 'Eventual consistency models were rejected as a regulatory audit compliance risk.',
        evidenceRef: 'PCI-DSS Compliance Specification 2024',
      },
      {
        stage: 'DECISION',
        title: 'Consensus Decision: Relational Sole Source of Truth',
        summary: 'PostgreSQL ratified as the only permitted datastore for order and payment ledgers.',
        detail: 'Documented in RFC-204: "PostgreSQL approved as the single source of truth for payment entities."',
        evidenceRef: 'RFC-204 Monolith Migration Plan',
      },
      {
        stage: 'ACTION',
        title: 'Schema Standardization on PostgreSQL DDL',
        summary: 'Standardized relational schemas with row-level encryption and strict foreign key constraints.',
        detail: 'Team Nova proceeded with PostgreSQL data cutover design.',
        evidenceRef: 'Data Architecture Roadmap 2024',
      },
      {
        stage: 'RESULT',
        title: 'Zero Financial Reconciliation Anomalies',
        summary: 'Post-migration audits confirmed zero transactional inconsistencies across 2.4M transactions.',
        detail: 'Consistent commit latency remained under 20ms during peak holiday traffic.',
        evidenceRef: 'Financial Ledger Compliance Report #90',
      },
    ],
    citations: [
      {
        documentId: 'doc-adr-038',
        title: 'ADR-038: NoSQL vs Relational Benchmark Results',
        type: 'BENCHMARK',
        code: 'ADR-038',
        date: 'July 10, 2024',
        author: 'Data Platform Team',
        role: 'Database Performance Engineers',
        summary: 'Direct benchmark testing comparing MongoDB and PostgreSQL transaction contention.',
        quote:
          'Distributed document locking in MongoDB resulted in acceptable read performance but unacceptable transaction contention during simultaneous inventory checkouts.',
        relevance: 'Primary benchmark proof documenting the technical rejection.',
        sourceHash: 'SHA256:8b2c4e1...7a0',
        relatedDecision: 'NoSQL Rejection for Core Ledgers',
      },
      {
        documentId: 'doc-rfc-204',
        title: 'RFC-204: Monolith Migration Plan',
        type: 'RFC',
        code: 'RFC-204',
        date: 'July 15, 2024',
        author: 'Architecture Review Committee',
        role: 'Lead Reviewers',
        summary: 'Architecture specification ratifying PostgreSQL as single source of truth.',
        quote: 'PostgreSQL approved as the single source of truth for payment and ledger entities.',
        relevance: 'Final architectural consensus documented in roadmap.',
        sourceHash: 'SHA256:9c1e4a3...4e8',
        relatedDecision: 'Architecture Standard Ratification',
      },
    ],
    timeline: [
      {
        stage: 'Proposal',
        date: 'June 28, 2024',
        title: 'MongoDB Proposed by Team Beta',
        description: 'Proposal to use MongoDB document store for flexible checkout catalog schemas.',
        leadStakeholder: 'Team Beta Lead',
        documentRef: 'Architecture Proposal #12',
      },
      {
        stage: 'Evaluation',
        date: 'July 10, 2024',
        title: 'Concurrency Benchmark Executed',
        description: 'Benchmark uncovered 8.4% transaction abort rate under concurrent inventory locks.',
        leadStakeholder: 'Data Platform Team',
        documentRef: 'ADR-038 Benchmark Report',
      },
      {
        stage: 'Decision',
        date: 'July 15, 2024',
        title: 'MongoDB Formally Rejected',
        description: 'Architecture Council approved PostgreSQL; MongoDB rejected for transaction ledger.',
        leadStakeholder: 'Alice Chen (Principal Architect)',
        documentRef: 'ADR-038 & RFC-204',
      },
      {
        stage: 'Migration',
        date: 'August 1, 2024',
        title: 'PostgreSQL Schema Enforcement',
        description: 'Serializable isolation schemas deployed across payment microservices.',
        leadStakeholder: 'Team Nova',
        documentRef: 'RFC-204 Execution Milestone',
      },
      {
        stage: 'Result',
        date: 'August 30, 2024',
        title: 'Financial Audit Signed Off',
        description: 'Zero transaction ledger anomalies verified across 2.4M payment checkouts.',
        leadStakeholder: 'SecOps & Compliance Lead',
        documentRef: 'Ledger Audit Report #90',
      },
    ],
  },
};

export const SUGGESTED_INQUIRIES = [
  {
    id: 'postgres',
    tag: 'ARCHITECTURE',
    title: 'PostgreSQL Migration',
    question: 'Why did we migrate to PostgreSQL and change the vector index on August 12?',
    dateBadge: 'AUG 12, 2024',
    sourceCount: '3 verified sources',
  },
  {
    id: 'scaling',
    tag: 'INFRASTRUCTURE',
    title: 'AWS RDS Scaling',
    question: 'Who approved scaling the AWS RDS instances?',
    dateBadge: 'AUG 12, 2024',
    sourceCount: '2 verified sources',
  },
  {
    id: 'incident',
    tag: 'INCIDENT',
    title: 'Incident Retrospective #88',
    question: 'What happened during Incident Retrospective #88?',
    dateBadge: 'AUG 20, 2024',
    sourceCount: '3 verified sources',
  },
  {
    id: 'mongodb',
    tag: 'TECHNOLOGY',
    title: 'MongoDB Rejection',
    question: 'Why was MongoDB rejected for the Order and Payment domains?',
    dateBadge: 'JUL 15, 2024',
    sourceCount: '2 verified sources',
  },
];

export const ARCHIVE_DOCUMENT_RECORDS: CitationRecord[] = [
  {
    documentId: 'doc-adr-042',
    title: 'ADR-042: Database Selection Review',
    type: 'ADR',
    code: 'ADR-042',
    date: 'July 15, 2024',
    author: 'Alice Chen',
    role: 'Principal Architect',
    summary:
      'Formal evaluation comparing MySQL, MongoDB, and PostgreSQL for decoupled order services. Approved PostgreSQL with native pgvector.',
    quote:
      'Adopt Kafka + PostgreSQL starting August 1, 2024. Team Nova will execute migration in Phase 1 with pgvector HNSW index caching.',
    relevance: 'Primary architectural charter establishing the database standard.',
    sourceHash: 'SHA256:7f4a2b9...1c0',
    relatedDecision: 'Core Database Migration to PostgreSQL',
  },
  {
    documentId: 'doc-rfc-204',
    title: 'RFC-204: Monolith Migration to Event-Driven Microservices',
    type: 'RFC',
    code: 'RFC-204',
    date: 'July 15, 2024',
    author: 'Team Nova & Platform Eng',
    role: 'Architecture Review Committee',
    summary:
      'Decomposition milestones, transaction consistency rules, and event stream replication architecture via Kafka.',
    quote:
      'Decomposition milestones require strict ACID guarantees for payment ledger. Event streaming through Kafka ensures safe phased cutover.',
    relevance: 'Technical specification establishing core transaction consistency criteria.',
    sourceHash: 'SHA256:9c1e4a3...4e8',
    relatedDecision: 'Zero-Downtime Data Cutover Architecture',
  },
  {
    documentId: 'doc-retro-88',
    title: 'Incident Retrospective #88: Vector Index Lockout',
    type: 'INCIDENT',
    code: 'POSTMORTEM-88',
    date: 'August 20, 2024',
    author: 'Dave Miller',
    role: 'Senior SRE Facilitator',
    summary:
      'Analysis of connection pool exhaustion under flash sale load. Action items to scale instance and mandate CONCURRENTLY flag.',
    quote:
      'Standardize pgBouncer connection pooling across all microservices and upgrade RDS primary to db.r6g.2xlarge with 64GB RAM.',
    relevance: 'Post-incident corrective requirement authorizing hardware upgrade.',
    sourceHash: 'SHA256:4a8c9b1...2f3',
    relatedDecision: 'RDS Sizing & Connection Proxy Deployment',
  },
  {
    documentId: 'doc-slack-arch',
    title: 'Slack Transcript #arch-council: Database Migration Emergency',
    type: 'SLACK',
    code: 'SLACK-ARCH',
    date: 'August 12, 2024',
    author: 'Marcus Vance',
    role: 'VP of Engineering',
    summary:
      'Budget sign-off for moving primary databases to AWS RDS db.r6g.2xlarge with provisioned IOPS to support HNSW caching.',
    quote:
      'Approved the budget increase for the 2xlarge instance for Q3. Switch immediately to HNSW indexing.',
    relevance: 'Direct authorization from VP of Engineering for hardware scaling.',
    sourceHash: 'SHA256:3d8b1f2...9a1',
    relatedDecision: 'RDS Sizing & Hardware Budget Authorization',
  },
  {
    documentId: 'doc-adr-038',
    title: 'ADR-038: NoSQL vs Relational Benchmark Results',
    type: 'BENCHMARK',
    code: 'ADR-038',
    date: 'July 10, 2024',
    author: 'Data Platform Team',
    role: 'Database Performance Engineers',
    summary:
      'Benchmark results ruling out MongoDB due to distributed multi-document ACID transaction latency spikes.',
    quote:
      'Distributed document locking in MongoDB resulted in acceptable read performance but unacceptable transaction contention during simultaneous inventory checkouts.',
    relevance: 'Primary benchmark proof documenting the technical rejection.',
    sourceHash: 'SHA256:8b2c4e1...7a0',
    relatedDecision: 'NoSQL Rejection for Core Ledgers',
  },
  {
    documentId: 'doc-pci-audit',
    title: 'PCI-DSS Compliance Specification 2024',
    type: 'BENCHMARK',
    code: 'PCI-DSS-2024',
    date: 'July 8, 2024',
    author: 'SecOps Committee',
    role: 'Compliance Auditors',
    summary:
      'Enforced row-level encryption and immutable audit trail requirements for all customer payment records.',
    quote:
      'Payment ledger must maintain immutable audit trail with serializable isolation guarantees.',
    relevance: 'Regulatory compliance policy ruling out eventual consistency models.',
    sourceHash: 'SHA256:5e1f9a0...3b4',
    relatedDecision: 'Security Compliance Standards',
  },
];

export const ARCHIVE_DOCS = ARCHIVE_DOCUMENT_RECORDS;
export const DEMO_SCENARIOS = MERIDIAN_SCENARIOS;
export const EXAMPLE_QUESTIONS = SUGGESTED_INQUIRIES;
export const STATS = [
  { value: '2,481', label: 'Documents', icon: '📄' },
  { value: '387', label: 'Decisions Found', icon: '🔎' },
  { value: '94%', label: 'Verified Context', icon: '✓' },
  { value: '8,942', label: 'Evidence Links', icon: '🔗' },
];
