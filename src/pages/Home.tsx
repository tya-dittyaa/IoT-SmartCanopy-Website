import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Droplets,
  Github,
  Leaf,
  Menu,
  Monitor,
  Thermometer,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 selection:bg-gray-900 selection:text-white dark:selection:bg-white dark:selection:text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Smart Canopy
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
              >
                Features
              </a>
              <a
                href="#team"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
              >
                Team
              </a>
              <Link to="/dashboard">
                <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm">
                  Dashboard
                </Button>
              </Link>
              <ModeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ModeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-700/20">
              <div className="px-6 py-4 space-y-4">
                <a
                  href="#features"
                  className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#team"
                  className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Team
                </a>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                Smart Canopy
                <span className="block text-transparent bg-gradient-to-r from-green-500 to-green-600 bg-clip-text">
                  IoT System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Automated canopy monitoring and control system with DHT11 sensor
                <br className="hidden md:block" />
                for real-time temperature and humidity monitoring.
              </p>
            </div>

            <div className="flex justify-center items-center pt-4">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                >
                  <Monitor className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="min-h-screen flex items-center justify-center bg-gray-50/30 dark:bg-gray-800/30 py-12 sm:py-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced technology for perfect environmental monitoring and
              control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Temperature Monitoring Card */}
            <div className="group h-full">
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden h-full flex flex-col">
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Thermometer className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Temperature Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-8 flex-grow flex items-center">
                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    Real-time temperature monitoring using DHT11 sensor with
                    high accuracy and automatic notifications.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Humidity Control Card */}
            <div className="group h-full">
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden h-full flex flex-col">
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Droplets className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Humidity Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-8 flex-grow flex items-center">
                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    Automatic humidity control system to maintain optimal
                    environmental conditions.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Smart Automation Card */}
            <div className="group h-full">
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden h-full flex flex-col">
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Smart Automation
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-8 flex-grow flex items-center">
                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    Automatic canopy control based on weather conditions and
                    predefined settings.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Analytics Card */}
            <div className="group h-full">
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden h-full flex flex-col">
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    AI Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-8 flex-grow flex items-center">
                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    Intelligent data analysis and predictive insights for
                    optimal canopy performance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 sm:py-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Development Team
            </h2>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              KERAD Technologies
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Innovative IoT Solutions for Smart Living
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Kevin Purnomo */}
            <div className="text-center group">
              <Avatar className="w-24 h-24 mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AvatarImage
                  src="https://stbm7resourcesprod.blob.core.windows.net/profilepicture/a1c30da5-f81e-4eec-aa73-ea46e7d1f710.jpg"
                  alt="Kevin Purnomo"
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-3xl">
                  KP
                </AvatarFallback>
              </Avatar>
              <h4 className="font-semibold text-2xl text-gray-900 dark:text-white mb-2">
                Kevin Purnomo
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-mono">
                2602059645
              </p>
              <p className="text-purple-600 dark:text-purple-400 font-medium text-lg mb-4">
                AI Engineer
              </p>
              <a
                href="https://github.com/D9theCoder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 group px-6 py-3"
                >
                  <Github className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  GitHub
                </Button>
              </a>
            </div>

            {/* Raphaelle Albetho */}
            <div className="text-center group">
              <Avatar className="w-24 h-24 mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AvatarImage
                  src="https://stbm7resourcesprod.blob.core.windows.net/profilepicture/8b93f1d5-235b-4587-af6b-9d9ebf316e54.jpg"
                  alt="Raphaelle Albetho Wijaya"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-3xl">
                  RA
                </AvatarFallback>
              </Avatar>
              <h4 className="font-semibold text-2xl text-gray-900 dark:text-white mb-2">
                Raphaelle Albetho Wijaya
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-mono">
                2602168406
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-4">
                IoT Engineer
              </p>
              <a
                href="https://github.com/Zweych"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 group px-6 py-3"
                >
                  <Github className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  GitHub
                </Button>
              </a>
            </div>

            {/* Aditya Fajri */}
            <div className="text-center group">
              <Avatar className="w-24 h-24 mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AvatarImage
                  src="https://stbm7resourcesprod.blob.core.windows.net/profilepicture/c8774b5b-f6ab-4917-b9ad-b88d4a392b8b.jpg"
                  alt="Aditya Fajri"
                />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-3xl">
                  AF
                </AvatarFallback>
              </Avatar>
              <h4 className="font-semibold text-2xl text-gray-900 dark:text-white mb-2">
                Aditya Fajri
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-mono">
                2602113205
              </p>
              <p className="text-green-600 dark:text-green-400 font-medium text-lg mb-4">
                System Architect
              </p>
              <a
                href="https://github.com/tya-dittyaa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 group px-6 py-3"
                >
                  <Github className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/50 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                Smart Canopy IoT System
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-light">
              © 2025 KERAD Technologies. All rights reserved.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
              Built with 💚 for a smarter IoT future
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
