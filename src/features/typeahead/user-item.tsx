import { IGitHubUser } from "../../shared/types/user";

type Props = {
  user: IGitHubUser;
};

export const UserItem: React.FC<Props> = ({ user }) => {
  return (
    <a key={user.id} href={user.html_url} target="_blank" rel="noreferrer">
      <img
        src={user.avatar_url}
        alt={`${user.login} avatar` || "avatar"}
        height={30}
        width={30}
        className="avatar"
      />
      <span className="typeahead-result">{user.login}</span>
    </a>
  );
};
