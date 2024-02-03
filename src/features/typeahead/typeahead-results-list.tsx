import React from "react";
import { IUser } from "../../shared/types";

interface Props {
  results: IUser[];
  value: string;
  noResult: boolean;
}

export const ResultsList: React.FC<Props> = ({ results, value, noResult }) => {
  return (
    <div className="typeahead-results-wrap">
      <div className="typeahead-results">
        {!value && (
          <div className="typeahead-no-result">
            Try searching for github users.
          </div>
        )}
        {noResult && (
          <div className="typeahead-no-result">No results found.</div>
        )}
        {results.map((user: IUser) => (
          <a
            key={user.id}
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={user.avatar_url}
              alt={`${user.login} avatar` || "avatar"}
              height={30}
              width={30}
              className="avatar"
            />
            <span className="typeahead-result">{user.login}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
