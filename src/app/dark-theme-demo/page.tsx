'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { textStyles, typography, cn } from '@/lib/typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';

export default function DarkThemeDemo() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={textStyles.h1}>Dark Theme Implementation</h1>
            <p className={textStyles.subtitle}>Professional dark mode for Auto Inventory Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={textStyles.subtitle}>
              {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
            </Badge>
            <ThemeToggle />
          </div>
        </div>

        {/* Theme Status */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className={textStyles.h3}>Electric Blue Dark Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 glow-border">
                <div className={textStyles.cardValue}>Electric Blue</div>
                <div className={textStyles.subtitle}>Primary Color</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className={textStyles.cardValue}>Deep Black</div>
                <div className={textStyles.subtitle}>Background</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className={textStyles.cardValue}>Glow Effects</div>
                <div className={textStyles.subtitle}>Shiny Accents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Forms */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className={textStyles.h3}>Form Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={textStyles.subtitle}>Vehicle Make</Label>
                <Input 
                  placeholder="Enter vehicle make" 
                  className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-black dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className={textStyles.subtitle}>Vehicle Model</Label>
                <Input 
                  placeholder="Enter vehicle model" 
                  className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-black dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button className={textStyles.linkAccent}>Save Vehicle</Button>
                <Button variant="outline" className="border-gray-200 dark:border-slate-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Display */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className={textStyles.h3}>Data Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <div className={textStyles.bodySmall}>Total Vehicles</div>
                  <div className={textStyles.subtitle}>In inventory</div>
                </div>
                <div className={textStyles.cardValue}>1,247</div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <div className={textStyles.bodySmall}>Revenue</div>
                  <div className={textStyles.subtitle}>This month</div>
                </div>
                <div className={textStyles.cardValue}>$45,230</div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <div className={textStyles.bodySmall}>Active Users</div>
                  <div className={textStyles.subtitle}>Online now</div>
                </div>
                <div className={textStyles.cardValue}>89</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation & Actions */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className={textStyles.h3}>Navigation & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button className={textStyles.linkAccent}>Primary Action</Button>
              <Button variant="outline" className="border-gray-200 dark:border-slate-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800">
                Secondary Action
              </Button>
              <Button variant="ghost" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800">
                Ghost Button
              </Button>
              <a href="#" className={textStyles.link}>Text Link</a>
              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">Status Badge</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className={textStyles.h3}>Electric Blue Dark Theme Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-900 dark:bg-slate-900 rounded-lg mx-auto mb-2 glow-border"></div>
                <div className={textStyles.subtitle}>Background</div>
                <div className={textStyles.muted}>#080808</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-800 dark:bg-slate-800 rounded-lg mx-auto mb-2"></div>
                <div className={textStyles.subtitle}>Cards</div>
                <div className={textStyles.muted}>#0F0F0F</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 dark:bg-blue-500 rounded-lg mx-auto mb-2 glow-border animate-glow"></div>
                <div className={textStyles.subtitle}>Electric Blue</div>
                <div className={textStyles.muted}>#00BFFF</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-600 dark:bg-gray-600 rounded-lg mx-auto mb-2"></div>
                <div className={textStyles.subtitle}>Borders</div>
                <div className={textStyles.muted}>#262626</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <div className={textStyles.subtitle}>Text</div>
                <div className={textStyles.muted}>#FAFAFA</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-400 dark:bg-cyan-400 rounded-lg mx-auto mb-2 glow-border"></div>
                <div className={textStyles.subtitle}>Hover</div>
                <div className={textStyles.muted}>#00E5FF</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className={textStyles.h3}>Implementation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={textStyles.h5}>Theme System</h4>
                <ul className={cn("space-y-2 mt-2", textStyles.muted)}>
                  <li>• CSS custom properties for consistent theming</li>
                  <li>• Tailwind CSS dark mode with class strategy</li>
                  <li>• React Context for theme state management</li>
                  <li>• localStorage persistence</li>
                  <li>• System preference detection</li>
                </ul>
              </div>
              <div>
                <h4 className={textStyles.h5}>Typography System</h4>
                <ul className={cn("space-y-2 mt-2", textStyles.muted)}>
                  <li>• Automatic dark theme color adaptation</li>
                  <li>• Consistent contrast ratios</li>
                  <li>• Utility classes for easy implementation</li>
                  <li>• Smooth color transitions</li>
                  <li>• Accessibility compliant</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
