import { Repository, User } from ".";

export function isUser(item: User | Repository): item is User {
  return (item as User).login !== undefined;
}
