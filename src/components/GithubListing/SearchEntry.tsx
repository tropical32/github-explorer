import { useEffect, useRef } from "react";

export function SearchEntry({
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
    <div
      data-testid={isFocused ? "search-entry-focused" : "search-entry"}
      ref={ref}
      className={isFocused ? "bg-slate-50" : ""}
    >
      {children}
    </div>
  );
}

export default SearchEntry;
