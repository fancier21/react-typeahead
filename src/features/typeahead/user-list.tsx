import { memo } from "react";
import { IGitHubUser } from "../../shared/types/user";
import { UserItem } from "./user-item";

type Props = {
  users: IGitHubUser[];
};

export const UserList: React.FC<Props> = memo(({ users }) => {
  return (
    <>
      {users.map((user: IGitHubUser) => (
        <UserItem key={user.id} user={user} />
      ))}
    </>
  );
});
