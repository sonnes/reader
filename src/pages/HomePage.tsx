import { useReader } from "@/hooks/useReader";
import { ReaderLayout } from "@/components/layout/ReaderLayout";

export function HomePage() {
  const reader = useReader();

  return <ReaderLayout reader={reader} />;
}
