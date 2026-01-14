import { Layout } from "@/components/layout";
import type { AppState } from "@/types";

interface AppProps {
  initialData?: AppState;
}

function App({ initialData }: AppProps) {
  return <Layout initialData={initialData} />;
}

export default App;
