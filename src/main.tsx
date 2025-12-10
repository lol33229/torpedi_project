import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AdminName from './nachalnik/adminName.tsx'
import Book from './nachalnik/book.tsx'
import EditDirectory from './nachalnik/editDirectory.tsx'
import Users from './nachalnik/users.tsx'
import Help from './nachalnik/help.tsx'
import Report from './nachalnik/report.tsx'

function App() {
  const [currentPage, setCurrentPage] = useState<'admin' | 'book' | 'edit' | 'users' | 'help' | 'report'>('admin')
  const [selectedDirectory, setSelectedDirectory] = useState<string>('')

  if (currentPage === 'edit') {
    return (
      <EditDirectory
        directoryName={selectedDirectory}
        onBack={() => setCurrentPage('book')}
      />
    )
  }

  if (currentPage === 'book') {
    return (
      <Book
        onBack={() => setCurrentPage('admin')}
        onEditDirectory={(directoryName) => {
          setSelectedDirectory(directoryName)
          setCurrentPage('edit')
        }}
      />
    )
  }

  if (currentPage === 'users') {
    return <Users onBack={() => setCurrentPage('admin')} />
  }

  if (currentPage === 'help') {
    return <Help onBack={() => setCurrentPage('admin')} />
  }

  if (currentPage === 'report') {
    return <Report onBack={() => setCurrentPage('admin')} />
  }

  return (
    <AdminName
      onNavigateToBook={() => setCurrentPage('book')}
      onNavigateToUsers={() => setCurrentPage('users')}
      onNavigateToHelp={() => setCurrentPage('help')}
      onNavigateToReport={() => setCurrentPage('report')}
    />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
