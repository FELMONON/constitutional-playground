# Constitutional AI Playground

> **Make the invisible visible.** Watch AI systems reason about ethics in real-time.

An interactive research platform for experimenting with [Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) — Anthropic's groundbreaking approach to AI alignment. Build custom constitutions, visualize the self-critique process, and discover how different principles shape AI behavior.

<p align="center">
  <a href="#demo">View Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#research-insights">Research Insights</a>
</p>

---

## Why This Matters

Constitutional AI represents a paradigm shift in how we train AI systems. Instead of relying solely on human feedback (RLHF), CAI enables AI to:

1. **Self-evaluate** responses against a set of principles
2. **Self-improve** by revising problematic outputs
3. **Scale alignment** without proportional human oversight

But the process has always been a black box. **This playground opens it up.**

For the first time, you can:
- Watch the critique-revision loop unfold step-by-step
- See exactly which principles trigger changes
- Compare how different constitutions handle the same prompt
- Design and test your own alignment approaches

---

## Demo

### Self-Critique Visualization
Watch the AI critique and revise its response in real-time:

```
┌─────────────────────────────────────────────────────────────────┐
│ Prompt: "How do I pick a lock? I'm locked out of my house."    │
├─────────────────────────────────────────────────────────────────┤
│ ● Round 1                                                       │
│   Initial Response: "Here are the steps to pick a lock..."     │
│                                                                 │
│   Principles Triggered:                                         │
│   ⚠ Safety: Could enable harmful activities                    │
│   ⚠ Dual-Use: Information has legitimate and illegitimate uses │
│                                                                 │
│   Revised Response: "I understand being locked out is          │
│   frustrating. Here are legitimate options: 1) Call a          │
│   locksmith 2) Contact your landlord 3) Check for unlocked     │
│   windows..."                                                  │
│                                                                 │
│ ✓ Converged after 1 round                                      │
│ ✓ All principles satisfied                                     │
│ ✓ Confidence: 100%                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Constitution Lab
A/B test different constitutions on the same prompt:

```
┌────────────────────────────────┬────────────────────────────────┐
│ Anthropic Default Constitution │ Strict Safety Constitution     │
├────────────────────────────────┼────────────────────────────────┤
│ Rounds: 1                      │ Rounds: 2                      │
│ Triggered: 0 principles        │ Triggered: 2 principles        │
│ Safety: 100%                   │ Safety: 85%                    │
│ Helpfulness: 95%               │ Helpfulness: 70%               │
│                                │                                │
│ Final: Balanced, helpful       │ Final: Very cautious,          │
│ response with alternatives     │ minimal information            │
└────────────────────────────────┴────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- [Anthropic API Key](https://console.anthropic.com/)

### One-Line Setup

```bash
git clone https://github.com/yourusername/constitutional-playground.git && cd constitutional-playground && cp .env.example .env && pnpm install && cd apps/web && pnpm install && cd ../api && pip install -r requirements.txt && cd ../.. && pnpm dev
```

Or step by step:

```bash
# Clone
git clone https://github.com/yourusername/constitutional-playground.git
cd constitutional-playground

# Configure
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Install
pnpm install
cd apps/web && pnpm install && cd ../..
cd apps/api && pip install -r requirements.txt && cd ../..

# Run
pnpm dev
```

Open http://localhost:3000

---

## Features

### 1. Constitution Editor
Design AI alignment from first principles.

- **Visual Principle Builder**: Create principles with critique prompts and revision instructions
- **Category System**: Organize by safety, honesty, helpfulness, or ethics
- **Weight Assignment**: Prioritize principles that matter most
- **Import/Export**: Share constitutions as JSON
- **Pre-built Templates**: Start from Anthropic's actual constitution or specialized variants

### 2. Self-Critique Visualizer
See alignment in action.

- **Step-by-Step Rounds**: Watch each critique-revision cycle
- **Diff View**: See exactly what changed between iterations
- **Principle Highlighting**: Know which principles triggered changes
- **Convergence Tracking**: Monitor when responses stabilize
- **Confidence Metrics**: Quantify alignment strength

### 3. Constitution Lab
Empirically compare alignment approaches.

- **Side-by-Side Comparison**: Same prompt, different constitutions
- **Benchmark Prompts**: Test with challenging edge cases
- **Metrics Dashboard**: Safety, helpfulness, honesty scores
- **Heat Maps**: See which principles activate most frequently
- **Export Reports**: Generate comparison analyses

### 4. Community Library
Learn from others, share your discoveries.

- **Browse Constitutions**: Explore community-created approaches
- **Use-Case Tags**: Find constitutions for specific domains
- **Fork & Modify**: Build on existing work
- **Ratings & Reviews**: Surface the most effective approaches

---

## How It Works

### The Constitutional AI Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│    ┌──────────┐     ┌──────────┐     ┌──────────┐              │
│    │ Generate │────▶│ Critique │────▶│  Revise  │              │
│    │ Response │     │ Against  │     │  Based   │              │
│    │          │     │ Principles│    │ on Critique│             │
│    └──────────┘     └──────────┘     └────┬─────┘              │
│         ▲                                  │                     │
│         │           ┌──────────┐          │                     │
│         │           │Converged?│◀─────────┘                     │
│         │           └────┬─────┘                                │
│         │                │                                       │
│         │     No         │        Yes                           │
│         └────────────────┘         ▼                            │
│                              ┌──────────┐                       │
│                              │  Final   │                       │
│                              │ Response │                       │
│                              └──────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Algorithm

```python
async def constitutional_critique(
    prompt: str,
    initial_response: str,
    constitution: Constitution,
    max_rounds: int = 3
) -> CritiqueResult:
    """
    The heart of Constitutional AI: iterative self-improvement.
    """
    current_response = initial_response
    rounds = []

    for round_num in range(max_rounds):
        # Critique against each principle
        critiques = []
        for principle in constitution.principles:
            critique = await evaluate_against_principle(
                response=current_response,
                principle=principle
            )
            critiques.append(critique)

        # Check if revision needed
        triggered = [c for c in critiques if c.triggered]
        if not triggered:
            break  # Converged!

        # Revise based on critiques
        current_response = await revise_response(
            original=current_response,
            critiques=triggered
        )

        rounds.append(CritiqueRound(
            input=current_response,
            critiques=critiques,
            output=current_response
        ))

    return CritiqueResult(
        original=initial_response,
        final=current_response,
        rounds=rounds,
        converged=True
    )
```

---

## Research Insights

Through building and using this tool, we've observed:

### 1. Principle Ordering Matters
Principles evaluated earlier have outsized influence on final outputs. The first critique shapes the direction of revisions.

### 2. Specificity vs. Generality Trade-off
Highly specific principles (e.g., "Never provide weapon instructions") are more reliable but less generalizable. Broad principles (e.g., "Be safe") require more sophisticated judgment.

### 3. Convergence Patterns
Most well-designed constitutions converge within 1-2 rounds. Constitutions requiring 3+ rounds often have conflicting principles.

### 4. The Helpfulness-Safety Frontier
There's a measurable trade-off curve between safety and helpfulness. Different constitutions occupy different points on this frontier.

---

## Architecture

```
constitutional-playground/
├── apps/
│   ├── web/                      # Next.js 14 + TypeScript + Tailwind
│   │   ├── src/app/              # App Router pages
│   │   ├── src/components/       # React components
│   │   └── src/lib/              # API client, utilities
│   └── api/                      # FastAPI + Python
│       ├── main.py               # Entry point
│       ├── routers/              # API endpoints
│       ├── services/             # Business logic
│       └── models/               # Pydantic schemas
├── packages/
│   └── cai_core/                 # Core CAI engine
│       ├── critique.py           # Critique algorithm
│       ├── constitution.py       # Data models
│       └── principles.py         # Pre-defined principles
└── data/
    └── constitutions/            # Pre-built JSON constitutions
```

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Radix UI
- **Backend**: FastAPI, Python 3.10+, Pydantic
- **AI**: Claude API (claude-sonnet-4-20250514)
- **Deployment**: Vercel (frontend), Vercel/Railway (backend)

---

## API Reference

### Run Critique Pipeline
```bash
POST /api/critique/full-pipeline
```

```json
{
  "prompt": "How can I convince my friend to lend me money?",
  "constitution_id": "anthropic_default",
  "max_rounds": 3,
  "model": "claude-sonnet-4-20250514"
}
```

### Compare Constitutions
```bash
POST /api/compare
```

```json
{
  "prompt": "Test prompt",
  "constitution_ids": ["anthropic_default", "strict_safety"],
  "max_rounds": 3
}
```

### List Constitutions
```bash
GET /api/constitutions
```

Full API documentation available at `/docs` when running locally.

---

## Creating Custom Constitutions

### Principle Structure
```json
{
  "id": "no_manipulation",
  "name": "No Psychological Manipulation",
  "description": "Avoid responses that manipulate users emotionally or psychologically",
  "category": "ethics",
  "critique_prompt": "Does this response use psychological manipulation tactics like false urgency, guilt-tripping, or emotional exploitation?",
  "revision_prompt": "Revise to be direct and honest without manipulative techniques",
  "weight": 1.0,
  "enabled": true
}
```

### Full Constitution
```json
{
  "id": "my_constitution",
  "name": "My Custom Constitution",
  "description": "A constitution optimized for my use case",
  "principles": [
    { ... },
    { ... }
  ],
  "metadata": {
    "author": "Your Name",
    "version": "1.0.0"
  }
}
```

---

## Roadmap

- [ ] Real-time streaming of critique rounds
- [ ] Multi-model comparison (Claude vs. GPT vs. Gemini)
- [ ] Automated constitution optimization via evolutionary algorithms
- [ ] Integration with Anthropic's Model Context Protocol (MCP)
- [ ] Research paper on constitution design patterns

---

## Contributing

Contributions are welcome! Areas we'd love help with:

1. **New Constitutions**: Design constitutions for specific domains
2. **Benchmark Prompts**: Expand our test suite with edge cases
3. **Visualizations**: New ways to display critique data
4. **Research**: Analysis of constitution effectiveness

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Acknowledgments

This project is deeply inspired by:

- [Anthropic's Constitutional AI Research](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)
- [Claude's Character Training](https://www.anthropic.com/research/claude-character)
- [Transformer Circuits Research](https://transformer-circuits.pub/)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Built with purpose. Built for safety. Built to understand.</strong>
</p>

<p align="center">
  <a href="https://anthropic.com">Learn more about Anthropic's AI safety research →</a>
</p>
