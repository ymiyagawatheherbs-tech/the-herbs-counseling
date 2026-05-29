import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PasscodePage from "./pages/PasscodePage";
import TypesPage from "./pages/TypesPage";
import CounselingPage from "./pages/CounselingPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";
import PartnerPage from "./pages/PartnerPage";

function Router() {
  return (
    <Switch>
      {/* トップ = パスコード入力 */}
      <Route path={"/"} component={PasscodePage} />
      {/* 体質タイプ紹介 */}
      <Route path={"/types"} component={TypesPage} />
      {/* カウンセリングシート */}
      <Route path={"/counseling"} component={CounselingPage} />
      {/* 診断結果 */}
      <Route path={"/result"} component={ResultPage} />
      {/* 管理者画面 */}
      <Route path={"/admin"} component={AdminPage} />
      {/* パートナーサロン画面 */}
      <Route path={"/partner"} component={PartnerPage} />
      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
