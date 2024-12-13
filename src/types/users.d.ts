export type UserResult = {
  incomplete_results: boolean;
  total_count: number;
  items: User[];
};

export type User = {
  id: number;
  login: string;
  html_url: string;
  avatar_url: string;
  gravatar_url: string;
};
