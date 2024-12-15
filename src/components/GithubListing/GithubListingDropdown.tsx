import { useRef } from "react";
import { Repository, User } from "../../types";
import { isUser } from "../../types/utils";
import Spinner from "../Spinner/Spinner";
import RepositoryEntry from "./RepositoryEntry";
import SearchEntry from "./SearchEntry";
import UserEntry from "./UserEntry";
import { useResponsiveHeight } from "../../hooks";

const BOTTOM_OFFSET = 5;

type DropdownProps = {
  isResultsVisible: boolean;
  reposAndUsers: (Repository | User)[];
  focusedIndex: number;
  isNoResultsVisible: boolean;
  isSpinnerVisible: boolean;
  isErrorVisible: boolean;
  errorRepos: Error | null;
  errorUsers: Error | null;
  isQueryTooShortVisible: boolean;
};

export function Dropdown({
  isResultsVisible,
  reposAndUsers,
  focusedIndex,
  isNoResultsVisible,
  isSpinnerVisible,
  isErrorVisible,
  errorRepos,
  errorUsers,
  isQueryTooShortVisible,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownHeight = useResponsiveHeight(dropdownRef);

  return (
    <div
      ref={dropdownRef}
      data-testid="dropdown"
      className="absolute overflow-y-auto overflow-x-hidden bg-white border-[#efebf5] border mt-1 w-full rounded-lg"
      style={{ height: `calc(${dropdownHeight} - ${BOTTOM_OFFSET}px)` }}
    >
      <div className="flex h-full p-2 flex-col">
        {isResultsVisible && (
          <ul className="flex h-full w-full gap-6 flex-col" role="listbox">
            {reposAndUsers?.map((entry, idx) => (
              <SearchEntry key={entry.id} isFocused={focusedIndex === idx}>
                {isUser(entry) ? (
                  <UserEntry user={entry} />
                ) : (
                  <RepositoryEntry repository={entry} />
                )}
              </SearchEntry>
            ))}
          </ul>
        )}
        {isNoResultsVisible && (
          <div
            data-testid="no-results"
            className="flex justify-center items-center h-full"
          >
            <p className="text-md text-center text-gray-500">No results.</p>
          </div>
        )}
        {isQueryTooShortVisible && (
          <div
            data-testid="no-results"
            className="flex justify-center items-center h-full"
          >
            <p className="text-md text-center text-gray-500">
              Provide at least 3 letters to initiate the search.
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
  );
}

export default Dropdown;
