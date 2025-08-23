import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Home } from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/auth';
import Editor from '@/pages/editor';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/auth" component={Auth} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/editor" component={Editor} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;