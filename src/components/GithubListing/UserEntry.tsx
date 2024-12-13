import { User } from "../../types";

export function UserEntry({ user }: { user: User }) {
  return (
    <div className="flex align-middle gap-3 p-2 rounded-md">
      <img width={32} height={32} src={user.gravatar_url ?? user.avatar_url} />
      <a
        href={user.html_url}
        className="text-blue-500 hover:underline text-left"
        target="_blank"
        rel="noopener noreferrer"
      >
        {user.login}
      </a>
    </div>
  );
}

export default UserEntry;
