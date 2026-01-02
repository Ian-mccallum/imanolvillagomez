# Due Diligence

## Overview

**Prevent parallel technology. Build on shoulders of giants.** Before creating anything new, deeply explore Synova's existing systems. The most elegant solution often already exists — or is one connection away from existing components.

> **The Cardinal Sin:** Building parallel technology when Synova already has the capability. Every duplicate system is technical debt, maintenance burden, and cognitive overhead.

---

## Your Mission

Take the feature, plan, or idea from the conversation above and rigorously verify it doesn't duplicate existing Synova systems. If existing systems can fulfill the need — use them. If they can be extended — extend them. Only build new when nothing existing applies.

---

## ⚠️ CRITICAL: The No Parallel Technology Principle

```
❌ WRONG: "I need event publishing, let me create an EventBus"
   → Synova already has domain events in backend/app/domain/events/

❌ WRONG: "I need document search, let me build a search service"
   → Synova already has VaultService with semantic search

❌ WRONG: "I need AI capabilities, let me integrate directly with Ollama"
   → Synova already has AI Services Layer with 8 providers abstracted

❌ WRONG: "I need task approval, let me build an approval system"
   → Synova already has ApprovalGate and Priority Inbox

❌ WRONG: "I need audit logging, let me create a log table"
   → Synova already has Capsules with hash-chain integrity

✅ RIGHT: Search existing systems → Find the gap → Extend or connect
```

---

## Phase 1: Deep Exploration

### 1.1 Core Systems Inventory

**MANDATORY**: Before proposing ANY new code, verify understanding of these existing systems:

| System | Location | What It Does | Common Misses |
|--------|----------|--------------|---------------|
| **Capability System** | `backend/app/core/capabilities/` | 29 capabilities across 8 domains, intelligent orchestration | Building custom "dispatchers" |
| **Agent System** | `backend/app/core/agents/` | 13 specialized agents with OODA loops | Building custom AI workflows |
| **Tool System** | `backend/app/core/tools/` | 25+ atomic tools with security pipeline | Building unvalidated operations |
| **AI Services Layer** | `backend/app/core/ai_services/` | Provider-agnostic AI (chat, embed, vision, speech) | Direct provider integration |
| **Vault** | `backend/app/core/vault/` | Semantic search, RAG, document processing | Custom document handling |
| **Capsules** | `backend/app/core/capsules/` | Audit trail, hash chain, compliance export | Custom logging systems |
| **Governance** | `backend/app/core/governance/` | Policy engine, boot gates, verification | Custom permission systems |
| **Workflows** | `backend/app/core/workflows/` | Conductor orchestration, OODA execution | Custom task pipelines |
| **Checkpoints** | `backend/app/core/checkpoints/` | Human-in-the-loop approval workflows | Custom approval flows |
| **Organizational Memory** | `backend/app/core/organization/` | Learn from past goals, pgvector similarity | Custom pattern storage |
| **Domain Events** | `backend/app/domain/events/` | Event publishing and subscription | Custom event systems |
| **Notes/Notebook** | `backend/app/core/notes/` | Wikilinks, knowledge graph, trust tiers | Custom knowledge stores |

### 1.2 Frontend Systems Inventory

| System | Location | What It Does | Common Misses |
|--------|----------|--------------|---------------|
| **Command Palette** | `frontend/src/features/command-palette/` | Global keyboard navigation (⌘K) | Custom navigation systems |
| **Context Store** | `frontend/src/stores/` | Cross-feature state management | Custom state solutions |
| **Priority Inbox** | `frontend/src/features/inbox/` | High-velocity task approval | Custom approval UIs |
| **Wizard** | `frontend/src/features/wizard/` | Goal-to-workflow transformation | Custom wizard flows |
| **Admin Center** | `frontend/src/features/admin/` | Enterprise admin UI | Custom admin pages |
| **Shared Hooks** | `frontend/src/hooks/` | Common patterns (useStream, useAsync) | Custom hook duplication |
| **Motion System** | Motion library integration | Animations and micro-interactions | CSS-only animations |

