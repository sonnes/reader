import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center h-12 px-4 bg-white border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <BackIcon className="h-4 w-4" />
          Back to Reader
        </Link>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display</CardTitle>
              <CardDescription>Customize how entries are displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Display settings coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>Manage your feed subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Subscription management coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import/Export</CardTitle>
              <CardDescription>Import or export your subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  Import OPML
                </Button>
                <Button variant="outline" disabled>
                  Export OPML
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}
