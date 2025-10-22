export interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  type: string;
  displayName: string;
}