import { useEffect, useRef } from "react";

export function SearchEntry({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused: boolean;
}) {
  const ref = useRef<HTMLLIElement | null>(null);

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
    <li
      data-testid={isFocused ? "search-entry-focused" : "search-entry"}
      ref={ref}
      role="option"
      className={isFocused ? "bg-slate-50" : ""}
      aria-selected={isFocused}
    >
      {children}
    </li>
  );
}

export default SearchEntry;
