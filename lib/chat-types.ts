export interface ChatParticipant {
  user_id: string;
  last_read_at: string | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    headline: string | null;
  } | { full_name: string; avatar_url: string | null; headline: string | null }[] | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  created_at: string;
}

export interface ConversationPreview {
  conversation_id: string;
  conversations: {
    id: string;
    updated_at: string;
    messages: { body: string; created_at: string; sender_id: string }[];
  } | {
    id: string;
    updated_at: string;
    messages: { body: string; created_at: string; sender_id: string }[];
  }[] | null;
}
