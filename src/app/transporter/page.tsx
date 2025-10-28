'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  Package, 
  MessageCircle,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockMetrics = {
  availableVehicles: 1247,
  favorites: 12,
  activeInquiries: 3,
  purchaseHistory: 8,
  savedSearches: 5,
  unreadMessages: 2,
};

const mockFeaturedVehicles = [
  {
    id: 1,
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 18500,
    location: 'Los Angeles, CA',
    mileage: 25000,
    image: '/api/placeholder/300/200',
    rating: 4.8,
    isFavorite: true,
  },
  {
    id: 2,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 22000,
    location: 'San Francisco, CA',
    mileage: 32000,
    image: '/api/placeholder/300/200',
    rating: 4.6,
    isFavorite: false,
  },
  {
    id: 3,
    make: 'Ford',
    model: 'F-150',
    year: 2019,
    price: 35000,
    location: 'Austin, TX',
    mileage: 45000,
    image: '/api/placeholder/300/200',
    rating: 4.9,
    isFavorite: true,
  },
];

const mockRecentSearches = [
  'Honda Civic 2020-2022',
  'Toyota under $25,000',
  'Ford F-150 near me',
  'Low mileage vehicles',
  'Electric vehicles',
];

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  delay = 0 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="glass-card hover-glow transition-all duration-300 glow-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-blue-400 glow-text" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const VehicleCard = ({ vehicle }: { vehicle: typeof mockFeaturedVehicles[0] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="group"
  >
    <Card className="glass-card hover-glow transition-all duration-300 cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <div className="h-48 bg-slate-800 rounded-t-lg flex items-center justify-center">
            <Package className="h-16 w-16 text-slate-600" />
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 p-2 h-8 w-8"
          >
            <Heart className={`h-4 w-4 ${vehicle.isFavorite ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
          </Button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-slate-300">{vehicle.rating}</span>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center text-sm text-slate-400">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="font-semibold text-white">${vehicle.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-sm text-slate-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{vehicle.location}</span>
            </div>
            <div className="flex items-center text-sm text-slate-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{vehicle.mileage.toLocaleString()} miles</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1 gradient-primary hover:opacity-90">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Inquire
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function TransporterDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Transporter Dashboard
          </h1>
          <p className="text-muted-foreground">
            Discover and purchase vehicles from trusted sellers
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button className="gradient-primary hover:opacity-90 glow-border">
            <Search className="w-4 h-4 mr-2" />
            Browse All
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search for vehicles by make, model, year, or VIN..."
                className="pl-10 pr-4 py-3 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Available Vehicles"
          value={mockMetrics.availableVehicles}
          icon={Search}
          delay={0.2}
        />
        <MetricCard
          title="My Favorites"
          value={mockMetrics.favorites}
          icon={Heart}
          delay={0.3}
        />
        <MetricCard
          title="Active Inquiries"
          value={mockMetrics.activeInquiries}
          icon={MessageCircle}
          delay={0.4}
        />
        <MetricCard
          title="Purchase History"
          value={mockMetrics.purchaseHistory}
          icon={Package}
          delay={0.5}
        />
        <MetricCard
          title="Saved Searches"
          value={mockMetrics.savedSearches}
          icon={Search}
          delay={0.6}
        />
        <MetricCard
          title="Unread Messages"
          value={mockMetrics.unreadMessages}
          icon={MessageCircle}
          delay={0.7}
        />
      </div>

      {/* Featured Vehicles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Featured Vehicles</CardTitle>
            <CardDescription className="text-slate-400">
              Popular vehicles you might be interested in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFeaturedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Searches and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Recent Searches</CardTitle>
              <CardDescription className="text-slate-400">
                Your recent search queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockRecentSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors cursor-pointer"
                  >
                    <Search className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">{search}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <Search className="h-6 w-6" />
                  <span>Browse All</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <Heart className="h-6 w-6" />
                  <span>Favorites</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <Package className="h-6 w-6" />
                  <span>My Orders</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>Messages</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
