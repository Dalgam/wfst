import * as React from "react";

export function useContainerWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(800);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, width];
}
