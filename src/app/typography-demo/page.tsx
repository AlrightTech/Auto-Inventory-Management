'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { textStyles, typography } from '@/lib/typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TypographyDemo() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center">
          <h1 className={textStyles.h1}>Typography System Demo</h1>
          <ThemeToggle />
        </div>

        {/* Typography Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Headings */}
          <Card>
            <CardHeader>
              <CardTitle className={textStyles.h3}>Dashboard Headings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h1 className={textStyles.h1}>Heading 1 - Dashboard Title</h1>
              <h2 className={textStyles.h2}>Heading 2 - Section Title</h2>
              <h3 className={textStyles.h3}>Heading 3 - Subsection</h3>
              <h4 className={textStyles.h4}>Heading 4 - Card Title</h4>
              <h5 className={textStyles.h5}>Heading 5 - Small Title</h5>
              <h6 className={textStyles.h6}>Heading 6 - Label</h6>
            </CardContent>
          </Card>

          {/* Subtitles and Labels */}
          <Card>
            <CardHeader>
              <CardTitle className={textStyles.h3}>Subtitles & Labels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={textStyles.subtitle}>Regular subtitle text</p>
              <p className={textStyles.subtitleLarge}>Large subtitle text</p>
              <p className={textStyles.muted}>Muted text for secondary information</p>
              <p className={textStyles.mutedLarge}>Large muted text</p>
            </CardContent>
          </Card>

          {/* Card Values */}
          <Card>
            <CardHeader>
              <CardTitle className={textStyles.h3}>Card & Metric Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className={textStyles.subtitle}>Total Vehicles</p>
                <p className={textStyles.cardValue}>1,247</p>
              </div>
              <div className="space-y-2">
                <p className={textStyles.subtitle}>Revenue This Month</p>
                <p className={textStyles.cardValueSmall}>$45,230</p>
              </div>
              <div className="space-y-2">
                <p className={textStyles.subtitle}>Active Users</p>
                <p className={textStyles.cardValue}>89</p>
              </div>
            </CardContent>
          </Card>

          {/* Links and Accents */}
          <Card>
            <CardHeader>
              <CardTitle className={textStyles.h3}>Links & Accents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a href="#" className={textStyles.link}>Regular link</a>
              <br />
              <a href="#" className={textStyles.linkSmall}>Small link</a>
              <br />
              <a href="#" className={textStyles.linkLarge}>Large link</a>
              <br />
              <Button className={textStyles.linkAccent}>Button with accent colors</Button>
            </CardContent>
          </Card>
        </div>

        {/* Body Text */}
        <Card>
          <CardHeader>
            <CardTitle className={textStyles.h3}>Body Text Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={textStyles.body}>
              This is regular body text using the new typography system. It should be easy to read and maintain consistent styling across the application.
            </p>
            <p className={textStyles.bodySmall}>
              This is smaller body text, perfect for descriptions and secondary information.
            </p>
            <p className={textStyles.bodyLarge}>
              This is larger body text, useful for important content that needs emphasis.
            </p>
          </CardContent>
        </Card>

        {/* Color Reference */}
        <Card>
          <CardHeader>
            <CardTitle className={textStyles.h3}>Color Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-[#111827] rounded"></div>
                <p className={textStyles.subtitle}>#111827</p>
                <p className={textStyles.muted}>Dashboard headings</p>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-16 bg-[#4B5563] rounded"></div>
                <p className={textStyles.subtitle}>#4B5563</p>
                <p className={textStyles.muted}>Subtitles/labels</p>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-16 bg-[#000000] rounded"></div>
                <p className={textStyles.subtitle}>#000000</p>
                <p className={textStyles.muted}>Card values</p>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-16 bg-[#1E3A8A] rounded"></div>
                <p className={textStyles.subtitle}>#1E3A8A</p>
                <p className={textStyles.muted}>Links/accents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
