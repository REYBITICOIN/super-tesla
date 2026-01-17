import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import ImageGenerator from "./pages/ImageGenerator";
import VideoGenerator from "./pages/VideoGenerator";
import ImageUpscale from "./pages/ImageUpscale";
import TextToSpeech from "./pages/TextToSpeech";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/create"} component={ImageGenerator} />
      <Route path={"/video"} component={VideoGenerator} />
      <Route path={"/upscale"} component={ImageUpscale} />
      <Route path={"/tts"} component={TextToSpeech} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
