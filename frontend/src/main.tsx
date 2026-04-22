import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

// #region agent log
fetch('http://127.0.0.1:7740/ingest/61f89cf0-f17c-4d95-857d-435abcdb0592',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e34294'},body:JSON.stringify({sessionId:'e34294',runId:'pre-fix',hypothesisId:'H3',location:'frontend/src/main.tsx:6',message:'Vite entry file evaluated',data:{hasRoot:!!document.getElementById("root")},timestamp:Date.now()})}).catch(()=>{});
// #endregion

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>
);
