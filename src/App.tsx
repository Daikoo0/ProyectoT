import Routes from './routes';
import AuthProvider from './provider/authProvider';
import { ThemeProvider } from './Context/theme-context';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
