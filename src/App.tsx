import Routes from './routes';
import AuthProvider from './provider/authProvider';
import { ThemeProvider } from './Context/theme-context';
import { LanguageProvider } from './Context/language-context';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <Routes />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
