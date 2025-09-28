import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <nav>
          <Link to="/" className="text-sm text-sky-500 hover:underline">
            Home
          </Link>
        </nav>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white/5">
          <h2 className="text-lg font-medium">Overview</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Quick summary of recent activity.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5">
          <h2 className="text-lg font-medium">Statistics</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Some useful numbers and charts.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5">
          <h2 className="text-lg font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your preferences and integrations.
          </p>
        </div>
      </section>
    </div>
  );
}
