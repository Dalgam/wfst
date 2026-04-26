import * as React from "react";
import { CATEGORIES } from "../constants";

type MasteredFilter = "all" | "hide" | "only";
type PrimeFilter = "all" | "prime" | "non-prime";

export function useUrlState() {
  const initParams = new URLSearchParams(window.location.search);

  const [category, setCategory] = React.useState(
    CATEGORIES.includes(initParams.get("cat") ?? "")
      ? initParams.get("cat")!
      : "All"
  );
  const [search, setSearch] = React.useState(initParams.get("q") ?? "");
  const [masteredFilter, setMasteredFilter] = React.useState<MasteredFilter>(
    (["all", "hide", "only"] as const).includes(
      initParams.get("filter") as MasteredFilter
    )
      ? (initParams.get("filter") as MasteredFilter)
      : "all"
  );
  const [primeFilter, setPrimeFilter] = React.useState<PrimeFilter>(
    (["all", "prime", "non-prime"] as const).includes(
      initParams.get("prime") as PrimeFilter
    )
      ? (initParams.get("prime") as PrimeFilter)
      : "all"
  );

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "All") params.set("cat", category);
    if (masteredFilter !== "all") params.set("filter", masteredFilter);
    if (primeFilter !== "all") params.set("prime", primeFilter);
    const qs = params.toString();
    history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [search, category, masteredFilter, primeFilter]);

  return {
    category,
    setCategory,
    search,
    setSearch,
    masteredFilter,
    setMasteredFilter,
    primeFilter,
    setPrimeFilter,
  };
}
