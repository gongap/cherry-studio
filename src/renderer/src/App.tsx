import '@renderer/databases'

import store, { persistor } from '@renderer/store'
import { Provider } from 'react-redux'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import Sidebar from './components/app/Sidebar'
import TopViewContainer from './components/TopView'
import AntdProvider from './context/AntdProvider'
import StyleSheetManager from './context/StyleSheetManager'
import { SyntaxHighlighterProvider } from './context/SyntaxHighlighterProvider'
import { ThemeProvider } from './context/ThemeProvider'
import NavigationHandler from './handler/NavigationHandler'
import AgentsPage from './pages/agents/AgentsPage'
import AppsPage from './pages/apps/AppsPage'
import FilesPage from './pages/files/FilesPage'
import HomePage from './pages/home/HomePage'
import KnowledgePage from './pages/knowledge/KnowledgePage'
import PaintingsRoutePage from './pages/paintings/PaintingsRoutePage'
import SettingsPage from './pages/settings/SettingsPage'
import TranslatePage from './pages/translate/TranslatePage'
import LoginPage from './pages/Auth/LoginPage'
import { useEffect, useState } from 'react'
import styled from 'styled-components';

// Define a helper to check for Electron renderer environment
const isElectronRenderer = () =>
  typeof window !== 'undefined' &&
  typeof (window as any).electron !== 'undefined' &&
  typeof (window as any).electron.ipcRenderer !== 'undefined';

// Styled component to ensure full-screen coverage and centering for login page
const FullScreenContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5; /* Match LoginPageContainer background */
`;

function App(): React.ReactElement {
  // State to manage authentication status and user info in web environment
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [username, setUsername] = useState<string | null>(null); // State for username

  useEffect(() => {
    // Only check auth state in web environment
    if (!isElectronRenderer()) {
      // TODO: Implement actual token and user info check logic (e.g., check localStorage)
      const token = localStorage.getItem('authToken'); // Placeholder check
      const storedUsername = localStorage.getItem('username'); // Placeholder: get username from storage

      if (token && storedUsername) {
        // TODO: Validate token with backend
        setIsAuthenticated(true);
        setUsername(storedUsername); // Set username from storage
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
      setLoadingAuth(false);
    } else {
      // In Electron, always consider authenticated (no login required)
      setIsAuthenticated(true);
      setUsername('Electron User'); // Placeholder username for Electron
      setLoadingAuth(false);
    }
  }, []);

  // Function to handle successful login (to be passed to LoginPage)
  const handleSuccessfulLogin = (token: string, userDisplayName: string) => {
    // TODO: Store token and user info securely (e.g., localStorage)
    localStorage.setItem('authToken', token); // Placeholder storage
    localStorage.setItem('username', userDisplayName); // Placeholder: store username
    setIsAuthenticated(true);
    setUsername(userDisplayName); // Set username from login success
  };

    // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove token from storage
    localStorage.removeItem('username'); // Placeholder: remove username
    setIsAuthenticated(false); // Set auth state to false
    setUsername(null); // Clear username
    // Redirect to login page is implicitly handled by the conditional rendering in App.tsx
    console.log('User logged out');
  };


  // Show loading or login page based on environment and auth status
  if (!isElectronRenderer() && loadingAuth) {
    return <div>Loading authentication...</div>; // Or a loading spinner
  }

  if (!isElectronRenderer() && !isAuthenticated) {
    // Wrap LoginPage in necessary providers for correct styling and Redux context
    return (
      <Provider store={store}> {/* Add Redux Provider here */}
        <StyleSheetManager>
          <ThemeProvider>
            <AntdProvider>
              <FullScreenContainer>
                <LoginPage onLoginSuccess={handleSuccessfulLogin} />
              </FullScreenContainer>
            </AntdProvider>
          </ThemeProvider>
        </StyleSheetManager>
      </Provider>
    );
  }

  // Render main app if authenticated or in Electron
  return (
    <Provider store={store}>
      <StyleSheetManager>
        <ThemeProvider>
          <AntdProvider>
            <SyntaxHighlighterProvider>
              <PersistGate loading={null} persistor={persistor}>
                <TopViewContainer>
                  {/* Use HashRouter as it works well for both Electron and web */}
                  <HashRouter>
                    <NavigationHandler />
                    {/* Pass auth state, username, and logout handler to Sidebar */}
                    <Sidebar isAuthenticated={isAuthenticated} username={username} handleLogout={handleLogout} />
                    <Routes>
                      {/* Define your main application routes here */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/agents" element={<AgentsPage />} />
                      <Route path="/paintings/*" element={<PaintingsRoutePage />} />
                      <Route path="/translate" element={<TranslatePage />} />
                      <Route path="/files" element={<FilesPage />} />
                      <Route path="/knowledge" element={<KnowledgePage />} />
                      <Route path="/apps" element={<AppsPage />} />
                      <Route path="/settings/*" element={<SettingsPage />} />
                      {/* Add a redirect or a catch-all route if needed */}
                    </Routes>
                  </HashRouter>
                </TopViewContainer>
              </PersistGate>
            </SyntaxHighlighterProvider>
          </AntdProvider>
        </ThemeProvider>
      </StyleSheetManager>
    </Provider>
  );
}

export default App
