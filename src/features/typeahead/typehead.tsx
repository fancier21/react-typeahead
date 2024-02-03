import { useCallback, useEffect, useRef, useState } from "react";
import "./typeahead.css";
import { useDebounceCallback } from "../../shared/hooks/useDebounce";
import { IUser } from "../../shared/types";
import { ResultsList } from "./typeahead-results-list";
import { SearchInput } from "./typeahead-search-input";
import { GITHUB_API_KEY, GITHUB_API_URL } from "../../shared/config";

interface ApiResponse {
  items: IUser[];
}

function isApiResponse(data: any): data is ApiResponse {
  return typeof data === "object" && data !== null && Array.isArray(data.items);
}

function Typeahead() {
  const [value, setValue] = useState<string>("");
  const [results, setResults] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [noResult, setNoResult] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typeaheadRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchResults = async (
    newValue: string,
    signal?: AbortSignal,
  ): Promise<void> => {
    const { host, path } = GITHUB_API_URL;
    const url = `${host}${path}${newValue}`;

    if (newValue) {
      setLoading(true);

      try {
        const res = await fetch(url, {
          signal: signal,
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: "Bearer " + GITHUB_API_KEY,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        if (!res.ok) console.error(`Api response: ${res.statusText}`);

        const data = await res.json();

        if (!isApiResponse(data)) {
          setResults([]);
          console.error("Invalid API response");
          return;
        }

        const results = data?.items;

        if (results.length === 0) {
          setResults([]);
          setNoResult(true);
          return;
        }

        setResults(results);
        setNoResult(false);
      } catch (error: any) {
        const options = { couse: error };
        console.error(error.message, options);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const debouncedFetchResults = useDebounceCallback(fetchResults, 300);

  const handleInputChange = useCallback(
    (newValue: string) => {
      setValue(newValue);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      debouncedFetchResults(newValue, signal);
    },
    [debouncedFetchResults],
  );

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputClear = () => {
    setValue("");
    setResults([]);
    setNoResult(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      typeaheadRef.current &&
      !typeaheadRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="typeahead" ref={typeaheadRef}>
      <SearchInput
        isOpen={isOpen}
        value={value}
        loading={loading}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onClear={handleInputClear}
        inputRef={inputRef}
      />
      {isOpen && (
        <ResultsList results={results} value={value} noResult={noResult} />
      )}
    </div>
  );
}

export default Typeahead;
