import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">UI Showcase</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <NavigationMenu.Root>
              <NavigationMenu.List className="flex space-x-6">
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    href="#"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Home
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    href="#features"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Features
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    href="#pricing"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Pricing
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    href="#contact"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Contact
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </nav>
        </div>
        <div>
          <Button variant="outline" className="rounded-full">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
