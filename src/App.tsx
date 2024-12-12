import GithubListing from './GithubListing';

function App() {
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="w-full text-gray-900 flex items-center flex-col gap-6">
          <h1 className='text-3xl text-center w-full'>GitHub Repositories and Users Autocomplete</h1>
          <GithubListing />
        </div>
      </div>
    </div>
  )
}

export default App
