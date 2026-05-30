import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PasscodePage from "./pages/PasscodePage";
import PWAInstallBanner from "./components/PWAInstallBanner";
import TypesPage from "./pages/TypesPage";
import CounselingPage from "./pages/CounselingPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";
import PartnerPage from "./pages/PartnerPage";

function Router() {
  return (
    <Switch>
      {/* トップ = 体質タイプ紹介（パスコードなし） */}
      <Route path={"/"} component={TypesPage} />
      {/* カウンセリングシート（パスコードなし） */}
      <Route path={"/counseling"} component={CounselingPage} />
      {/* 診断結果（パスコードなし） */}
      <Route path={"/result"} component={ResultPage} />
      {/* 管理者・スタッフ用ログイン */}
      <Route path={"/login"} component={PasscodePage} />
      {/* 管理者画面（パスコード必須） */}
      <Route path={"/admin"} component={AdminPage} />
      {/* パートナーサロン画面（パスコード必須） */}
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
          <PWAInstallBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
