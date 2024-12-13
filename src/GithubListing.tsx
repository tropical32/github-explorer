import { useRef, useState, useCallback, useMemo, useEffect } from "react";
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

function SearchEntryWrapper({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center",
      });
    }
  }, [isFocused]);

  return (
    <div ref={ref} className={isFocused ? "bg-slate-50" : ""}>
      {children}
    </div>
  );
}

function RepositoryEntry({ repository }: { repository: Repository }) {
  return (
    <div className={`flex p-2 rounded-md`}>
      <div className="flex flex-1 flex-col md:mr-6">
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
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
    <div className={`flex align-middle gap-3 p-2 rounded-md`}>
      <img width={32} height={32} src={user.gravatar_url ?? user.avatar_url} />
      <a
        href={user.html_url}
        className="text-blue-500 hover:underline w-60 text-left"
        target="_blank"
        rel="noopener noreferrer"
      >
        {user.login}
      </a>
    </div>
  );
}

function useKeyboardListener(
  isDropdownVisible: boolean,
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsDropdownVisible: (isDropdownVisible: boolean) => void,
  openLink: VoidFunction,
  maxItems: number,
) {
  useEffect(() => {
    function keyDownHandler(e: globalThis.KeyboardEvent) {
      if (!isDropdownVisible) return;

      if (e.key === "ArrowUp") {
        // TODO: prevent cursor from jumping to the beginning
        setFocusedIndex((index) => (index === 0 ? 0 : index - 1));
      } else if (e.key == "ArrowDown") {
        setFocusedIndex((index) => (index === maxItems ? index : index + 1));
      } else if (e.key === "Enter") {
        openLink();
      } else if (e.key === "Escape") {
        setIsDropdownVisible(false);
      }
    }

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [
    isDropdownVisible,
    setFocusedIndex,
    openLink,
    maxItems,
    setIsDropdownVisible,
  ]);
}

function useUnclickMouseListener(
  element: HTMLDivElement | null,
  setIsDropdownVisible: (isDropdownVisible: boolean) => void,
) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (element) {
        const clickedInside = element.contains(event.target as Node);
        setIsDropdownVisible(clickedInside);
      }
    }

    document.addEventListener("mouseup", handleClick);

    return () => {
      document.removeEventListener("mouseup", handleClick);
    };
  }, [element, setIsDropdownVisible]);
}

export function GithubListing() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

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
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message);
      }

      return json;
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

  const isErrorVisible = useMemo(
    () => (errorRepos || errorUsers) && !isFetchingRepos && !isFetchingUsers,
    [errorRepos, errorUsers, isFetchingRepos, isFetchingUsers],
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

  const openLink = useCallback(() => {
    const url = reposAndUsers?.at(focusedIndex)?.html_url;

    if (url) {
      const win = window.open(url, "_blank");
      if (win) win.focus();
    }
  }, [focusedIndex, reposAndUsers]);

  useKeyboardListener(
    isDropdownVisible,
    setFocusedIndex,
    setIsDropdownVisible,
    openLink,
    reposAndUsers.length,
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  useUnclickMouseListener(dropdownRef?.current, setIsDropdownVisible);

  const isResultsVisible = useMemo(
    () =>
      !isFetchingRepos &&
      !isFetchingUsers &&
      !errorRepos &&
      !errorUsers &&
      reposAndUsers.length > 0,
    [isFetchingRepos, errorRepos, isFetchingUsers, errorUsers, reposAndUsers],
  );

  const onFocus = useCallback(() => {
    setIsDropdownVisible(true);
  }, []);

  useEffect(() => {
    setFocusedIndex(0);
  }, [reposAndUsers, isDropdownVisible]);

  return (
    <div className="py-6 px-5 bg-white rounded-md flex flex-col border-[#efebf5] border w-full">
      <p className="text-gray-900 mb-1">Search for a repository or a user.</p>

      <div ref={dropdownRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          className="bg-gray-50 border-[#efebf5] border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Linux"
          onChange={(e) => onChange(e.target.value.length)}
          onFocus={onFocus}
        />

        {isDropdownVisible && (
          <div className="absolute overflow-auto bg-white border-[#efebf5] border mt-1 w-full min-h-60 rounded-lg h-full">
            <div className="flex h-full p-2 flex-col">
              {isResultsVisible && (
                <div className="flex h-full w-full gap-6 flex-col">
                  {reposAndUsers?.map((entry, idx) => (
                    <SearchEntryWrapper isFocused={focusedIndex === idx}>
                      {isUser(entry) ? (
                        <UserEntry key={entry.id} user={entry} />
                      ) : (
                        <RepositoryEntry key={entry.id} repository={entry} />
                      )}
                    </SearchEntryWrapper>
                  ))}
                </div>
              )}
              {isNoResultsVisible && (
                <div className="flex justify-center items-center h-full">
                  <p className="text-md text-center text-gray-500">
                    No results.
                  </p>
                </div>
              )}
              {isSpinnerVisible && (
                <div className="flex justify-center mt-3 h-full items-center">
                  <Spinner />
                </div>
              )}
              {isErrorVisible && (
                <div className="flex justify-center items-center h-full">
                  <p className="text-red-500 text-center text-md">
                    {errorRepos?.message ?? errorUsers?.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GithubListing;
