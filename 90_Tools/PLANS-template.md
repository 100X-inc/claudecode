<!--
PLANS TEMPLATE - Claude Code / Codex 両対応
=============================================
使い方:
1. このファイルを doc/plans/PLAN-{yyyymmdd_hhmm}-{feature}.md にコピー
   例: PLAN-20260115_1430-auth-feature.md
2. 各セクションを埋める（Purpose と Progress は必須）
3. 実装しながら Progress を更新
4. 完了時に Outcomes を記入

発動条件: 3ファイル以上の変更、新機能、リファクタリング
-->

# [Task Title: Short, Action-Oriented Description]

> **Status**: Draft | In Progress | Blocked | Completed
> **Created**: YYYY-MM-DD
> **Last Updated**: YYYY-MM-DD

This is a living document. Update `Progress`, `Surprises & Discoveries`, and `Decision Log` as work proceeds.

---

## Purpose / Big Picture

[Explain in 2-3 sentences what this change accomplishes and why it matters. State the user-visible outcome.]

**Success looks like**: [One sentence describing the observable result when complete]

---

## Context and Orientation

[Describe the current state of the codebase relevant to this task. Assume the reader has no prior knowledge.]

**Key files and modules**:
- `path/to/file.ts` - [brief description]
- `path/to/module/` - [brief description]

**Relevant documentation**: [links or file paths]

---

## Progress

Track completion with timestamps. Update as you work.

- [ ] Step 1: [description]
- [ ] Step 2: [description]
- [ ] Step 3: [description]

**Completed**:
- [x] (YYYY-MM-DD HH:MM) [description of completed step]

---

## Plan of Work

[Describe in prose the sequence of changes. For each change, specify the file and location (function, class, module).]

### Phase 1: [Phase Name]

[Narrative description of what will be done and why]

### Phase 2: [Phase Name]

[Narrative description]

---

## Concrete Steps

### Step 1: [Step Name]

**Working directory**: `project-root/`

**Commands**:
```bash
# command to run
```

**Expected output**:
```
[expected result]
```

### Step 2: [Step Name]

**File**: `path/to/file.ts`

**Change**: [describe the edit - what to add/modify/remove]

**Before**:
```typescript
// existing code
```

**After**:
```typescript
// modified code
```

---

## Validation and Acceptance

[Describe how to verify the implementation works correctly]

**Test commands**:
```bash
# run tests
npm test
# or
pytest
```

**Manual verification**:
1. [Step to verify behavior]
2. [Expected observation]

**Acceptance criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] All tests pass
- [ ] No regressions

---

## Surprises & Discoveries

[Document unexpected behaviors, bugs, optimizations, or insights discovered during implementation]

- **Observation**: [what you found]
  **Evidence**: [proof or context]
  **Impact**: [how it affects the plan]

---

## Decision Log

[Record every significant decision made while working on this plan]

| Date | Decision | Rationale | Author |
|------|----------|-----------|--------|
| YYYY-MM-DD | [decision made] | [why this choice] | [who decided] |

---

## Idempotence and Recovery

**Safe to retry?**: Yes / No / Partially

**Rollback procedure**:
```bash
# commands to undo changes if needed
git checkout -- path/to/file
```

**Known risks**:
- [risk and mitigation]

---

## Interfaces and Dependencies

**External dependencies**:
- `library@version` - [purpose]

**Internal interfaces**:
```typescript
// key types or interfaces being used/created
interface Example {
  field: Type;
}
```

**API contracts**: [describe any API boundaries]

---

## Artifacts and Notes

[Include important code snippets, terminal output, or references]

<details>
<summary>Terminal output from [command]</summary>

```
[output]
```

</details>

---

## Outcomes & Retrospective

[Fill this section upon completion or at major milestones]

**What was delivered**:
- [outcome 1]
- [outcome 2]

**Gaps or deferred work**:
- [what wasn't completed and why]

**Lessons learned**:
- [insight for future work]

**Time spent**: [actual time vs estimate if applicable]
