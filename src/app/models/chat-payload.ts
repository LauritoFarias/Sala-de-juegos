interface ChatPayload {
  new?: { autor: string; texto: string; created_at: string };
  payload?: { autor: string };
}