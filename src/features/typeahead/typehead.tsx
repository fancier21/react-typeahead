import { useCallback, useEffect, useRef, useState } from "react";
import { IGitHubUser } from "../../shared/types";
import { SearchInput } from "./search-input";
import { SearchResult } from "./search-result";

import { useDebounceCallback } from "../../shared/hooks/useDebounce";
import { GITHUB_API_KEY, GITHUB_API_URL } from "../../shared/config";

import "./typeahead.css";

function isValidGithubApiResponse(data: any): data is { items: IGitHubUser[] } {
  return typeof data === "object" && data !== null && Array.isArray(data.items);
}

function Typeahead() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [githubUsers, setGithubUsers] = useState<IGitHubUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isResultsOpen, setIsResultsOpen] = useState<boolean>(false);
  const [noResults, setNoResults] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typeaheadRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchGithubUsers = async (
    term: string,
    signal?: AbortSignal,
  ): Promise<void> => {
    const { host, path } = GITHUB_API_URL;
    const url = `${host}${path}${term}`;

    if (term) {
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

        if (!res.ok) console.error(`GitHub Api response: ${res.statusText}`);

        const data = await res.json();

        if (!isValidGithubApiResponse(data)) {
          setGithubUsers([]);
          console.error("Invalid GitHub API response structure");
          return;
        }

        const users = data.items;

        if (users.length === 0) {
          setGithubUsers([]);
          setNoResults(true);
          return;
        }

        setGithubUsers(users);
        setNoResults(false);
      } catch (error: any) {
        const options = { couse: error };
        console.error(error.message, options);
      } finally {
        setLoading(false);
      }
    } else {
      setGithubUsers([]);
    }
  };

  const debouncedFetchGithubUsers = useDebounceCallback(fetchGithubUsers, 300);

  const handleInputChange = useCallback(
    (newSearchTerm: string) => {
      setSearchTerm(newSearchTerm);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      debouncedFetchGithubUsers(newSearchTerm, signal);
    },
    [debouncedFetchGithubUsers],
  );

  const handleInputFocus = () => {
    setIsResultsOpen(true);
  };

  const handleInputClear = () => {
    setSearchTerm("");
    setGithubUsers([]);
    setNoResults(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      typeaheadRef.current &&
      !typeaheadRef.current.contains(event.target as Node)
    ) {
      setIsResultsOpen(false);
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
        isOpen={isResultsOpen}
        value={searchTerm}
        loading={loading}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onClear={handleInputClear}
        inputRef={inputRef}
      />
      {isResultsOpen && (
        <SearchResult
          users={githubUsers}
          searchTerm={searchTerm}
          noResults={noResults}
        />
      )}
    </div>
  );
}

export default Typeahead;
