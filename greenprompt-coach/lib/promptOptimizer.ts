// lib/promptOptimizer.ts

export type OptimizationOptions = {
  maxLength?: number;
  includeExamples?: boolean;
  structured?: boolean;
  tone?: 'neutral' | 'concise' | 'detailed' | 'friendly' | 'technical';
};

export type OptimizedPromptVariant = {
  id: string;
  label: string;       // e.g. "Concise", "Step-by-step", "Debug-focused"
  description: string; // short explanation shown in UI
  prompt: string;
};

// Basic English stopwords; you can extend for your use-cases
const COMMON_STOPWORDS = new Set([
  'i','me','my','we','our','you','your','he','she','they','them',
  'is','are','was','were','be','been','am',
  'a','an','the','and','or','but','if','then','so',
  'in','on','at','for','from','to','of','with','about','this','that','these','those',
  'it','as','by','into','up','down','out','over','under','just','like',
  'can','could','would','should','will','shall','may','might',
  'do','does','did'
]);

function detectIntent(input: string): string {
  const lower = input.toLowerCase();

  if (lower.match(/\b(explain|why|how does)\b/)) return 'explanation';
  if (lower.match(/\b(build|create|implement|code|write)\b/)) return 'implementation';
  if (lower.match(/\b(compare|vs|versus|difference)\b/)) return 'comparison';
  if (lower.match(/\b(fix|debug|error|bug|issue)\b/)) return 'debugging';
  if (lower.match(/\b(summarize|summary|tl;dr|short version)\b/)) return 'summary';

  return 'general';
}

function extractKeywords(input: string, max = 10): string[] {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const tokens = cleaned.split(' ');
  const counts = new Map<string, number>();

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t || COMMON_STOPWORDS.has(t)) continue;

    // simple weighting for longer tokens
    const weight = t.length >= 6 ? 2 : 1;
    counts.set(t, (counts.get(t) ?? 0) + weight);

    // naive bigram boost: current + next (e.g. "react hooks")
    if (i < tokens.length - 1) {
      const next = tokens[i + 1];
      if (next && !COMMON_STOPWORDS.has(next)) {
        const bigram = `${t} ${next}`;
        counts.set(bigram, (counts.get(bigram) ?? 0) + 3);
      }
    }
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const w of sorted) {
    if (unique.length >= max) break;
    if (seen.has(w)) continue;
    seen.add(w);
    unique.push(w);
  }

  return unique;
}

function baseInstruction(intent: string): string {
  switch (intent) {
    case 'explanation':
      return 'Explain clearly, starting from basics, then move to advanced details.';
    case 'implementation':
      return 'Provide step-by-step implementation details with code examples and best practices.';
    case 'comparison':
      return 'Compare options with bullet points or a table, highlighting pros, cons, and recommendations.';
    case 'debugging':
      return 'Identify the root cause, explain why it occurs, and provide a corrected version and prevention tips.';
    case 'summary':
      return 'Summarize concisely with key points and important takeaways.';
    default:
      return 'Provide a clear, structured, and actionable answer.';
  }
}

function applyTone(base: string, tone: OptimizationOptions['tone']): string {
  switch (tone) {
    case 'concise':
      return base + ' Keep the answer short and to the point.';
    case 'detailed':
      return base + ' Go into depth where useful, but stay organized.';
    case 'friendly':
      return base + ' Use a friendly, encouraging tone.';
    case 'technical':
      return base + ' Use precise technical terminology where appropriate.';
    default:
      return base;
  }
}

function formatConstraints(options: OptimizationOptions): string {
  const parts: string[] = [];

  if (options.includeExamples !== false) {
    parts.push('Include at least one practical example if it helps.');
  }

  if (options.structured !== false) {
    parts.push('Use headings or bullet points where it improves clarity.');
  }

  if (options.maxLength) {
    parts.push(`Stay under roughly ${options.maxLength} words.`);
  }

  return parts.join(' ');
}

function normalizeUserTask(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  if (trimmed.split(/\s+/).length < 4) {
    return `Help me with: ${trimmed}`;
  }
  return trimmed;
}

// Simple helper to keep some prompts shorter
function maybeShorten(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + ' …';
}

/**
 * Main function: generate 10 optimized prompt variants
 */
