'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Search, Camera, FileText } from 'lucide-react';

interface DecodedData {
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
  country: string;
  manufacturer: string;
  bodyStyle: string;
  fuelType: string;
}

export default function VINDecodePage() {
  const [vin, setVin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);

  const handleDecode = async () => {
    if (vin.length !== 17) {
      alert('VIN must be exactly 17 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock decoded data
      setDecodedData({
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        engine: '2.5L 4-Cylinder',
        transmission: 'Automatic',
        country: 'Japan',
        manufacturer: 'Toyota Motor Corporation',
        bodyStyle: 'Sedan',
        fuelType: 'Gasoline',
      });
    } catch (error) {
      console.error('Error decoding VIN:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            VIN Decode
          </h1>
          <p className="text-slate-400 mt-1">
            Decode vehicle identification numbers and retrieve detailed vehicle information.
          </p>
        </div>
      </motion.div>

      {/* VIN Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-400" />
              VIN Decoder
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter a 17-character VIN to decode vehicle information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vin" className="text-slate-200">
                Enter VIN
              </Label>
              <div className="flex space-x-3">
                <Input
                  id="vin"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Enter 17-character VIN"
                  maxLength={17}
                  className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 font-mono"
                />
                <Button
                  onClick={handleDecode}
                  disabled={vin.length !== 17 || isLoading}
                  className="gradient-primary hover:opacity-90"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                {vin.length}/17 characters
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Camera className="w-4 h-4 mr-2" />
                Scan
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <FileText className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Decoded Results */}
      {decodedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Decoded Vehicle Information</CardTitle>
              <CardDescription className="text-slate-400">
                Vehicle details for VIN: {vin}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Make:</span>
                    <span className="text-white font-medium">{decodedData.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Model:</span>
                    <span className="text-white font-medium">{decodedData.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Year:</span>
                    <span className="text-white font-medium">{decodedData.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Engine:</span>
                    <span className="text-white font-medium">{decodedData.engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Transmission:</span>
                    <span className="text-white font-medium">{decodedData.transmission}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Country:</span>
                    <span className="text-white font-medium">{decodedData.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Manufacturer:</span>
                    <span className="text-white font-medium">{decodedData.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Body Style:</span>
                    <span className="text-white font-medium">{decodedData.bodyStyle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Fuel Type:</span>
                    <span className="text-white font-medium">{decodedData.fuelType}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button className="gradient-primary hover:opacity-90">
                  Create Vehicle Record
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  Link to Existing
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
