import React from "react";
import { IGitHubUser } from "../../shared/types";
import { UserList } from "./user-list";

type Props = {
  users: IGitHubUser[];
  searchTerm: string;
  noResults: boolean;
};

export const SearchResult: React.FC<Props> = ({
  users,
  searchTerm,
  noResults,
}) => {
  return (
    <div className="typeahead-results-wrap">
      <div className="typeahead-results">
        {!searchTerm && (
          <div className="typeahead-no-result">
            Try searching for github users.
          </div>
        )}
        {noResults && (
          <div className="typeahead-no-result">No results found.</div>
        )}
        <UserList users={users} />
      </div>
    </div>
  );
};
