import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  TrendingUp, 
  MessageCircle,
  Map,
  Fuel,
  Bell,
  ArrowRight,
  Play,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';
//import { Map } from "lucide-react";   // ✅ valid icon


export function LandingPage({ onGetStarted }) {
  const handleDemoClick = () => {
    // Could trigger a demo modal or scroll to demo section
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-8 w-8 text-blue-600" />
              <span className="text-2xl text-gray-900">RouteOptimizer</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#about"  className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="#feautures" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Contact</button>
              <Button 
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl text-gray-900 leading-tight">
                Plan Smarter. Drive Faster. Save Costs.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                AI-powered route optimization for logistics, delivery, and travel. 
                Get the most efficient routes in seconds.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                onClick={handleDemoClick}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                See Demo
              </Button>
            </div>
          </div>

          {/* Hero Image - Interactive Map Illustration */}
          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-blue-100 via-green-100 to-blue-200 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-4">
                {/* Mock optimized route visualization */}
                <div className="relative h-full">
                  {/* Route points */}
                  <div className="absolute top-4 left-4 w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                  <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                  
                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path 
                      d="M 24 24 Q 200 100 200 120 Q 200 140 180 200 Q 160 260 280 280" 
                      stroke="#3B82F6" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
                
                {/* Floating stats */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-sm text-gray-600">Efficiency</div>
                  <div className="text-lg text-green-600">+23%</div>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-sm text-gray-600">Time Saved</div>
                  <div className="text-lg text-blue-600">18 min</div>
                </div>
              </div>
              
              <div className="text-center z-10">
                <Map className="h-12 w-12 text-white mx-auto mb-2 drop-shadow-lg" />
                
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about"
       className="container mx-auto px-4 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to optimize your routes and start saving time and money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm text-center group hover:shadow-xl transition-shadow duration-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-4">1. Input Your Stops</h3>
              <p className="text-gray-600">
                Add your starting location, destination, and any stops along the way. 
                Our interface makes it quick and easy.
              </p>
            </Card>

            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm text-center group hover:shadow-xl transition-shadow duration-200">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-4">2. AI Optimizes Routes</h3>
              <p className="text-gray-600">
                Our advanced algorithms analyze traffic patterns, distances, and road conditions 
                to find the most efficient path.
              </p>
            </Card>

            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm text-center group hover:shadow-xl transition-shadow duration-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-4">3. Get Instant Best Path</h3>
              <p className="text-gray-600">
                Receive your optimized route with detailed analytics, time savings, 
                and efficiency metrics in seconds.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="feautures" 
      className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-4">Why Choose RouteOptimizer?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make your routing smarter and more efficient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm group hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Save Travel Time</h3>
              <p className="text-gray-600 text-sm">
                Reduce travel time by up to 25% with intelligent route optimization that considers real-time conditions.
              </p>
            </Card>

            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm group hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Fuel className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Reduce Fuel Costs</h3>
              <p className="text-gray-600 text-sm">
                Cut fuel expenses by optimizing distances and avoiding traffic congestion with smart routing.
              </p>
            </Card>

            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm group hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 rounded-lg mb-4 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">
                Get live traffic updates and route adjustments to avoid delays and maintain optimal efficiency.
              </p>
            </Card>

            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm group hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600 text-sm">
                Built-in chatbot assistant helps explain optimization results and answers your routing questions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-section" className="container mx-auto px-4 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-gray-900 mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600">
              Experience the power of intelligent route optimization
            </p>
          </div>

          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-blue-200 via-green-200 to-blue-300 rounded-lg h-96 flex items-center justify-center relative">
              {/* Sample route with multiple stops */}
              <div className="absolute inset-8 flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full shadow-lg mb-2"></div>
                  <span className="text-sm text-white bg-black/20 px-2 py-1 rounded backdrop-blur-sm">Warehouse</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg mb-2"></div>
                  <span className="text-sm text-white bg-black/20 px-2 py-1 rounded backdrop-blur-sm">Stop 1</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg mb-2"></div>
                  <span className="text-sm text-white bg-black/20 px-2 py-1 rounded backdrop-blur-sm">Stop 2</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg mb-2"></div>
                  <span className="text-sm text-white bg-black/20 px-2 py-1 rounded backdrop-blur-sm">Stop 3</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg mb-2"></div>
                  <span className="text-sm text-white bg-black/20 px-2 py-1 rounded backdrop-blur-sm">Return</span>
                </div>
              </div>

              {/* Route efficiency badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-lg text-gray-900">Route Optimized!</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Saved:</span>
                    <span className="text-green-600">23 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="text-blue-600">-12.3 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="text-purple-600">91%</span>
                  </div>
                </div>
              </div>

              
            </div>
            
            <div className="text-center mt-8">
              <Button 
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Try Route Demo
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Call-to-Action Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl text-white mb-6">Start Optimizing Now</h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of businesses saving time and money with intelligent route optimization. 
              Get started today and see the difference AI can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
              <Button 
                variant="outline"
                className="border-white text-blue-600 hover:bg-white/10 px-8 py-3 text-lg"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="h-6 w-6 text-blue-600" />
                  <span className="text-xl text-gray-900">RouteOptimizer</span>
                </div>
                <p className="text-gray-600 mb-4 max-w-md">
                  AI-powered route optimization platform helping businesses and individuals 
                  plan smarter routes, save time, and reduce costs.
                </p>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                    <span className="text-sm text-gray-600">f</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                    <span className="text-sm text-gray-600">t</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                    <span className="text-sm text-gray-600">in</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-gray-900 mb-4">Product</h4>
                <div className="space-y-2">
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">Features</button>
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">API</button>
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">Documentation</button>
                </div>
              </div>
              
              <div>
                <h4 className="text-gray-900 mb-4">Company</h4>
                <div className="space-y-2">
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">About</button>
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">Contact</button>
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">Support</button>
                  <button className="block text-gray-600 hover:text-gray-900 transition-colors">Privacy</button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-8 pt-8 text-center">
              <p className="text-gray-600">
                © 2025 RouteOptimizer. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}