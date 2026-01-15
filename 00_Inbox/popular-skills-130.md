# 人気のClaude Code Skills 130選

X(Twitter)やGitHubで話題のSKILL.md例をまとめた実践的なリファレンス。

---

## 1. skill-creator (Anthropic公式)

スキル作成のガイド。新規スキルを作る際に自動起動。

```yaml
---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
---
```

**Source:** [anthropics/skills](https://github.com/anthropics/skills)

---

## 2. pdf (Anthropic公式)

PDFの読み取り、作成、結合、分割。

```yaml
---
name: pdf
description: Extract and analyze text from PDF documents. Use when users ask to process or read PDFs.
---

# PDF Processing Skill

python3 extract_text.py <input_file>

Summarize the key points in a structured format.
```

---

## 3. docx (Anthropic公式)

Word文書の作成・編集・変更履歴・コメント対応。

```yaml
---
name: docx
description: Create, edit, and analyze Word documents with support for tracked changes, comments, formatting preservation, and text extraction. Use when working with .docx files.
---
```

---

## 4. xlsx (Anthropic公式)

Excelスプレッドシートの操作、数式、グラフ作成。

```yaml
---
name: xlsx
description: Create, edit, and analyze Excel spreadsheets with support for formulas, formatting, data analysis, and visualization.
---
```

---

## 5. pptx (Anthropic公式)

PowerPointプレゼンテーションの作成・編集。

```yaml
---
name: pptx
description: Create, edit, and analyze PowerPoint presentations with support for layouts, templates, charts, and automated slide generation.
---
```

---

## 6. commit-message-generator

gitコミットメッセージの自動生成。

```yaml
---
name: generating-commit-messages
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---

# Generating Commit Messages

## Instructions
1. Run `git diff --staged` to see changes
2. Suggest a commit message with:
   - Summary under 50 characters
   - Detailed description
   - Affected components

## Best practices
- Use present tense
- Explain what and why, not how
```

---

## 7. testing-patterns

Jest/TDD/モックパターン。

```yaml
---
name: testing-patterns
description: Use when writing tests, creating mocks, or following TDD workflow.
---

# Testing Patterns

## Test Structure
- Use `describe` blocks for grouping
- Use `it` for individual tests
- Follow AAA pattern: Arrange, Act, Assert

## Mocking
- Use jest.mock() for module mocking
- Create factory functions for test data
```

**Source:** [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)

---

## 8. systematic-debugging

4フェーズのデバッグ手法。

```yaml
---
name: systematic-debugging
description: Structured debugging methodology. Use when investigating bugs or unexpected behavior.
---

# Systematic Debugging

## Phase 1: Reproduce
- Identify exact conditions
- Create minimal reproduction

## Phase 2: Isolate
- Binary search to narrow scope
- Check recent changes

## Phase 3: Analyze
- Add logging at key points
- Check assumptions

## Phase 4: Fix & Verify
- Make minimal change
- Verify original issue resolved
```

---

## 9. code-review

コードレビュー自動化。

```yaml
---
name: code-review
description: Comprehensive code review with security, performance, and maintainability checks. Use when reviewing PRs or code changes.
---

# Code Review Skill

## Checklist
1. Security vulnerabilities
2. Performance issues
3. Code style consistency
4. Test coverage
5. Documentation

## Output Format
- Summary of changes
- Issues found (Critical/Warning/Info)
- Suggestions for improvement
```

---

## 10. lesson-plan-generator

教育コンテンツ・レッスンプランの生成。

```yaml
---
name: lesson-plan-generator
description: Generate comprehensive, ready-to-publish lesson plans when provided with a topic. Creates structured educational content with learning objectives, content outlines, interactive exercises, assessment quizzes, and instructor notes. Export as .docx or .pdf.
---

# Lesson Plan Generator

## Steps
1. Clarify scope (ask 3-5 questions)
2. Outline sections; confirm in 5 bullets
3. Draft with headings, definitions
4. Design exercises and quizzes
5. Add instructor notes and resources
```

**Source:** [Codecademy](https://www.codecademy.com/article/how-to-build-claude-skills)

---

## 11. infosec-policy-drafting

ISO 27001準拠のセキュリティポリシー作成。

```yaml
---
name: infosec-policy-drafting
description: Draft or update InfoSec policies aligned to ISO 27001. Use when creating security policies or procedures.
---

# InfoSec Policy Drafting

## Steps
1. Clarify scope (ask 3-5 questions if ambiguous)
2. Outline sections; confirm in 5 bullets
3. Draft with headings, definitions, RACI
4. Add ISO mappings + change log
5. Produce summary and next actions

## Outputs
- Policy (Markdown, headings, numbered sections)
- 200-word exec summary
- Review checklist
```

**Source:** [gend.co](https://www.gend.co/blog/claude-skills-claude-md-guide)

---

## 12. playwright-skill

ブラウザ自動化・E2Eテスト。

```yaml
---
name: playwright-skill
description: Browser automation and E2E testing with Playwright. Use when testing web applications or automating browser tasks.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Playwright Automation

## Setup
npm install playwright

## Common Patterns
- Page navigation
- Element interaction
- Screenshot capture
- Network interception
```

**Source:** [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)

---

## 13. ios-simulator-skill

iOSシミュレータでのアプリテスト。

```yaml
---
name: ios-simulator-skill
description: iOS app building, navigation, and testing through automation. Use when testing iOS apps.
---

# iOS Simulator Testing

## Commands
- xcrun simctl boot <device>
- xcrun simctl install <device> <app>
- xcrun simctl launch <device> <bundle-id>
```

**Source:** [conorluddy/ios-simulator-skill](https://github.com/conorluddy/ios-simulator-skill)

---

## 14. react-ui-patterns

Reactコンポーネントのベストプラクティス。

```yaml
---
name: react-ui-patterns
description: React UI patterns for loading states, error handling, empty states. Use when building React components.
---

# React UI Patterns

## Loading States
- Skeleton loaders
- Suspense boundaries
- Progressive loading

## Error Handling
- Error boundaries
- Fallback UI
- Retry mechanisms
```

---

## 15. graphql-schema

GraphQL API設計・クエリ構築。

```yaml
---
name: graphql-schema
description: GraphQL query construction, mutations, and code generation. Use when working with GraphQL APIs.
---

# GraphQL Schema Skill

## Query Patterns
- Fragments for reuse
- Variables for parameterization
- Pagination patterns
```

---

## 16. mcp-builder (Anthropic公式)

MCP（Model Context Protocol）サーバーの構築。

```yaml
---
name: mcp-builder
description: Guide for creating high-quality MCP servers to integrate external APIs and services.
---

# MCP Server Builder

## Structure
- Tool definitions
- Resource handlers
- Error handling
```

---

## 17. aws-skills

AWS CDKパターン・サーバーレス開発。

```yaml
---
name: aws-skills
description: AWS development patterns including CDK, serverless, and cost optimization.
---

# AWS Development Skills

## CDK Patterns
- Stack organization
- Construct patterns
- Cross-stack references

## Lambda Best Practices
- Cold start optimization
- Error handling
- Logging patterns
```

**Source:** [zxkane/aws-skills](https://github.com/zxkane/aws-skills)

---

## 18. n8n-skills

n8nワークフロー自動化。

```yaml
---
name: n8n-skills
description: Build flawless n8n workflows. Use when creating or debugging n8n automations.
---

# n8n Workflow Skills

## Patterns
- Webhook triggers
- Data transformation
- Error handling nodes
- Conditional logic
```

**Source:** [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills)

---

## 19. d3js-visualization

D3.jsデータビジュアライゼーション。

```yaml
---
name: claude-d3js-skill
description: Data visualizations using D3.js. Use when creating charts, graphs, or interactive visualizations.
---

# D3.js Visualization

## Chart Types
- Bar charts
- Line charts
- Scatter plots
- Force-directed graphs
```

**Source:** [chrisvoncsefalvay/claude-d3js-skill](https://github.com/chrisvoncsefalvay/claude-d3js-skill)

---

## 20. csv-data-summarizer

CSVデータの自動分析。

```yaml
---
name: csv-data-summarizer
description: Auto-analyze CSV files with statistical summaries and insights.
---

# CSV Data Summarizer

## Analysis Steps
1. Load and validate CSV
2. Detect data types
3. Calculate statistics
4. Identify patterns/anomalies
5. Generate summary report
```

**Source:** [coffeefuelbump/csv-data-summarizer-claude-skill](https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill)

---

## 21. git-commit (Conventional Commits)

Conventional Commits形式のコミット。

```yaml
---
name: git-commit
description: Generate Conventional Commits format messages. Use when committing changes.
---

# Git Commit Skill

## Format
<type>(<scope>): <description>

## Types
- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance
```

**Source:** [fvadicamo/dev-agent-skills](https://github.com/fvadicamo/dev-agent-skills)

---

## 22. github-pr-creation

GitHub PRの作成自動化。

```yaml
---
name: github-pr-creation
description: Create well-structured GitHub Pull Requests with proper descriptions and labels.
---

# GitHub PR Creation

## Template
- Summary of changes
- Related issues
- Test plan
- Screenshots (if UI changes)
```

---

## 23. reading-files-safely

読み取り専用のファイルアクセス。

```yaml
---
name: reading-files-safely
description: Read files without making changes. Use when you need read-only file access.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Safe File Reading

Only use Read, Grep, and Glob tools.
Never modify files in this mode.
```

---

## 24. brand-guidelines (Anthropic公式)

ブランドガイドライン適用。

```yaml
---
name: brand-guidelines
description: Apply Anthropic's official brand colors and typography to artifacts.
---

# Brand Guidelines

## Colors
- Primary: #DA7756
- Secondary: #5F6D58
- Background: #FAF9F7

## Typography
- Headers: Inter Bold
- Body: Inter Regular
```

---

## 25. algorithmic-art (Anthropic公式)

p5.jsでジェネラティブアート生成。

```yaml
---
name: algorithmic-art
description: Create generative art using p5.js with seeded randomness, flow fields, and particle systems.
---

# Algorithmic Art

## Techniques
- Flow fields
- Particle systems
- Perlin noise
- Seeded randomness for reproducibility
```

---

## 26. slack-gif-creator (Anthropic公式)

Slack用GIF作成（サイズ最適化）。

```yaml
---
name: slack-gif-creator
description: Create animated GIFs optimized for Slack's size constraints.
---

# Slack GIF Creator

## Constraints
- Max size: 128KB for emoji
- Max dimensions: 128x128px
- Optimize frame count
```

---

## 27. webapp-testing (Anthropic公式)

PlaywrightでのWebアプリテスト。

```yaml
---
name: webapp-testing
description: Test local web applications using Playwright for UI verification and debugging.
---

# Web App Testing

## Test Flow
1. Start local server
2. Navigate to pages
3. Interact with elements
4. Capture screenshots
5. Verify assertions
```

---

## 28. internal-comms (Anthropic公式)

社内コミュニケーション文書作成。

```yaml
---
name: internal-comms
description: Write internal communications like status reports, newsletters, and FAQs.
---

# Internal Communications

## Document Types
- Status reports
- Team newsletters
- FAQ documents
- Announcement templates
```

---

## 29. superpowers (コミュニティ人気)

20以上のバトルテスト済みスキル集。TDD、デバッグ、コラボレーション。

```yaml
---
name: superpowers
description: Core skills library with 20+ battle-tested skills including TDD, debugging, and collaboration patterns.
---

# Superpowers Skill Library

## Included Skills
- /brainstorm - Idea generation
- /write-plan - Implementation planning
- /execute-plan - Plan execution
- skills-search tool for finding relevant skills
```

**Source:** [obra/superpowers](https://github.com/obra/superpowers)

---

## 30. loki-mode (コミュニティ注目)

37のAIエージェントを6つのスウォームで管理するスタートアップ構築システム。

```yaml
---
name: loki-mode
description: Multi-agent autonomous startup system - orchestrates 37 AI agents across 6 swarms to build, deploy, and operate a complete startup.
---

# Loki Mode

## Swarms
- Product Development
- Marketing
- Sales
- Operations
- Finance
- Engineering
```

**Source:** [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)

---

## 31. planning-with-files

Manus式の永続マークダウン計画。$2B買収のワークフローパターン。

```yaml
---
name: planning-with-files
description: Persistent markdown planning workflow. Create task_plan.md before starting any work. Save findings after every 2 operations.
---

# Planning with Files

## Core Rules
1. Create Plan First - Never start without task_plan.md
2. The 2-Action Rule - Save findings after every 2 view/browser operations
3. Use markdown as working memory on disk
```

**Source:** [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)

---

## 32. iac-terraform

Terraform/Terragruntによるインフラストラクチャ管理。

```yaml
---
name: iac-terraform
description: Infrastructure as Code with Terraform and Terragrunt. Create, validate, troubleshoot, and manage Terraform configurations, modules, and state.
---

# Terraform IaC Skill

## Capabilities
- Module creation and validation
- State inspection and management
- Troubleshooting guide
- Best practices enforcement
```

**Source:** [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills)

---

## 33. k8s-troubleshooter

Kubernetesトラブルシューティング・インシデント対応。

```yaml
---
name: k8s-troubleshooter
description: Systematic Kubernetes troubleshooting and incident response. Diagnose pod failures, cluster issues, and performance problems.
---

# Kubernetes Troubleshooter

## Diagnostic Flow
1. Cluster health check
2. Pod diagnostics
3. Network analysis
4. Resource constraints check
5. Incident response playbook
```

**Source:** [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills)

---

## 34. aws-cost-optimization

AWSコスト最適化・FinOps。

```yaml
---
name: aws-cost-optimization
description: AWS cost optimization and FinOps workflows. Identify savings opportunities with automated analysis.
---

# AWS Cost Optimization

## Analysis Areas
- Reserved Instance recommendations
- Unused resources detection
- Right-sizing opportunities
- Storage optimization
```

**Source:** [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills)

---

## 35. ci-cd

CI/CDパイプライン設計・最適化。

```yaml
---
name: ci-cd
description: CI/CD pipeline design, optimization, security, and troubleshooting across GitHub Actions, GitLab CI, and other platforms.
---

# CI/CD Pipeline Skill

## Platforms
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

## Focus Areas
- Build optimization
- Security scanning
- Deployment strategies
```

**Source:** [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills)

---

## 36. gitops-workflows

ArgoCD/Flux CDによるGitOps。

```yaml
---
name: gitops-workflows
description: GitOps workflows with ArgoCD and Flux CD. Modern secrets management and production-ready templates.
---

# GitOps Workflows

## Tools
- ArgoCD configuration
- Flux CD setup
- Secrets management (SOPS, Sealed Secrets)
- Sync strategies
```

**Source:** [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills)

---

## 37. monitoring-observability

モニタリング・可観測性戦略。

```yaml
---
name: monitoring-observability
description: Monitoring and observability strategy and implementation. Metrics analysis, alert validation, and SLO calculations.
---

# Monitoring & Observability

## Components
- Metrics collection (Prometheus)
- Log aggregation (Loki, ELK)
- Tracing (Jaeger, Zipkin)
- Alerting rules
- SLO/SLI definition
```

**Source:** [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills)

---

## 38. sre-skill

SRE視点でのKubernetesインシデント調査・根本原因分析。

```yaml
---
name: sre-skill
description: Systematic investigation and root cause analysis of Kubernetes incidents from an SRE perspective.
---

# SRE Skill

## Investigation Flow
1. Incident timeline construction
2. Log correlation
3. Metrics analysis
4. Root cause identification
5. Post-mortem documentation
```

**Source:** [geored/sre-skill](https://github.com/geored/sre-skill)

---

## 39. context-engineering

コンテキストエンジニアリング・マルチエージェントシステム設計。

```yaml
---
name: context-engineering
description: Master context optimization, degradation patterns, memory architectures, and multi-agent systems.
---

# Context Engineering

## Topics
- Context anatomy in agent systems
- Degradation pattern recognition
- Compression strategies
- Memory architectures (short/long-term)
- Multi-agent coordination
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 40. backend-development

バックエンドシステム構築（Node.js, Python, Go, Rust）。

```yaml
---
name: backend-development
description: Build robust backend systems with Node.js, Python, Go, Rust. Covers APIs, databases, security (OWASP Top 10), and DevOps.
---

# Backend Development

## Frameworks
- NestJS, FastAPI, Django, Gin, Actix

## Topics
- API design
- Database optimization
- Authentication/Authorization
- Microservices patterns
- Docker/Kubernetes deployment
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 41. frontend-design (Anthropic公式)

フロントエンドデザイン・UI/UX開発。

```yaml
---
name: frontend-design
description: Frontend design and UI/UX development. Avoid generic aesthetics and make bold design decisions. Works well with React & Tailwind.
---

# Frontend Design

## Typography
- Avoid generic fonts
- Use contrast and size variation

## Color & Theme
- Consistent themes
- CSS variables for theming
- Accessible color contrast
```

---

## 42. theme-factory (Anthropic公式)

プロフェッショナルなテーマ適用・カスタムテーマ生成。

```yaml
---
name: theme-factory
description: Style artifacts with professional themes or generate custom themes.
---

# Theme Factory

## Capabilities
- Apply preset themes
- Generate custom color palettes
- Maintain consistency across components
```

---

## 43. web-artifacts-builder (Anthropic公式)

React/Tailwind/shadcn-uiでHTML Artifactを構築。

```yaml
---
name: web-artifacts-builder
description: Build complex claude.ai HTML artifacts using React, Tailwind CSS, and shadcn/ui components.
---

# Web Artifacts Builder

## Stack
- React components
- Tailwind CSS styling
- shadcn/ui components
- Responsive design
```

---

## 44. canvas-design (Anthropic公式)

PNG/PDF形式のビジュアルデザイン作成。

```yaml
---
name: canvas-design
description: Design beautiful visual art in .png and .pdf formats using design philosophies.
---

# Canvas Design

## Output Formats
- PNG for web
- PDF for print
- SVG for scalable graphics
```

---

## 45. prompt-review

プロンプトパターン分析・改善。

```yaml
---
name: prompt-review
description: Analyze your prompting patterns with focus on outcome velocity - getting work done fast with minimal rework.
---

# Prompt Review

## Commands
- /prompt-review - Full audit of all history
- /prompt-review last - Analyze most recent session
- /prompt-review reset - Clear profile

## Metrics
- Rework chains
- Ship rates
- Velocity scores
```

**Source:** [aslobodnik/claude-skills](https://github.com/aslobodnik/claude-skills)

---

## 46. sequential-thinking

ステップバイステップの推論・動的スコープ調整。

```yaml
---
name: sequential-thinking
description: Step-by-step reasoning with revision and dynamic scope adjustment.
---

# Sequential Thinking

## Process
1. Break down problem
2. Reason through each step
3. Revise if needed
4. Adjust scope dynamically
5. Synthesize conclusion
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 47. mermaidjs-v11

Mermaid.jsで24種類以上のダイアグラム作成。

```yaml
---
name: mermaidjs-v11
description: Create 24+ diagram types including flowcharts, sequence diagrams, architecture diagrams, and more.
---

# Mermaid.js Diagrams

## Diagram Types
- Flowcharts
- Sequence diagrams
- Class diagrams
- State diagrams
- Entity-relationship diagrams
- Gantt charts
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 48. chrome-devtools

Puppeteerベースのブラウザ自動化・パフォーマンス分析。

```yaml
---
name: chrome-devtools
description: Puppeteer-based browser automation, screenshots, and performance analysis.
---

# Chrome DevTools Automation

## Features
- Page screenshots
- Network analysis
- Performance profiling
- Console log capture
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 49. better-auth

TypeScript認証フレームワーク（OAuth, 2FA, Passkey対応）。

```yaml
---
name: better-auth
description: TypeScript authentication framework supporting email/password, OAuth, 2FA, passkeys, and multi-tenancy.
---

# Better Auth

## Features
- Email/password auth
- OAuth providers
- Two-factor authentication
- Passkey support
- Multi-tenant architecture
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 50. ai-multimodal

Google Gemini APIでマルチモーダル処理（2Mトークンコンテキスト）。

```yaml
---
name: ai-multimodal
description: Process audio, images, videos, documents using Google Gemini API with 2M token context windows.
---

# AI Multimodal Processing

## Supported Types
- Audio transcription
- Image analysis
- Video understanding
- Document processing
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 51. shopify

Shopifyアプリ・拡張機能・テーマ開発。

```yaml
---
name: shopify
description: Build Shopify apps, extensions, and themes using GraphQL/REST APIs.
---

# Shopify Development

## Areas
- App development
- Theme customization
- Storefront API
- Admin API
- Checkout extensions
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 52. docs-seeker

インテリジェントなドキュメント検索（llms.txt活用）。

```yaml
---
name: docs-seeker
description: Intelligent documentation discovery using llms.txt and repository analysis.
---

# Documentation Seeker

## Process
1. Check llms.txt
2. Analyze repository structure
3. Identify key documentation
4. Extract relevant sections
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 53. repomix

リポジトリをAIフレンドリーなファイルにパッケージング。

```yaml
---
name: repomix
description: Package repositories into AI-friendly files for context loading.
---

# Repomix

## Features
- Repository serialization
- Token-efficient formatting
- Selective file inclusion
- Metadata extraction
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 54. media-processing

FFmpeg/ImageMagickでのメディア処理。

```yaml
---
name: media-processing
description: FFmpeg and ImageMagick for multimedia handling - video conversion, image manipulation, audio processing.
---

# Media Processing

## Tools
- FFmpeg for video/audio
- ImageMagick for images

## Operations
- Format conversion
- Compression
- Resizing/cropping
- Watermarking
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 55. defense-in-depth

多層防御セキュリティアプローチ。

```yaml
---
name: defense-in-depth
description: Multi-layered security practices with validation at every layer, entry checks, and comprehensive logging.
---

# Defense in Depth

## Layers
1. Input validation
2. Authentication/Authorization
3. Business logic checks
4. Data layer protection
5. Audit logging
```

**Source:** [obra/superpowers](https://github.com/obra/superpowers)

---

## 56. root-cause-tracing

バグの根本原因追跡。

```yaml
---
name: root-cause-tracing
description: Trace bugs backward through call stacks to identify fundamental problems.
---

# Root Cause Tracing

## Steps
1. Identify symptom
2. Trace call stack
3. Check data flow
4. Identify root cause
5. Verify fix addresses root, not symptom
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 57. verification-before-completion

完了前の検証チェック。

```yaml
---
name: verification-before-completion
description: Verify outputs before claiming success. Prevents false completion claims.
---

# Verification Before Completion

## Checklist
- [ ] Code compiles/runs
- [ ] Tests pass
- [ ] Edge cases handled
- [ ] Documentation updated
- [ ] No regressions
```

**Source:** [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills)

---

## 58. dispatching-parallel-agents

複数サブエージェントの並列調整。

```yaml
---
name: dispatching-parallel-agents
description: Coordinate multiple simultaneous Claude agents for parallel task execution.
---

# Parallel Agent Dispatch

## Pattern
1. Decompose task into independent subtasks
2. Spawn subagents for each
3. Coordinate results
4. Merge outputs
```

**Source:** [obra/superpowers](https://github.com/obra/superpowers)

---

## 59. brainstorming

クリエイティブなアイデア生成セッション。

```yaml
---
name: brainstorming
description: Facilitate creative idea generation sessions with structured exploration.
---

# Brainstorming

## Techniques
- Divergent thinking
- Mind mapping
- "Yes, and..." building
- Constraint removal
- Cross-domain inspiration
```

**Source:** [obra/superpowers](https://github.com/obra/superpowers)

---

## 60. writing-plans

マイルストーン付き構造化計画。

```yaml
---
name: writing-plans
description: Create strategic documentation with milestones and structured planning.
---

# Writing Plans

## Structure
1. Goal definition
2. Milestone breakdown
3. Task decomposition
4. Dependencies mapping
5. Risk assessment
```

**Source:** [obra/superpowers](https://github.com/obra/superpowers)

---

## 61. executing-plans

チェックポイント付き計画実行。

```yaml
---
name: executing-plans
description: Execute structured plans with checkpoints and verification steps.
---

# Executing Plans

## Process
1. Load plan
2. Execute step
3. Verify completion
4. Update progress
5. Handle blockers
```

**Source:** [obra/superpowers](https://github.com/obra/superpowers)

---

## 62. test-driven-development

テストファースト開発。

```yaml
---
name: test-driven-development
description: Write tests before implementing code. Red-Green-Refactor cycle.
---

# Test-Driven Development

## Cycle
1. Red: Write failing test
2. Green: Write minimal code to pass
3. Refactor: Improve code quality
4. Repeat
```

**Source:** [obra/superpowers](https://github.com/obra/superpowers)

---

## 63. subagent-driven-development

サブエージェント協調開発。

```yaml
---
name: subagent-driven-development
description: Coordinate multiple Claude agents for complex development tasks.
---

# Subagent-Driven Development

## Roles
- Architect agent
- Implementation agent
- Test agent
- Review agent
```

---

## 64. linear-claude-skill

LinearでのIssue/Project管理（MCP連携）。

```yaml
---
name: linear-claude-skill
description: Manage Linear issues, projects, and teams with MCP tools integration.
---

# Linear Integration

## Capabilities
- Create/update issues
- Manage projects
- Track cycles
- Team coordination
```

**Source:** [wrsmith108/linear-claude-skill](https://github.com/wrsmith108/linear-claude-skill)

---

## 65. varlock-claude-skill

安全な環境変数管理。

```yaml
---
name: varlock-claude-skill
description: Secure environment variable management ensuring secrets safety.
---

# Varlock

## Features
- Secrets detection
- Secure storage
- Access control
- Audit logging
```

**Source:** [wrsmith108/varlock-claude-skill](https://github.com/wrsmith108/varlock-claude-skill)

---

## 66. postgres

PostgreSQLへの安全な読み取り専用クエリ。

```yaml
---
name: postgres
description: Execute safe read-only SQL queries against PostgreSQL databases with multi-connection support.
allowed-tools:
  - Bash
---

# PostgreSQL Skill

## Safety
- Read-only queries only
- Connection pooling
- Query timeout limits
```

**Source:** [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills)

---

## 67. imagen

Google Gemini APIで画像生成。

```yaml
---
name: imagen
description: Generate images using Google Gemini API for UI mockups and icons.
---

# Imagen

## Use Cases
- UI mockups
- Icon generation
- Illustration creation
- Concept visualization
```

**Source:** [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills)

---

## 68. deep-research

Gemini Deep Researchで自律マルチステップリサーチ。

```yaml
---
name: deep-research
description: Execute autonomous multi-step research using Gemini Deep Research.
---

# Deep Research

## Process
1. Define research question
2. Generate search queries
3. Synthesize findings
4. Produce report
```

**Source:** [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills)

---

## 69. ffuf-web-fuzzing

ffufでWebファジング。

```yaml
---
name: ffuf-web-fuzzing
description: Expert guidance for ffuf web fuzzing during penetration testing, including authenticated fuzzing with raw requests.
---

# FFUF Web Fuzzing

## Modes
- Directory fuzzing
- Parameter fuzzing
- Virtual host discovery
- Authenticated testing
```

**Source:** [jthack/ffuf_claude_skill](https://github.com/jthack/ffuf_claude_skill)

---

## 70. threat-hunting-with-sigma-rules

Sigmaルールで脅威ハンティング。

```yaml
---
name: threat-hunting-with-sigma-rules
description: Use Sigma rules for threat detection and security monitoring.
---

# Threat Hunting

## Process
1. Load Sigma rules
2. Parse log sources
3. Match patterns
4. Alert on detections
```

**Source:** [jthack/threat-hunting-with-sigma-rules-skill](https://github.com/jthack/threat-hunting-with-sigma-rules-skill)

---

## 71. notebooklm-skill

NotebookLMでドキュメントベースの対話。

```yaml
---
name: notebooklm-skill
description: Interact with NotebookLM for document-based conversations and source-grounded responses.
---

# NotebookLM Integration

## Features
- Document upload
- Source-grounded chat
- Citation tracking
```

**Source:** [PleasePrompto/notebooklm-skill](https://github.com/PleasePrompto/notebooklm-skill)

---

## 72. claude-epub-skill

EPUB電子書籍の解析。

```yaml
---
name: claude-epub-skill
description: Parse and analyze EPUB eBooks, extract chapters and content.
---

# EPUB Processing

## Capabilities
- Chapter extraction
- Metadata reading
- Content search
- Format conversion
```

**Source:** [smerchek/claude-epub-skill](https://github.com/smerchek/claude-epub-skill)

---

## 73. youtube-transcript

YouTube動画のトランスクリプト取得・要約。

```yaml
---
name: youtube-transcript
description: Fetch and summarize YouTube video transcripts.
---

# YouTube Transcript

## Features
- Transcript extraction
- Auto-summarization
- Key points extraction
- Timestamp navigation
```

---

## 74. article-extractor

Webアーティクルのコンテンツ抽出。

```yaml
---
name: article-extractor
description: Extract full content from web articles, removing ads and navigation.
---

# Article Extractor

## Output
- Clean text content
- Metadata (author, date)
- Images
- Reading time estimate
```

---

## 75. file-organizer

ファイル構造の整理・リネーム。

```yaml
---
name: file-organizer
description: Clean up file structures, rename documents intelligently based on content.
---

# File Organizer

## Operations
- Content-based naming
- Directory restructuring
- Duplicate detection
- Archive management
```

---

## 76. invoice-organizer

請求書の解析・分類。

```yaml
---
name: invoice-organizer
description: Parse and categorize invoices for tax preparation.
---

# Invoice Organizer

## Features
- PDF parsing
- Amount extraction
- Category assignment
- Tax report generation
```

---

## 77. tapestry

ドキュメント間リンク・ナレッジグラフ構築。

```yaml
---
name: tapestry
description: Build a linked knowledge graph from documents with interlinking and summarization.
---

# Tapestry

## Features
- Document linking
- Concept extraction
- Graph visualization
- Cross-reference navigation
```

---

## 78. kaizen

継続的改善メソドロジー。

```yaml
---
name: kaizen
description: Continuous improvement methodology based on Japanese Kaizen philosophy and Lean principles.
---

# Kaizen

## Principles
- Continuous small improvements
- Eliminate waste (Muda)
- Respect for people
- Go and see (Gemba)
```

**Source:** [NeoLabHQ/context-engineering-kit](https://github.com/NeoLabHQ/context-engineering-kit)

---

## 79. claude-scientific-skills

125以上の科学研究スキル（バイオインフォマティクス等）。

```yaml
---
name: claude-scientific-skills
description: 125+ skills for bioinformatics, cheminformatics, and scientific research.
---

# Scientific Skills

## Domains
- Bioinformatics
- Cheminformatics
- Data analysis
- Literature review
- Experiment design
```

**Source:** [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills)

---

## 80. getsentry-code-review

Sentryチームのコードレビュースキル。

```yaml
---
name: getsentry-code-review
description: Perform code reviews following Sentry team's best practices.
---

# Sentry Code Review

## Focus Areas
- Error handling patterns
- Performance implications
- Security considerations
- Sentry SDK integration
```

**Source:** [getsentry/skills](https://github.com/getsentry)

---

## 81. code-review-skill (多言語対応)

React 19, Vue 3, Rust, TypeScript, Java, Python, Go対応のコードレビュー。

```yaml
---
name: code-review-skill
description: Comprehensive code review covering React 19, Vue 3, Rust, TypeScript, Java, Python, Go, CSS, architecture design, and performance optimization.
---

# Code Review Skill

## Supported Languages
- React 19 (Hooks, Actions, Server Components)
- Vue 3 (Composition API)
- Rust (Ownership, unsafe, async)
- TypeScript/JavaScript
- Java 17/21 (Spring Boot 3)
- Python (async, pytest)
- Go (goroutines, channels)
```

**Source:** [awesome-skills/code-review-skill](https://github.com/awesome-skills/code-review-skill)

---

## 82. obsidian-plugin-skill

Obsidianプラグイン開発ガイド。

```yaml
---
name: obsidian-plugin-skill
description: Comprehensive Obsidian plugin development with ESLint rules, submission requirements, memory management, security, and accessibility.
---

# Obsidian Plugin Development

## Reference Files
- memory-management.md
- type-safety.md
- ui-ux.md
- accessibility.md
- submission.md
```

**Source:** [gapmiss/obsidian-plugin-skill](https://github.com/gapmiss/obsidian-plugin-skill)

---

## 83. obsidian-files

Obsidian互換ファイル作成・編集。

```yaml
---
name: obsidian-files
description: Create and edit Obsidian-compatible plain text files including Markdown (.md), Bases (.base), and JSON Canvas (.canvas).
---

# Obsidian Files Skill

## Supported Formats
- Obsidian Flavored Markdown (.md)
- Obsidian Bases (.base)
- JSON Canvas (.canvas)
```

**Source:** [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)

---

## 84. supabase-operations

Supabase API操作（データベース、認証、ストレージ）。

```yaml
---
name: supabase-operations
description: Comprehensive Supabase API operations including database CRUD, authentication, storage, realtime subscriptions, and edge functions.
---

# Supabase Operations

## Capabilities
- Database Operations (CRUD, RPC)
- Authentication (sign up/in/out)
- Storage (file uploads, buckets)
- Realtime (WebSocket subscriptions)
- Edge Functions
```

**Source:** [Nice-Wolf-Studio/claude-code-supabase-skills](https://github.com/Nice-Wolf-Studio/claude-code-supabase-skills)

---

## 85. brand-voice

マーケティング用ブランドボイス一貫性チェック。

```yaml
---
name: brand-voice
description: Ensures consistent tone across all marketing materials. Analyzes and maintains brand voice consistency.
---

# Brand Voice Skill

## Features
- Tone analysis
- Voice consistency checking
- Style guide enforcement
```

**Source:** [TheVibeMarketer](https://www.thevibemarketer.com/skills)

---

## 86. positioning-angles

8つのフレームワークで差別化フック発見。

```yaml
---
name: positioning-angles
description: 8 frameworks to surface differentiated hooks before you write a word. Find unique market positioning.
---

# Positioning Angles

## Frameworks
- Competitor gap analysis
- Customer pain points
- Unique value proposition
- Market positioning
```

**Source:** [TheVibeMarketer](https://www.thevibemarketer.com/skills)

---

## 87. keyword-research

6 Circles Methodでコンテンツ戦略立案。

```yaml
---
name: keyword-research
description: Strategic content planning using the 6 Circles Method for SEO keyword research.
---

# Keyword Research

## Method
- Seed keyword expansion
- Competition analysis
- Search intent mapping
- Content gap identification
```

**Source:** [TheVibeMarketer](https://www.thevibemarketer.com/skills)

---

## 88. direct-response-copy

ランディングページ・広告・セールスページのコピー作成。

```yaml
---
name: direct-response-copy
description: Landing pages, ads, sales pages that convert. Based on Schwartz, Hopkins, and Ogilvy principles.
---

# Direct Response Copy

## Document Types
- Landing pages
- Ad copy
- Sales pages
- Email sequences
```

**Source:** [TheVibeMarketer](https://www.thevibemarketer.com/skills)

---

## 89. content-atomizer

1つのコンテンツを15バリエーションに展開。

```yaml
---
name: content-atomizer
description: Transforms one piece of content into 15 variations across channels.
---

# Content Atomizer

## Output Channels
- Blog post
- Twitter threads
- LinkedIn posts
- Instagram captions
- Email newsletter
- Video scripts
```

**Source:** [TheVibeMarketer](https://www.thevibemarketer.com/skills)

---

## 90. api-design

REST/GraphQL API設計ベストプラクティス。

```yaml
---
name: api-design
description: REST and GraphQL API design principles for intuitive, scalable, and maintainable APIs.
---

# API Design Skill

## Topics
- REST best practices
- GraphQL schema design
- Versioning strategies
- Error handling
- OpenAPI documentation
```

**Source:** [claude-plugins.dev](https://claude-plugins.dev/skills/@akaszubski/autonomous-dev/api-design)

---

## 91. automating-api-testing

REST/GraphQL APIテスト自動生成・実行。

```yaml
---
name: automating-api-testing
description: Automatically generate and execute comprehensive API tests for REST and GraphQL endpoints with OpenAPI contract testing.
---

# API Test Automation

## Workflow
1. Parse OpenAPI/Swagger files
2. Generate test cases (CRUD, auth, errors)
3. Execute tests
4. Validate responses
```

**Source:** [claude-plugins.dev](https://claude-plugins.dev/skills/@jeremylongshore/claude-code-plugins-plus/api-test-automation)

---

## 92. postman-skill

Postman APIスペック作成・管理。

```yaml
---
name: postman-skill
description: Create and manage API specifications (OpenAPI 3.0, AsyncAPI 2.0) with Postman. Generate collections from specs.
---

# Postman Skill

## Features
- OpenAPI 3.0 support
- AsyncAPI 2.0 support
- Multi-file specs
- Collection generation
```

**Source:** [SterlingChin/postman-claude-skill](https://github.com/SterlingChin/postman-claude-skill)

---

## 93. blockchain-developer

スマートコントラクト・DApp・DeFi開発。

```yaml
---
name: blockchain-developer
description: Expert blockchain developer specializing in smart contract development, DApp architecture, and DeFi protocols. Masters Solidity, Web3 integration, and blockchain security.
---

# Blockchain Developer

## Expertise
- Solidity smart contracts
- DeFi protocol design
- NFT implementations
- Gas optimization
- Security auditing
```

**Source:** [claude-plugins.dev](https://claude-plugins.dev/skills/@zenobi-us/dotfiles/blockchain-developer)

---

## 94. web3-blockchain-manager

Web3ネットワーク操作・ウォレット管理。

```yaml
---
name: web3-blockchain-manager
description: Interact with decentralized networks, manage digital assets, query wallet balances, track transactions, and execute contract calls.
---

# Web3 Blockchain Manager

## Capabilities
- Wallet balance queries
- Transaction tracking
- Contract calls
- Asset management
```

**Source:** [mcpmarket.com](https://mcpmarket.com/tools/skills/web3-blockchain-manager)

---

## 95. game-developer

Unity/Unreal/Webゲーム開発。

```yaml
---
name: game-developer
description: Build games with Unity, Unreal Engine, or web technologies. Implements game mechanics, physics, AI, and optimization.
---

# Game Developer

## Engines
- Unity
- Unreal Engine
- Web (Canvas, WebGL)

## Focus
- Game mechanics
- Physics systems
- AI behavior
- Performance optimization
```

**Source:** [buildwithclaude.com](https://www.buildwithclaude.com/subagent/game-developer)

---

## 96. godot-game-development

Godot Engineゲーム開発。

```yaml
---
name: godot-game-development
description: Streamlines Godot Engine development by automating scene management, GDScript authoring, and project orchestration.
---

# Godot Game Development

## Features
- Scene management
- GDScript authoring
- Project orchestration
- Asset pipeline
```

**Source:** [mcpmarket.com](https://mcpmarket.com/tools/skills/godot-game-development-1)

---

## 97. python-alchemist

Pythonエキスパート開発。

```yaml
---
name: python-alchemist
description: Expert Python development covering async, type annotations, pytest, FastAPI, Django, and data science libraries.
---

# Python Alchemist

## Expertise
- Async/await patterns
- Type annotations
- FastAPI/Django
- Data science (pandas, numpy)
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 98. rust-evangelist

Rustメモリ安全システム開発。

```yaml
---
name: rust-evangelist
description: Memory-safe systems code with Rust. Ownership patterns, unsafe code review, async/await, and error handling.
---

# Rust Evangelist

## Focus
- Ownership patterns
- Unsafe code audit
- Async programming
- Error handling (thiserror, anyhow)
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 99. golang-guru

Go並行処理・スケーラブルサービス。

```yaml
---
name: golang-guru
description: Concurrent services that scale with Go. Error handling, goroutines/channels, and context propagation.
---

# Golang Guru

## Expertise
- Goroutines & channels
- Context propagation
- Error handling patterns
- Performance optimization
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 100. typescript-sage

型安全なTypeScript開発。

```yaml
---
name: typescript-sage
description: Type-safe JavaScript with TypeScript. Advanced type patterns, generics, and common pitfalls.
---

# TypeScript Sage

## Topics
- Advanced type patterns
- Generics
- Type guards
- Utility types
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 101. react-wizard

Reactアプリケーション開発エキスパート。

```yaml
---
name: react-wizard
description: React applications expertise including hooks, Server Components, Suspense, and React 19 features.
---

# React Wizard

## Expertise
- React 19 features
- Server Components
- Suspense & Streaming
- State management
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 102. nextjs-architect

Next.jsフルスタック開発。

```yaml
---
name: nextjs-architect
description: Next.js full-stack development with App Router, Server Actions, and API routes.
---

# Next.js Architect

## Focus
- App Router
- Server Actions
- API routes
- Edge runtime
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 103. vue-virtuoso

Vue 3リアクティブインターフェース。

```yaml
---
name: vue-virtuoso
description: Vue.js reactive interfaces with Composition API, reactivity system, and Vue 3 patterns.
---

# Vue Virtuoso

## Expertise
- Composition API
- Reactivity system
- defineProps/defineEmits
- Pinia state management
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 104. svelte-sorcerer

Svelteフレームワーク専門家。

```yaml
---
name: svelte-sorcerer
description: Svelte framework specialist with SvelteKit, stores, and reactive declarations.
---

# Svelte Sorcerer

## Topics
- SvelteKit
- Stores
- Reactive declarations
- Transitions
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 105. tailwind-artist

Tailwind CSSスタイリング。

```yaml
---
name: tailwind-artist
description: Tailwind CSS styling expert with responsive design, custom configurations, and component patterns.
---

# Tailwind Artist

## Skills
- Responsive design
- Custom configurations
- Component patterns
- Dark mode
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 106. aws-architect

AWSインフラソリューション設計。

```yaml
---
name: aws-architect
description: AWS infrastructure solutions including EC2, Lambda, S3, RDS, and cost optimization strategies.
---

# AWS Architect

## Services
- EC2, Lambda, ECS
- S3, RDS, DynamoDB
- CloudFormation, CDK
- Cost optimization
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 107. kubernetes-pilot

Kubernetesコンテナオーケストレーション。

```yaml
---
name: kubernetes-pilot
description: Container orchestration mastery with Kubernetes. Deployments, services, ingress, and Helm charts.
---

# Kubernetes Pilot

## Expertise
- Deployments & StatefulSets
- Services & Ingress
- Helm charts
- RBAC & Security
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 108. docker-captain

Dockerコンテナ化。

```yaml
---
name: docker-captain
description: Docker containerization expert. Multi-stage builds, optimization, and Docker Compose.
---

# Docker Captain

## Skills
- Multi-stage builds
- Image optimization
- Docker Compose
- Security best practices
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 109. github-actions-pro

GitHub Actions自動化。

```yaml
---
name: github-actions-pro
description: GitHub Actions automation expert. CI/CD workflows, matrix builds, and reusable workflows.
---

# GitHub Actions Pro

## Topics
- CI/CD workflows
- Matrix builds
- Reusable workflows
- Secrets management
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 110. postgresql-guru

PostgreSQLデータベースエキスパート。

```yaml
---
name: postgresql-guru
description: PostgreSQL database expert. Query optimization, indexing, and performance tuning.
---

# PostgreSQL Guru

## Expertise
- Query optimization
- Indexing strategies
- Performance tuning
- Extensions (PostGIS, pgvector)
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 111. mongodb-master

MongoDB NoSQL専門家。

```yaml
---
name: mongodb-master
description: MongoDB NoSQL specialist. Schema design, aggregation pipelines, and performance optimization.
---

# MongoDB Master

## Skills
- Schema design
- Aggregation pipelines
- Indexing
- Sharding
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 112. redis-specialist

Redisインメモリデータストア。

```yaml
---
name: redis-specialist
description: In-memory data store expert. Caching strategies, pub/sub, and data structures.
---

# Redis Specialist

## Topics
- Caching strategies
- Pub/Sub
- Data structures
- Clustering
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 113. elasticsearch-expert

Elasticsearch検索エンジン。

```yaml
---
name: elasticsearch-expert
description: Search engine optimization with Elasticsearch. Query DSL, mappings, and aggregations.
---

# Elasticsearch Expert

## Expertise
- Query DSL
- Mappings & Analyzers
- Aggregations
- Performance tuning
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 114. playwright-pro

Playwrightクロスブラウザテスト。

```yaml
---
name: playwright-pro
description: Cross-browser testing with Playwright. E2E tests, visual regression, and API testing.
---

# Playwright Pro

## Features
- E2E testing
- Visual regression
- API testing
- Mobile emulation
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 115. cypress-champion

CypressE2Eテスト。

```yaml
---
name: cypress-champion
description: End-to-end testing with Cypress. Component testing, fixtures, and custom commands.
---

# Cypress Champion

## Topics
- E2E testing
- Component testing
- Fixtures
- Custom commands
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 116. jest-ninja

Jest JavaScriptユニットテスト。

```yaml
---
name: jest-ninja
description: JavaScript unit testing with Jest. Mocking, snapshots, and coverage.
---

# Jest Ninja

## Skills
- Mocking strategies
- Snapshot testing
- Coverage reports
- Async testing
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 117. chaos-engineer

カオスエンジニアリング・障害テスト。

```yaml
---
name: chaos-engineer
description: Failure testing specialist. Chaos experiments, resilience testing, and fault injection.
---

# Chaos Engineer

## Techniques
- Chaos experiments
- Fault injection
- Resilience testing
- Game days
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 118. threat-modeler

セキュリティ脅威分析。

```yaml
---
name: threat-modeler
description: Security threat analysis using STRIDE, attack trees, and risk assessment.
---

# Threat Modeler

## Methods
- STRIDE analysis
- Attack trees
- Risk assessment
- Mitigation strategies
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 119. accessibility-guardian

Webアクセシビリティ。

```yaml
---
name: accessibility-guardian
description: Web accessibility expert. WCAG compliance, screen reader testing, and keyboard navigation.
---

# Accessibility Guardian

## Standards
- WCAG 2.1 AA/AAA
- Screen reader compatibility
- Keyboard navigation
- Color contrast
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 120. performance-optimizer

パフォーマンス最適化。

```yaml
---
name: performance-optimizer
description: Speed optimization expert. Core Web Vitals, bundle analysis, and rendering optimization.
---

# Performance Optimizer

## Focus
- Core Web Vitals
- Bundle analysis
- Lazy loading
- Caching strategies
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 121. seo-specialist

SEO検索エンジン最適化。

```yaml
---
name: seo-specialist
description: Search engine optimization. Technical SEO, content optimization, and structured data.
---

# SEO Specialist

## Topics
- Technical SEO
- Content optimization
- Structured data
- Core Web Vitals
```

**Source:** [lodetomasi/agents-claude-code](https://github.com/lodetomasi/agents-claude-code)

---

## 122. office-pptx

PowerPoint作成・編集（HTML→PPTX変換）。

```yaml
---
name: office-pptx
description: Create presentations from scratch or templates, with HTML-to-PPTX conversion, slide rearrangement, and OOXML editing.
---

# Office PPTX Skill

## Features
- Slide creation
- Template usage
- HTML to PPTX
- OOXML manipulation
```

**Source:** [tfriedel/claude-office-skills](https://github.com/tfriedel/claude-office-skills)

---

## 123. office-docx

Word文書編集（変更履歴・赤入れ）。

```yaml
---
name: office-docx
description: Edit documents with tracked changes, OOXML manipulation, and redlining workflows.
---

# Office DOCX Skill

## Features
- Tracked changes
- Comment insertion
- Redlining workflows
- Format preservation
```

**Source:** [tfriedel/claude-office-skills](https://github.com/tfriedel/claude-office-skills)

---

## 124. office-xlsx

Excel財務モデル・数式・フォーマット。

```yaml
---
name: office-xlsx
description: Build financial models with formulas, formatting, and zero-error validation.
---

# Office XLSX Skill

## Features
- Formula-based models
- Professional formatting
- Data validation
- Chart creation
```

**Source:** [tfriedel/claude-office-skills](https://github.com/tfriedel/claude-office-skills)

---

## 125. office-pdf

PDFフォーム入力・結合・データ抽出。

```yaml
---
name: office-pdf
description: Fill forms, merge documents, extract data, and convert formats (PPTX to PDF, PDF to images).
---

# Office PDF Skill

## Operations
- Form filling
- Document merging
- Data extraction
- Format conversion
```

**Source:** [tfriedel/claude-office-skills](https://github.com/tfriedel/claude-office-skills)

---

## 126. revealjs-skill

Reveal.jsプロフェッショナルプレゼンテーション。

```yaml
---
name: revealjs-skill
description: Professional HTML presentation generation using Reveal.js framework.
---

# Reveal.js Skill

## Features
- Slide creation
- Themes
- Transitions
- Speaker notes
```

---

## 127. pinme

ゼロコンフィグフロントエンドデプロイ。

```yaml
---
name: pinme
description: Zero-config frontend deployment tool for quick hosting.
---

# Pinme

## Features
- Instant deployment
- Auto-configuration
- Preview URLs
```

---

## 128. plugin-authoring

Claude Codeプラグイン作成・デバッグ。

```yaml
---
name: plugin-authoring
description: Claude Code plugin creation and debugging guidance.
---

# Plugin Authoring

## Topics
- Plugin structure
- SKILL.md writing
- Testing plugins
- Publishing
```

---

## 129. security-scanner

コードセキュリティ脆弱性スキャン。

```yaml
---
name: security-scanner
description: Scans code for security vulnerabilities. Use when reviewing security, auditing code, or finding exploits.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Security Scanner

## Checks
- SQL injection
- XSS vulnerabilities
- CSRF risks
- Dependency vulnerabilities
```

---

## 130. updating-documentation

会話・コードベースからドキュメント自動更新。

```yaml
---
name: updating-documentation
description: Analyze conversation/codebase and intelligently distribute insights across documentation files.
---

# Updating Documentation

## Workflow
1. Analyze changes
2. Identify relevant docs
3. Update sections
4. Maintain consistency
```

**Source:** [dev.to/valgard](https://dev.to/valgard/claude-code-must-haves-january-2026-kem)

---

## 参考リソース

### 公式
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [anthropics/skills (GitHub)](https://github.com/anthropics/skills)
- [Introducing Agent Skills | Claude Blog](https://claude.com/blog/skills)

### コミュニティ Awesome Lists
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)
- [VoltAgent/awesome-claude-skills](https://github.com/VoltAgent/awesome-claude-skills)
- [heilcheng/awesome-agent-skills](https://github.com/heilcheng/awesome-agent-skills)

### スキルコレクション
- [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) - マーケティング・経営・エンジニアリング
- [levnikolaevich/claude-code-skills](https://github.com/levnikolaevich/claude-code-skills) - 84個のAgileワークフローSkills
- [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills) - ClaudeKit全スキル
- [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills) - DevOps特化
- [abubakarsiddik31/claude-skills-collection](https://github.com/abubakarsiddik31/claude-skills-collection) - 総合コレクション

### サンプル・テンプレート
- [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [obra/superpowers](https://github.com/obra/superpowers)

### 解説記事
- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Inside Claude Code Skills](https://mikhail.io/2025/10/claude-code-skills/)
- [How to Build Claude Skills (Codecademy)](https://www.codecademy.com/article/how-to-build-claude-skills)

---

*収集日: 2026-01-15*
