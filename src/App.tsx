import Routes from './routes';
import AuthProvider from './provider/authProvider';
import { ThemeProvider } from './Context/theme-context';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>

        <Routes />

      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
