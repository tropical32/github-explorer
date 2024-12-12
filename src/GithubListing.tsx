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

export function GithubListing() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  console.log(shouldFetch);

  const {
    error,
    data: repositories,
    isFetching,
  } = useQuery<RepositoryResult>({
    queryKey: ["github", inputRef?.current?.value],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${inputRef?.current?.value}`,
      );
      return await response.json();
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
  });

  console.log(repositories);

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
      {isFetching && !error && (
        <div className="flex justify-center mt-3">
          <Spinner />
        </div>
      )}
      {!isFetching && !error && repositories?.total_count === 0 && (
        <p className="text-xl text-center mt-3">No results</p>
      )}
      {!isFetching &&
        !error &&
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
      {error && <p className="mt-3 text-red-500">{error.message}</p>}
    </div>
  );
}

// forks_count, full_name, make it clickable, id (key), language, name (or full_name), stargazers_count, watchers

export default GithubListing;