### 1.3 Infrastructure Systems

| System | Location | What It Does | Common Misses |
|--------|----------|--------------|---------------|
| **Repository Pattern** | `backend/app/infrastructure/repositories/` | Clean data access | Direct database queries |
| **Settings System** | `backend/app/config/` | Configuration management | Hardcoded values |
| **Metrics** | Prometheus integration | Observability | Custom metrics |
| **Cache Layer** | Redis integration | Session, queue, events | Direct Redis calls |

---

## Phase 2: Systematic Search Protocol

### Step 1: Search Documentation First

```bash
# Search the documentation for related concepts
grep -r "{concept}" documentation/

# Check architecture docs
ls documentation/architecture/

# Check API docs
ls documentation/api/

# Check the README for overview
cat documentation/README.md | head -200
```

### Step 2: Search Specs for Prior Art

```bash
# Search for existing specs on this topic
grep -r "{concept}" specs/

# Check if there's already a spec
ls specs/ | grep -i "{related-term}"
```

### Step 3: Search Backend for Existing Code

```bash
# Search services
grep -r "{concept}" backend/app/core/services/

# Search domain models
grep -r "{concept}" backend/app/domain/models/

# Search for related tools
grep -r "{concept}" backend/app/core/tools/

# Search for related agents
grep -r "{concept}" backend/app/core/agents/

# Search all of backend
grep -r "{concept}" backend/app/
```

### Step 4: Search Frontend for Existing Components

```bash
# Search features
grep -r "{concept}" frontend/src/features/

# Search components
grep -r "{concept}" frontend/src/components/

# Search hooks
grep -r "{concept}" frontend/src/hooks/

# Search stores
grep -r "{concept}" frontend/src/stores/
```

### Step 5: Check Capability Registry

```bash
# The capability registry defines what Synova can already do
cat backend/app/core/capabilities/registry.yaml

# Check if this capability already exists
grep -i "{concept}" backend/app/core/capabilities/registry.yaml
```

---

## Phase 3: The Parallel Technology Checklist

For EACH component in your proposed plan, answer:

### ✅ Core Validation

- [ ] **Searched documentation** for existing solutions
- [ ] **Searched specs** for prior planning work
- [ ] **Searched backend** for existing services/tools/agents
- [ ] **Searched frontend** for existing components/hooks
- [ ] **Checked capability registry** for existing capabilities
- [ ] **Verified this isn't already done** in a different name

### ✅ Integration Validation

- [ ] If I need AI: Am I using **AI Services Layer**?
- [ ] If I need documents: Am I using **Vault**?
- [ ] If I need search: Am I using **VaultService.semantic_search()**?
- [ ] If I need audit: Am I using **Capsules**?
- [ ] If I need approval: Am I using **ApprovalGate** or **Checkpoints**?
- [ ] If I need orchestration: Am I using **Conductor** and **Agents**?
- [ ] If I need atomic ops: Am I using existing **Tools**?
- [ ] If I need events: Am I using **Domain Events**?
- [ ] If I need memory: Am I using **OrganizationalMemory**?
- [ ] If I need policy: Am I using **Governance Kernel**?

### ✅ Architecture Validation

- [ ] Does this respect **pace layers** (Structure/Skin/Services/Space Plan/Stuff)?
- [ ] Does this use the **CAT pattern** (Conductor → Agent → Tool)?
- [ ] Does this follow **repository pattern** for data access?
- [ ] Does this emit **domain events** where appropriate?
- [ ] Does this create **Capsules** for auditability?

---

