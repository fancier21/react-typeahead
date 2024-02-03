import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import useDebounce from "./shared/hooks/useDebounce";
import Input from "./shared/ui/Input/input";

const API = {
  host: "https://api.github.com",
  path: "/search/users?q=",
};

const GITHUB_API_KEY = process.env.REACT_APP_GITHUB_API_KEY;

function App() {
  const [value, setValue] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchResults = async (
    newValue: string,
    signal?: AbortSignal,
  ): Promise<void> => {
    const { host, path } = API;
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
        const users = data?.items;

        if (!users) {
          setResults([]);
          console.error("No users found");
          return;
        }

        setResults(users);
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

  const debouncedFetchResults = useDebounce(fetchResults, 300);

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
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
    <div className="container">
      <div className="typeahead" ref={inputRef}>
        <div className="typeahead-input-wrap">
          <div className="typeahead-icon search-icon">
            <span className="material-symbols-outlined">
              {loading ? "progress_activity" : "search"}
            </span>
          </div>
          <Input
            className="typeahead-input"
            type="search"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search..."
          />
          {value && isOpen && (
            <div
              className="typeahead-icon cancel-icon"
              onClick={handleInputClear}
            >
              <span className="material-symbols-outlined">cancel</span>
            </div>
          )}
        </div>
        {isOpen && (
          <div className="typeahead-results-wrap">
            <div className="typeahead-results">
              {!value && (
                <div className="typeahead-no-result">
                  Try searching for github users.
                </div>
              )}
              {results.length === 0 && value && !loading && (
                <div className="typeahead-no-result">No results found.</div>
              )}
              {results.map((user: any) => (
                <a
                  key={user.id}
                  href={user.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    height={30}
                    width={30}
                    className="avatar"
                  />
                  <span className="typeahead-result">{user.login}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
