import { useCallback, useEffect, useState } from "react";

export function useResponsiveHeight(ref: React.RefObject<HTMLDivElement | null>) {
  const [height, setHeight] = useState("0px");
  const onResize = useCallback(() => {
    const viewportHeight = window.innerHeight;

    if (ref?.current) {
      const position = ref.current.getBoundingClientRect();
      setHeight(viewportHeight - position.top + "px");
    }
  }, [ref]);

  useEffect(() => {
    onResize();

    window.addEventListener("resize", () => {
      onResize();
    });

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return height;
}