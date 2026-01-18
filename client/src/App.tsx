import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TeslaThemeProvider } from "./contexts/TeslaThemeContext";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import ImageGenerator from "./pages/ImageGenerator";
import VideoGenerator from "./pages/VideoGenerator";
import ImageUpscale from "./pages/ImageUpscale";
import TextToSpeech from "./pages/TextToSpeech";
import Studio from "./pages/Studio";
import VisionProMax from "./pages/VisionProMax";
import VisionPro from "./pages/VisionPro";
import VideoPro from "./pages/VideoPro";
import TrinityChat from "./pages/TrinityChat";
import Flow from "./pages/Flow";
import Instruct from "./pages/Instruct";
import Expand from "./pages/Expand";
import UpscaleVideo from "./pages/UpscaleVideo";
import SocialExport from "./pages/SocialExport";
import Scheduler from "./pages/Scheduler";
import Analytics from "./pages/Analytics";
import Referral from "./pages/Referral";
import Templates from "./pages/Templates";
import MediaTools from "./pages/MediaTools";
import ProductDemo from "./pages/ProductDemo";
import AITest from "./pages/AITest";
import ImageGeneratorPro from "./pages/ImageGeneratorPro";
import VideoEditor from "./pages/VideoEditor";
import Pricing from "./pages/Pricing";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import SocialConnect from "./pages/SocialConnect";
import CommercialAgent from '@/pages/CommercialAgent';
import CommercialGenerator from '@/pages/CommercialGenerator';
import CampaignDashboard from '@/pages/CampaignDashboard';
import PublishingQueueDashboard from '@/pages/PublishingQueueDashboard';

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/studio"} component={Studio} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/create"} component={ImageGenerator} />
      <Route path={"/video"} component={VideoGenerator} />
      <Route path={"/upscale"} component={ImageUpscale} />
      <Route path={"/tts"} component={TextToSpeech} />
      <Route path={"/vision-pro-max"} component={VisionProMax} />
      <Route path={"/vision-pro"} component={VisionPro} />
      <Route path={"/video-pro"} component={VideoPro} />
      <Route path={"/chat"} component={TrinityChat} />
      <Route path={"/flow"} component={Flow} />
      <Route path={"/instruct"} component={Instruct} />
      <Route path={"/expand"} component={Expand} />
      <Route path={"/upscale-video"} component={UpscaleVideo} />
      <Route path={"/export"} component={SocialExport} />
      <Route path={"/scheduler"} component={Scheduler} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/referral"} component={Referral} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/media-tools"} component={MediaTools} />
      <Route path={"/product-demo"} component={ProductDemo} />
      <Route path={"/ai-test"} component={AITest} />
      <Route path={"/image-pro"} component={ImageGeneratorPro} />
      <Route path={"/video-editor"} component={VideoEditor} />
      <Route path={"/pricing"} component={Pricing} />
       <Route path={"/analytics"} component={AnalyticsDashboard} />
      <Route path={"/social-connect"} component={SocialConnect} />
      <Route path={"/commercial-agent"} component={CommercialAgent} />
      <Route path={"/commercial-generator"} component={CommercialGenerator} />
      <Route path={"/campaigns"} component={CampaignDashboard} />
      <Route path={"/publishing-queue"} component={PublishingQueueDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TeslaThemeProvider>
        <ThemeProvider
          defaultTheme="dark"
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </TeslaThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
