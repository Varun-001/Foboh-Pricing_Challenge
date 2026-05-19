import Sidebar from './components/Sidebar'

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <p className="text-gray-400 text-sm">Content area — components load here</p>
      </main>
    </div>
  )
}

export default App
