import { Button } from "@/components/ui/button";
import { Home, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6">
      <div className="text-center space-y-8 max-w-xl mx-auto">
        {/* Brand Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Smart Canopy
            </span>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-6">
          <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-gray-200 dark:text-gray-700 tracking-tight leading-none">
            404
          </h1>
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto px-4">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="pt-4">
          <Link to="/">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
            >
              <Home className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-8">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © 2025 KERAD Technologies. Smart Canopy IoT System.
          </p>
        </div>
      </div>
    </div>
  );
}
