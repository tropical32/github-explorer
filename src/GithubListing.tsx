export function GithubListing() {
    return <div className="py-6 px-6 bg-white rounded-md gap-3 flex flex-col">
        <p className="text-gray-900">Search for a repository or a user.</p>
        <input 
            type="text" 
            id="first_name" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Linux" 
        /> 
    </div>
}

export default GithubListing;