import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, MapPin, Clock, Map, TrendingUp, Copy, Share2, LogOut, User } from 'lucide-react';

export function ResultsPage({ routeData, routeResult, onBack, user, onLogout }) {
  const copyTripId = () => {
    navigator.clipboard.writeText(routeResult.tripId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={onBack}
              variant="ghost" 
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Planning
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Trip ID: {routeResult.tripId}
                </Badge>
                <Button variant="ghost" size="sm" onClick={copyTripId}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              {user && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </div>
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Map Section */}
        <Card className="mb-8 p-0 shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-200 via-green-200 to-blue-300 h-96 flex items-center justify-center relative">
            <div className="text-center">
              <Map className="h-16 w-16 text-white mx-auto mb-4 drop-shadow-lg" />
              <h3 className="text-white drop-shadow-lg">Optimized Route Map</h3>
              <p className="text-white/90 text-sm drop-shadow">Interactive map showing your optimized route</p>
            </div>
            
            {/* Mock route visualization */}
            <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
              <div className="flex items-center gap-4">
                {routeResult.stops.map((stop, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        index === 0 ? 'bg-green-500' : 
                        index === routeResult.stops.length - 1 ? 'bg-red-500' : 
                        'bg-blue-500'
                      } shadow-lg`}></div>
                      <span className="text-xs text-white mt-1 max-w-20 truncate">{stop}</span>
                    </div>
                    {index < routeResult.stops.length - 1 && (
                      <div className="w-8 h-0.5 bg-white/70"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Map className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl text-gray-900">{routeResult.distance}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Time</p>
                <p className="text-2xl text-gray-900">{routeResult.duration}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-2xl text-gray-900">{routeResult.efficiency}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Stops</p>
                <p className="text-2xl text-gray-900">{routeResult.stops.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Route Information */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <h3 className="mb-4 text-gray-900 flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-600" />
              Route Details
            </h3>
            <div className="space-y-4">
              {routeResult.stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    index === 0 ? 'bg-green-500' : 
                    index === routeResult.stops.length - 1 ? 'bg-red-500' : 
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{stop}</p>
                    <p className="text-sm text-gray-500">
                      {index === 0 ? 'Starting Point' : 
                       index === routeResult.stops.length - 1 ? 'Destination' : 
                       `Stop ${index}`}
                    </p>
                  </div>
                  {index < routeResult.stops.length - 1 && (
                    <div className="text-gray-400">
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <h3 className="mb-4 text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Optimization Summary
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-green-800 mb-2">Route Efficiency</h4>
                <p className="text-sm text-green-700">
                  Your route has been optimized to save approximately 15 minutes and 8.2km compared to the standard route.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-blue-800 mb-2">Traffic Considerations</h4>
                <p className="text-sm text-blue-700">
                  Route calculated based on current traffic conditions and historical data patterns.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-purple-800 mb-2">Fuel Savings</h4>
                <p className="text-sm text-purple-700">
                  Estimated fuel savings of ~12% compared to non-optimized routes.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}