/** Typed API client for all backend endpoints. */

import type {
  ChatStreamEvent,
  ElectionPhase,
  FeedbackRequest,
  GlossaryTerm,
  Language,
  VoterGuideStep,
} from '../types';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// ── Stream chat ───────────────────────────────────────────────────────────────
export async function* streamChat(
  sessionId: string,
  message: string,
  language: Language,
): AsyncGenerator<ChatStreamEvent> {
  const resp = await fetch(`${BASE}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ session_id: sessionId, message, language }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(`Chat API ${resp.status}: ${text}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6)) as ChatStreamEvent;
          yield event;
        } catch {
          // malformed chunk — skip
        }
      }
    }
  }
}

// ── Timeline ──────────────────────────────────────────────────────────────────
export async function fetchTimeline(): Promise<ElectionPhase[]> {
  const resp = await fetch(`${BASE}/api/v1/timeline`);
  if (!resp.ok) throw new Error(`Timeline API ${resp.status}`);
  const data = await resp.json() as { phases: ElectionPhase[] };
  return data.phases;
}

// ── Glossary ──────────────────────────────────────────────────────────────────
export async function fetchGlossary(): Promise<GlossaryTerm[]> {
  const resp = await fetch(`${BASE}/api/v1/glossary`);
  if (!resp.ok) throw new Error(`Glossary API ${resp.status}`);
  const data = await resp.json() as { terms: GlossaryTerm[] };
  return data.terms;
}

// ── Voter Guide ───────────────────────────────────────────────────────────────
export async function fetchVoterGuide(): Promise<VoterGuideStep[]> {
  const resp = await fetch(`${BASE}/api/v1/voter-guide`);
  if (!resp.ok) throw new Error(`Voter Guide API ${resp.status}`);
  const data = await resp.json() as { steps: VoterGuideStep[] };
  return data.steps;
}

// ── Feedback ──────────────────────────────────────────────────────────────────
export async function submitFeedback(req: FeedbackRequest): Promise<void> {
  await fetch(`${BASE}/api/v1/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
}
