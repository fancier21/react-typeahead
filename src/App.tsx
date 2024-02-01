import { useRef, useState } from "react";
import "./App.css";
import useDebounce from "./shared/hooks/useDebounce";
import { Input } from "./shared/ui/Input/input";

const API = {
  host: "https://api.github.com",
  path: "/search/users?q=",
};

const GITHUB_API_KEY = process.env.REACT_APP_GITHUB_API_KEY;

function App() {
  const [value, setValue] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchResults = async (
    value: string,
    signal?: AbortSignal,
  ): Promise<void> => {
    const { host, path } = API;
    const url = `${host}${path}${value}`;

    if (value.trim() !== "") {
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
        console.error("Network error", error.message, options);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const debouncedFetchResults = useDebounce(fetchResults, 300);

  const handleInputChange = (value: string) => {
    setValue(value);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    debouncedFetchResults(value, signal);
  };

  return (
    <div className="container">
      <div className="autocomplete-search-box">
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="search"
          className="search-box"
        />
        <div className="search-result">
          {loading && <div className="search-loading">Loading...</div>}
          {results.length === 0 && value && !loading && (
            <div className="search-no-result">No results found.</div>
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
              {user.login}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
