'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  DollarSign,
  Clock,
  Star,
  Package
} from 'lucide-react';
import { textStyles } from '@/lib/typography';

// Mock data for demonstration
const mockVehicles = [
  {
    id: 1,
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 18500,
    location: 'Los Angeles, CA',
    mileage: 25000,
    rating: 4.8,
    isFavorite: true,
    image: '/api/placeholder/300/200',
    seller: 'AutoMax Dealers',
    features: ['A/C', 'Navigation', 'Backup Camera'],
  },
  {
    id: 2,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 22000,
    location: 'San Francisco, CA',
    mileage: 32000,
    rating: 4.6,
    isFavorite: false,
    image: '/api/placeholder/300/200',
    seller: 'Premier Motors',
    features: ['A/C', 'Leather Seats', 'Sunroof'],
  },
  {
    id: 3,
    make: 'Ford',
    model: 'F-150',
    year: 2019,
    price: 35000,
    location: 'Austin, TX',
    mileage: 45000,
    rating: 4.9,
    isFavorite: true,
    image: '/api/placeholder/300/200',
    seller: 'Texas Truck Center',
    features: ['4WD', 'Towing Package', 'Bed Liner'],
  },
  {
    id: 4,
    make: 'BMW',
    model: '3 Series',
    year: 2022,
    price: 42000,
    location: 'Miami, FL',
    mileage: 15000,
    rating: 4.7,
    isFavorite: false,
    image: '/api/placeholder/300/200',
    seller: 'Luxury Auto Group',
    features: ['Leather', 'Navigation', 'Premium Sound'],
  },
  {
    id: 5,
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2020,
    price: 38000,
    location: 'Denver, CO',
    mileage: 28000,
    rating: 4.5,
    isFavorite: false,
    image: '/api/placeholder/300/200',
    seller: 'Mountain Auto',
    features: ['4WD', 'Crew Cab', 'Towing Package'],
  },
  {
    id: 6,
    make: 'Nissan',
    model: 'Altima',
    year: 2021,
    price: 19500,
    location: 'Phoenix, AZ',
    mileage: 22000,
    rating: 4.4,
    isFavorite: true,
    image: '/api/placeholder/300/200',
    seller: 'Desert Motors',
    features: ['A/C', 'Bluetooth', 'Backup Camera'],
  },
];

const VehicleCard = ({ vehicle }: { vehicle: typeof mockVehicles[0] }) => (
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
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-blue-900/80 text-blue-300 text-xs rounded-full">
              {vehicle.year}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white text-lg">
              {vehicle.make} {vehicle.model}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-slate-300">{vehicle.rating}</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-slate-400">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="font-semibold text-white text-lg">${vehicle.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-sm text-slate-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{vehicle.location}</span>
            </div>
            <div className="flex items-center text-sm text-slate-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{vehicle.mileage.toLocaleString()} miles</span>
            </div>
            <div className="text-sm text-slate-400">
              <span className="text-slate-500">Seller:</span> {vehicle.seller}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                >
                  {feature}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                  +{vehicle.features.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" className="flex-1 gradient-primary hover:opacity-90">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Inquire
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function BrowseVehiclesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">
            Browse Vehicles
          </h1>
          <p className="text-slate-400 mt-1">
            Discover vehicles from trusted sellers across the platform
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
            <MapPin className="w-4 h-4 mr-2" />
            Map View
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search by make, model, year, or VIN..."
                    className="pl-10 pr-4 py-3 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  Under $25K
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  Low Mileage
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  Near Me
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <p className="text-slate-400">
            Showing {mockVehicles.length} vehicles
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-1 text-sm">
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Year: Newest First</option>
              <option>Mileage: Lowest First</option>
              <option>Distance: Nearest First</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Vehicle Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </motion.div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
          Load More Vehicles
        </Button>
      </motion.div>
    </div>
  );
}
