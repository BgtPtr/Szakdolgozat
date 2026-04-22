"use client";

import qs from "query-string";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Input from "./Input";

const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState<string>("");
  const debouncedValue = useDebounce<string>(value);

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: "/search",
        query: debouncedValue ? { title: debouncedValue } : {},
      },
      {
        skipEmptyString: true,
        skipNull: true,
      }
    );

    router.replace(url);
  }, [debouncedValue, router]);

  return (
    <Input placeholder="Mit hallgatnál?"
      value={value}
      onChange={(e) => setValue(e.target.value)} />
  );
}

export default SearchInput;
