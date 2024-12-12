import { useRef, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Spinner from "./Spinner";

const MIN_CHAR_SEARCH = 3;

type RepositoryResult = {
  incomlete_results: boolean;
  total_count: number;
  items: Repository[];
};

type Repository = {
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

type UserResult = {
  incomplete_results: boolean;
  total_count: number;
  items: User[];
};

type User = {
  id: number;
  login: string;
  html_url: string;
  avatar_url: string;
  gravatar_url: string;
};

function isUser(item: User | Repository): item is User {
  return (item as User).login !== undefined;
}

function RepositoryEntry({ repository }: { repository: Repository }) {
  return (
    <div className="flex hover:bg-slate-50 p-2 rounded-md">
      <div className="flex flex-1 flex-col md:mr-6">
        <a
          href={repository.html_url}
          className="text-blue-500 hover:underline w-60"
          target="_blank"
          rel="noopener noreferrer"
        >
          {repository.name}
        </a>
        <span
          title={repository.description}
          className="text-gray-500 w-60 overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {repository.description}
        </span>
      </div>
      <span className="text-gray-900 text-right hidden md:block">
        {repository.stargazers_count}
      </span>
      <span className="text-gray-900 ml-1 hidden md:block">👀</span>
      <span className="text-gray-900 text-right ml-6 hidden md:block">
        {repository.watchers}
      </span>
      <span className="text-gray-900 ml-1 hidden md:block">⭐</span>
    </div>
  );
}

function UserEntry({ user }: { user: User }) {
  return (
    <div className="flex align-middle gap-3 p-2 rounded-md hover:bg-slate-50">
      <img width={32} height={32} src={user.gravatar_url ?? user.avatar_url} />
      <a
        href={user.html_url}
        className="text-blue-500 hover:underline w-60"
        target="_blank"
        rel="noopener noreferrer"
      >
        {user.login}
      </a>
    </div>
  );
}

export function GithubListing() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    error: errorRepos,
    data: repositories,
    isFetching: isFetchingRepos,
  } = useQuery<RepositoryResult>({
    queryKey: ["repos", inputRef?.current?.value],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/search/repositories?per_page=50&q=${inputRef?.current?.value}`,
      );
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message);
      }

      return json;
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
  });

  const {
    error: errorUsers,
    data: users,
    isFetching: isFetchingUsers,
  } = useQuery<UserResult>({
    queryKey: ["users", inputRef?.current?.value],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/search/users?per_page=50&q=${inputRef?.current?.value}`,
      );
      return await response.json();
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
  });

  const onChange = useCallback((textLen: number) => {
    setShouldFetch(textLen >= MIN_CHAR_SEARCH);
  }, []);

  const isNoResultsVisible = useMemo(
    () => !isFetchingRepos && !errorRepos && !repositories?.items?.length,
    [isFetchingRepos, errorRepos, repositories],
  );

  const isSpinnerVisible = useMemo(
    () => isFetchingRepos && !errorRepos,
    [isFetchingRepos, errorRepos],
  );

  const reposAndUsers: (Repository | User)[] = useMemo(() => {
    const combined: (Repository | User)[] = [
      ...(Array.isArray(repositories?.items) ? repositories.items : []),
      ...(Array.isArray(users?.items) ? users.items : []),
    ];

    combined.sort((entryA, entryB) => {
      const entryASortKey = (
        isUser(entryA) ? entryA.login : entryA.name
      ).toLowerCase();
      const entryBSortKey = (
        isUser(entryB) ? entryB.login : entryB.name
      ).toLowerCase();

      if (entryASortKey < entryBSortKey) return -1;
      if (entryASortKey > entryBSortKey) return 1;
      return 0;
    });

    return combined;
  }, [repositories, users]);

  const isResultsVisible = useMemo(
    () =>
      !isFetchingRepos &&
      !isFetchingUsers &&
      !errorRepos &&
      !errorUsers &&
      reposAndUsers.length >= 0,
    [isFetchingRepos, errorRepos, isFetchingUsers, errorUsers, reposAndUsers],
  );

  return (
    <div className="py-6 px-5 bg-white rounded-md flex flex-col border-[#efebf5] border-2">
      <p className="text-gray-900 mb-1">Search for a repository or a user.</p>
      <input
        ref={inputRef}
        type="text"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Linux"
        onChange={(e) => onChange(e.target.value.length)}
      />

      <p className="text-xl text-center mt-6">Results</p>
      {isResultsVisible && (
        <div className="flex gap-6 flex-col">
          {reposAndUsers?.map((entry) =>
            isUser(entry) ? (
              <UserEntry key={entry.id} user={entry} />
            ) : (
              <RepositoryEntry key={entry.id} repository={entry} />
            ),
          )}
        </div>
      )}
      {isNoResultsVisible && (
        <p className="text-md text-center text-gray-500">No results.</p>
      )}
      {isSpinnerVisible && (
        <div className="flex justify-center mt-3">
          <Spinner />
        </div>
      )}
      {errorRepos && (
        <p className="text-red-500 max-w-60">{errorRepos.message}</p>
      )}
      {errorUsers && (
        <p className="text-red-500 max-w-60">{errorUsers.message}</p>
      )}
    </div>
  );
}

export default GithubListing;
