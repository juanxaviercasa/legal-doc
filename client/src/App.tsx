import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Generator from "./pages/Generator";
import History from "./pages/History";
import LegalLibrary from "./pages/LegalLibrary";
import HistoryOfAdvocacy from "./pages/HistoryOfAdvocacy";
import Matters from "./pages/Matters";
import MatterDetail from "./pages/MatterDetail";
import ProceduralDesk from "./pages/ProceduralDesk";
import ProceduralCalendar from "./pages/ProceduralCalendar";
import LegalResearch from "./pages/LegalResearch";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/catalogo"} component={Catalogo} />
      <Route path={"/generator/:id"} component={Generator} />
      <Route path={"/history"} component={History} />
      <Route path={"/asuntos"} component={Matters} />
      <Route path={"/asuntos/:id"}>{(params) => <MatterDetail matterId={Number(params.id)} />}</Route>
      <Route path={"/mesa-procesal"} component={ProceduralDesk} />
      <Route path={"/mesa-procesal/calendario"} component={ProceduralCalendar} />
      <Route path={"/investigacion"} component={LegalResearch} />
      <Route path={"/biblioteca-juridica"} component={LegalLibrary} />
      <Route path={"/biblioteca"} component={HistoryOfAdvocacy} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
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