## Phase 4: Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DOES THIS CAPABILITY ALREADY EXIST?                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────┐                           │
│  │ EXACT MATCH EXISTS                        │                           │
│  │ (same capability, same API)               │                           │
│  └─────────────────┬────────────────────────┘                           │
│                    ↓                                                     │
│            ✅ USE IT AS-IS                                               │
│            Don't build anything new.                                     │
│                                                                          │
│  ┌──────────────────────────────────────────┐                           │
│  │ SIMILAR EXISTS                            │                           │
│  │ (related capability, needs extension)     │                           │
│  └─────────────────┬────────────────────────┘                           │
│                    ↓                                                     │
│            ✅ EXTEND EXISTING                                            │
│            Add to existing service/tool.                                 │
│            Maintain backward compatibility.                              │
│                                                                          │
│  ┌──────────────────────────────────────────┐                           │
│  │ COMPOSABLE FROM EXISTING                  │                           │
│  │ (combine 2+ existing capabilities)        │                           │
│  └─────────────────┬────────────────────────┘                           │
│                    ↓                                                     │
│            ✅ COMPOSE                                                    │
│            Use existing tools in sequence.                               │
│            Create a new workflow, not new tools.                         │
│                                                                          │
│  ┌──────────────────────────────────────────┐                           │
│  │ NOTHING EXISTS                            │                           │
│  │ (genuinely new capability)                │                           │
│  └─────────────────┬────────────────────────┘                           │
│                    ↓                                                     │
│            ⚠️ BUILD NEW (WITH CAUTION)                                  │
│            - Follow existing patterns exactly                            │
│            - Integrate with existing systems                             │
│            - Register in capability system                               │
│            - Emit domain events                                          │
│            - Create capsules for audit                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: Gap Analysis Report

After completing due diligence, produce this report:

```markdown
## 🔍 Due Diligence Report: [Feature/Plan Name]

### Summary
- **Proposal**: [One sentence description]
- **Parallel Technology Risk**: 🟢 None / 🟡 Low / 🔴 High
- **Recommendation**: Use Existing / Extend Existing / Compose / Build New

---

### Existing Systems Analyzed

| System | Searched | Relevant? | Notes |
|--------|----------|-----------|-------|
| AI Services | ✅ | Yes/No | |
| Vault | ✅ | Yes/No | |
| Capsules | ✅ | Yes/No | |
| Agents | ✅ | Yes/No | |
| Tools | ✅ | Yes/No | |
| Workflows | ✅ | Yes/No | |
| Checkpoints | ✅ | Yes/No | |
| Org Memory | ✅ | Yes/No | |
| Governance | ✅ | Yes/No | |
| [Domain-specific] | ✅ | Yes/No | |

---

### Existing Capabilities That Apply

| Existing Component | How It Applies | Gap (if any) |
|-------------------|----------------|--------------|
| [Component 1] | [Explanation] | [Gap or "None"] |
| [Component 2] | [Explanation] | [Gap or "None"] |

---

### Recommended Approach

#### Option A: Use Existing (Preferred)
[Describe how existing systems fulfill the need]

#### Option B: Extend Existing
[Describe minimal extensions to existing systems]

#### Option C: Compose Existing
[Describe how to combine existing tools/agents]

#### Option D: Build New (Last Resort)
[Only if A/B/C don't work — describe what's truly new and why]

---

### Integration Points

| Proposed Component | Integrates With | Integration Method |
|-------------------|-----------------|-------------------|
| [New component] | [Existing system] | [Events/API/Composition] |

---

### Parallel Technology Risks

| Risk | Mitigation |
|------|------------|
| [Potential duplication] | [How we avoid it] |

---

### Checklist Verification

- [ ] Searched all documentation
- [ ] Searched all specs
- [ ] Searched backend code
- [ ] Searched frontend code
- [ ] Checked capability registry
- [ ] Verified integration with existing systems
- [ ] Confirmed no parallel technology

---

*Due diligence completed: [Date]*
*Reviewed by: [Claude]*
```

---

## Common Synova Patterns to Reuse

### Need AI Inference?
```python
# ✅ Use AI Services Layer
from app.core.ai_services import AIServiceRouter
router = AIServiceRouter()
response = await router.chat(messages=[...])  # Provider-agnostic
```

