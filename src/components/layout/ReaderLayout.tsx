import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar } from "./Sidebar";
import { EntryList } from "./EntryList";
import { ReadingPane } from "./ReadingPane";
import type { UseReaderReturn } from "@/hooks/useReader";

interface ReaderLayoutProps {
  reader: UseReaderReturn;
}

export function ReaderLayout({ reader }: ReaderLayoutProps) {
  const { sidebarCollapsed, toggleSidebar, showKeyboardHelp, toggleKeyboardHelp } = reader;

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between h-12 px-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="text-gray-500"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Reader</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleKeyboardHelp}
            className="text-gray-500 text-xs"
          >
            <KeyboardIcon className="h-4 w-4 mr-1" />
            Shortcuts
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-gray-500">
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 transition-all duration-200 overflow-hidden",
            sidebarCollapsed ? "w-0" : "w-[250px]"
          )}
        >
          <Sidebar reader={reader} className="h-full" />
        </aside>

        {/* Entry List */}
        <div className="w-[350px] shrink-0">
          <EntryList reader={reader} className="h-full" />
        </div>

        {/* Reading Pane */}
        <main className="flex-1 min-w-0">
          <ReadingPane reader={reader} className="h-full" />
        </main>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardHelp} onOpenChange={toggleKeyboardHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <ShortcutGroup title="Navigation">
              <Shortcut keys={["j", "n"]} description="Next entry" />
              <Shortcut keys={["k", "p"]} description="Previous entry" />
              <Shortcut keys={["o", "Enter"]} description="Open/expand entry" />
            </ShortcutGroup>

            <ShortcutGroup title="Actions">
              <Shortcut keys={["s"]} description="Star/unstar" />
              <Shortcut keys={["m"]} description="Mark read/unread" />
              <Shortcut keys={["Shift", "a"]} description="Mark all as read" />
            </ShortcutGroup>

            <ShortcutGroup title="Other">
              <Shortcut keys={["?"]} description="Show this help" />
            </ShortcutGroup>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShortcutGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Shortcut({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            {i > 0 && <span className="text-gray-400 mx-1">or</span>}
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono">
              {key}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

// Icons
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function KeyboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
