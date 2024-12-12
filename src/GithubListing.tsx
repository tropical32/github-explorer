import { useRef, useState, useCallback } from "react";
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

function RepositoryEntry({ repository }: { repository: Repository }) {
  return (
    <>
      <div className="flex flex-col md:mr-6">
        <a
          href={repository.html_url}
          className="text-blue-500 hover:underline w-60"
          target="_blank"
          rel="noopener noreferrer"
        >
          {repository.full_name}
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
    </>
  );
}

function UserEntry({ user }: { user: User }) {
  return (
    <div className="flex align-middle gap-3">
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
        `https://api.github.com/search/repositories?q=${inputRef?.current?.value}`,
      );
      return await response.json();
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
        `https://api.github.com/search/users?q=${inputRef?.current?.value}`,
      );
      return await response.json();
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
  });

  const onChange = useCallback((textLen: number) => {
    setShouldFetch(textLen >= MIN_CHAR_SEARCH);
  }, []);

  return (
    <div className="py-6 px-6 bg-white rounded-md gap-3 flex flex-col">
      <p className="text-gray-900">Search for a repository or a user.</p>
      <input
        ref={inputRef}
        type="text"
        id="first_name"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Linux"
        onChange={(e) => onChange(e.target.value.length)}
      />
      {isFetchingRepos && !errorRepos && (
        <div className="flex justify-center mt-3">
          <Spinner />
        </div>
      )}
      {!isFetchingRepos && !errorRepos && repositories?.total_count === 0 && (
        <p className="text-xl text-center mt-3">No results.</p>
      )}
      {!isFetchingRepos &&
        !errorRepos &&
        repositories &&
        repositories?.total_count > 0 && (
          <>
            <p className="text-xl text-center">Repositories</p>
            <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_auto_auto_auto_auto] gap-y-6">
              {repositories?.items.map((repo) => (
                <RepositoryEntry
                  key={repo.id}
                  repository={repo}
                ></RepositoryEntry>
              ))}
            </div>
          </>
        )}
      {!isFetchingUsers && !errorUsers && users && users?.total_count > 0 && (
        <>
          <p className="text-xl text-center">Users</p>
          <div className="flex flex-col gap-6">
            {users?.items.map((user) => (
              <UserEntry key={user.id} user={user}></UserEntry>
            ))}
          </div>
        </>
      )}
      {errorRepos && <p className="mt-3 text-red-500">{errorRepos.message}</p>}
    </div>
  );
}

export default GithubListing;
