import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Repository, RepositoryResult, User, UserResult } from "../../types";
import { isUser } from "../../types/utils";
import Dropdown from "./GithubListingDropdown";
import { useDebounce } from "@uidotdev/usehooks";

const MIN_CHAR_SEARCH = 3;

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
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const shouldFetch = useMemo(
    () => (debouncedSearchQuery || "").length >= MIN_CHAR_SEARCH,
    [debouncedSearchQuery],
  );
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const {
    error: errorRepos,
    data: repositories,
    isFetching: isFetchingRepos,
  } = useQuery<RepositoryResult>({
    queryKey: ["repos", debouncedSearchQuery || ""],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/search/repositories?per_page=50&q=${debouncedSearchQuery || ""}`,
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
    queryKey: ["users", debouncedSearchQuery || ""],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/search/users?per_page=50&q=${debouncedSearchQuery || ""}`,
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

  const onChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const isQueryTooShortVisible = useMemo(
    () => (debouncedSearchQuery || "").length < MIN_CHAR_SEARCH,
    [debouncedSearchQuery],
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

  const isNoResultsVisible = useMemo(
    () =>
      !isQueryTooShortVisible &&
      !isFetchingRepos &&
      !errorRepos &&
      !reposAndUsers.length,
    [
      isQueryTooShortVisible,
      isFetchingRepos,
      errorRepos,
      reposAndUsers?.length,
    ],
  );

  const isSpinnerVisible = useMemo(
    () => isFetchingRepos && !errorRepos,
    [isFetchingRepos, errorRepos],
  );

  const isErrorVisible = useMemo(
    () => !!(errorRepos || errorUsers) && !isFetchingRepos && !isFetchingUsers,
    [errorRepos, errorUsers, isFetchingRepos, isFetchingUsers],
  );

  const openLink = useCallback(() => {
    const url = focusedIndex >= 0 && reposAndUsers?.at(focusedIndex)?.html_url;

    if (url) {
      const win = window.open(url, "_blank");
      if (win) win.focus();
    }
  }, [focusedIndex, reposAndUsers]);

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
    setFocusedIndex(-1);
  }, [reposAndUsers, isDropdownVisible]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownVisible) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((index) => (index <= 0 ? index : index - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((index) =>
            index >= reposAndUsers.length ? index : index + 1,
          );
          break;
        case "Enter":
          openLink();
          break;
        case "Escape":
          inputRef?.current?.blur();
          setIsDropdownVisible(false);
          break;
        default:
          return;
      }
    },
    [isDropdownVisible, reposAndUsers, openLink],
  );

  return (
    <div className="py-6 px-5 bg-white rounded-md flex flex-col border-[#efebf5] border w-full">
      <p className="text-gray-900 mb-1">Search for a repository or a user.</p>

      <div ref={dropdownRef} className="relative">
        <input
          onKeyDown={onKeyDown}
          data-testid="search-input"
          ref={inputRef}
          type="text"
          className="bg-gray-50 border-[#efebf5] border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Linux"
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
        />

        {isDropdownVisible && (
          <Dropdown
            isResultsVisible={isResultsVisible}
            reposAndUsers={reposAndUsers}
            focusedIndex={focusedIndex}
            isNoResultsVisible={isNoResultsVisible}
            isSpinnerVisible={isSpinnerVisible}
            isErrorVisible={isErrorVisible}
            errorRepos={errorRepos}
            errorUsers={errorUsers}
            isQueryTooShortVisible={isQueryTooShortVisible}
          />
        )}
      </div>
    </div>
  );
}

export default GithubListing;