### Need Document Search?
```python
# ✅ Use VaultService
from app.core.vault import VaultService
results = await vault.semantic_search(query, top_k=5)  # Already has RAG
```

### Need Audit Trail?
```python
# ✅ Use Capsules
from app.core.capsules import CapsuleSealer
capsule = await sealer.seal(action, context)  # Hash-chained, compliant
```

### Need Task Approval?
```python
# ✅ Use ApprovalGate or Checkpoints
from app.core.checkpoints import CheckpointManager
await checkpoint_manager.request_approval(task)
```

### Need AI Orchestration?
```python
# ✅ Use Conductor + Agents
# Don't build custom orchestration — use the CAT pattern
conductor = Conductor(goal)
await conductor.execute()  # Uses existing agents and tools
```

### Need Events?
```python
# ✅ Use Domain Events
from app.domain.events import publish
await publish("goal.created", {"id": goal.id})  # Existing event bus
```

### Need Learning from Past?
```python
# ✅ Use Organizational Memory
from app.core.organization import OrganizationalMemory
similar = await memory.find_similar_goals(goal)  # pgvector similarity
```

---

## Anti-Patterns to Avoid

### ❌ The "Not Invented Here" Syndrome
Building custom solutions when existing ones work perfectly.

### ❌ The "It's Faster to Build New" Fallacy
Short-term speed creates long-term maintenance burden.

### ❌ The "But Mine is Better" Trap
Existing systems are battle-tested. New systems aren't.

### ❌ The "I Didn't Know It Existed" Excuse
This command exists to prevent exactly that.

### ❌ The "Different Name, Same Thing" Pattern
Creating `EventPublisher` when `DomainEvents` exists.
Creating `SearchService` when `VaultService.semantic_search()` exists.
Creating `AuditLog` when `Capsules` exists.

---

## Quick Reference: What Synova Already Has

### AI & Intelligence
- ✅ AI Services Layer (8 providers, 8 capabilities)
- ✅ Embedding pipeline (768-dim, HNSW indexes)
- ✅ Semantic search (VaultService)
- ✅ RAG integration (Chat + Vault)
- ✅ Goal analysis (GoalAnalyzer)

### Orchestration
- ✅ Conductor (goal orchestration)
- ✅ 13 Agents (specialized AI entities)
- ✅ 25+ Tools (atomic operations)
- ✅ 29 Capabilities (registry-defined)
- ✅ Workflows (OODA execution)

### Trust & Governance
- ✅ Capsules (audit trail)
- ✅ Hash Chain (tamper-evident)
- ✅ Governance Kernel (policy engine)
- ✅ Boot Gates (startup verification)
- ✅ Privacy Layers (3-tier retention)
- ✅ Post-quantum signatures (ML-DSA-65)

### Human-in-the-Loop
- ✅ Checkpoints (approval workflows)
- ✅ ApprovalGate (tool gating)
- ✅ Priority Inbox (velocity-first)
- ✅ Auto-approve rules (pattern-based)

### Knowledge Management
- ✅ Vault (document storage + RAG)
- ✅ Notes/Notebook (wikilinks, trust tiers)
- ✅ Organizational Memory (learning)
- ✅ Knowledge Graph (relationships)

### Infrastructure
- ✅ Repository pattern (data access)
- ✅ Domain events (pub/sub)
- ✅ Settings system (configuration)
- ✅ Metrics (Prometheus)
- ✅ Cache (Redis)

---

## References

- `@documentation/README.md` — Complete feature index
- `@documentation/architecture/` — System architectures
- `@backend/app/core/` — Core services
- `@backend/app/domain/` — Domain models and events
- `@backend/app/infrastructure/` — Infrastructure implementations
- `@frontend/src/features/` — Frontend feature modules
- `@specs/` — All specification documents

---

**Search before you build. Extend before you create. Compose before you duplicate. The best code is the code you don't write because it already exists.**
