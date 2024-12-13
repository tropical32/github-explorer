import { Repository } from "../../types";

export function RepositoryEntry({ repository }: { repository: Repository }) {
  return (
    <div className={`flex p-2 rounded-md`}>
      <div className="flex flex-1 flex-col md:mr-6">
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {repository.name}
        </a>
        <span title={repository.description} className="text-gray-500">
          {repository.description}
        </span>
      </div>
      <span className="text-gray-900 text-right hidden md:block">
        {repository.stargazers_count}
      </span>
      <span className="text-gray-900 ml-1 hidden md:block">👀</span>
      <span className="text-gray-900 text-right ml-6 hidden md:block">
        {repository.watchers}
      </span>
      <span className="text-gray-900 ml-1 hidden md:block">⭐</span>
    </div>
  );
}

export default RepositoryEntry;
