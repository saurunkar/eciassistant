/** All shared TypeScript types and interfaces. */

export type Language = 'en' | 'hi';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: Language;
  sources?: SourceCitation[];
  isStreaming?: boolean;
  rating?: 1 | -1 | null;
  timestamp: number;
}

export interface SourceCitation {
  title: string;
  url: string;
  excerpt: string;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  language: Language;
}

export interface ChatStreamEvent {
  chunk?: string;
  message_id?: string;
  done?: boolean;
  sources?: SourceCitation[];
  language?: Language;
}

export interface ElectionPhase {
  id: number;
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  icon: string;
  color: string;
  steps: string[];
  steps_hi: string[];
}

export interface GlossaryTerm {
  term: string;
  term_hi: string;
  definition: string;
  definition_hi: string;
  category: string;
}

export interface VoterGuideStep {
  step: number;
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  action_url: string;
  tips: string[];
  tips_hi: string[];
}

export interface FeedbackRequest {
  session_id: string;
  message_id: string;
  rating: 1 | -1;
  language: Language;
}

export interface SessionState {
  sessionId: string;
  messageCount: number;
}

export type Tab = 'chat' | 'timeline' | 'glossary' | 'guide';
