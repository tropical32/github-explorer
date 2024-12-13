export type RepositoryResult = {
  incomlete_results: boolean;
  total_count: number;
  items: Repository[];
};

export type Repository = {
  id: number;
  html_url: string;
  forks_count: number;
  full_name: string;
  name: string;
  language: string;
  stargazers_count: number;
  watchers: number;
  description: string;
};