export function generatePromptVariants(
  rawInput: string,
  options: OptimizationOptions = {},
): OptimizedPromptVariant[] {
  const input = normalizeUserTask(rawInput);
  if (!input) return [];

  const intent = detectIntent(input);
  const keywords = extractKeywords(input);
  const constraints = formatConstraints({
    maxLength: options.maxLength ?? 350,
    includeExamples: options.includeExamples ?? true,
    structured: options.structured ?? true,
  });

  const keywordLine =
    keywords.length > 0
      ? `Focus especially on: ${keywords.join(', ')}.`
      : '';

  const base = baseInstruction(intent);

  const variants: OptimizedPromptVariant[] = [];

  // 1. Concise direct prompt (short)
  variants.push({
    id: 'concise',
    label: 'Concise',
    description: 'Short, direct version of the user request.',
    prompt: maybeShorten(
      `You are an expert assistant. ${applyTone(base, 'concise')} 

Task: ${input}

${keywordLine}`,
      70,
    ),
  });

  // 2. Step-by-step / structured
  variants.push({
    id: 'step-by-step',
    label: 'Step-by-step',
    description: 'Ask for a clear, ordered solution.',
    prompt: `You are an expert assistant. Break the solution into clear steps.

${applyTone(base, 'detailed')}

User request:
${input}

When answering:
- Start with a brief overview.
- Then list the steps in order.
- Mention important caveats or trade-offs.

${keywordLine}
${constraints}`,
  });

  // 3. Debug/Review oriented
  variants.push({
    id: 'review',
    label: 'Review & Improve',
    description: 'Ask the model to analyze and improve the idea/solution.',
    prompt: `You are a senior reviewer.

Review the following request and propose an improved solution:

${input}

Do:
- Point out unclear assumptions.
- Suggest improvements and alternatives.
- Highlight potential pitfalls.

${keywordLine}
${constraints}`,
  });

  // 4. Edge cases / tests (medium)
  variants.push({
    id: 'edge-cases',
    label: 'Edge cases',
    description: 'Focus on pitfalls, edge cases, and tests.',
    prompt: maybeShorten(
      `You are an assistant that focuses on risks and edge cases.

Based on this goal:
${input}

Provide:
- Common pitfalls or mistakes.
- Edge cases to consider.
- How to test and validate the solution.

${keywordLine}
${constraints}`,
      120,
    ),
  });

  // 5. Teaching / explanation style
  variants.push({
    id: 'teaching',
    label: 'Teach me',
    description: 'Explain like a mentor, from basics to advanced.',
    prompt: `You are a friendly mentor teaching this topic.

Learner request:
${input}

Explain:
- First the high-level intuition.
- Then the core concepts with simple examples.
- Finally, advanced details and best practices.

${keywordLine}
${constraints}`,
  });

  // 6. Checklist (short/medium)
  variants.push({
    id: 'checklist',
    label: 'Checklist',
    description: 'Convert the goal into a checklist.',
    prompt: `You are an assistant that creates actionable checklists.

Goal:
${input}

Create a checklist:
- Main phases.
- Key tasks under each phase.
- Optional items for extra depth.

${keywordLine}
${constraints}`,
  });

  // 7. Options / alternatives
  variants.push({
    id: 'options',
    label: 'Options',
    description: 'Ask for several alternative approaches.',
    prompt: `You are an assistant proposing multiple approaches.

User goal:
${input}

Provide:
- At least 3 different approaches.
- Pros and cons for each.
- When to prefer each option.

${keywordLine}
${constraints}`,
  });

  // 8. Refactor / rewrite (shorter, ready to paste)
  variants.push({
    id: 'rewrite',
    label: 'Rewrite',
    description: 'Clear, focused rewrite of the original prompt.',
    prompt: maybeShorten(
      `Rewrite this request into a clearer, more effective prompt for an AI assistant, without changing the intent:

${input}

Output a single improved prompt that is:
- Unambiguous.
- Explicit about goals and constraints.
- Ready to paste into an AI chat.`,
      110,
    ),
  });

  // 9. Friendly assistant (short)
  variants.push({
    id: 'friendly',
    label: 'Friendly',
    description: 'Same task, but with a more human tone.',
    prompt: maybeShorten(
      `Act as a friendly, supportive assistant.

Help with:
${input}

Use a warm tone, give a clear explanation, and add practical tips.

${keywordLine}`,
      80,
    ),
  });

  // 10. Technical deep dive
  variants.push({
    id: 'technical',
    label: 'Technical',
    description: 'More formal and technical style.',
    prompt: `You are a highly technical expert.

User request:
${input}

Provide:
- Precise terminology.
- References to relevant concepts/standards.
- Trade-offs and implementation details.

${keywordLine}
${constraints}`,
  });

  return variants;
}
