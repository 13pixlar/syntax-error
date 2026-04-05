import { Link, Outlet } from 'react-router-dom'
import { CircleHelp, Gamepad2, Star } from 'lucide-react'

import { HeaderSearch } from '@/components/HeaderSearch'
import { PlayerBar } from '@/components/PlayerBar'
import { cn } from '@/lib/utils'

export function Layout() {
  return (
    <div className="relative flex min-h-svh flex-col pb-28">
      <header className="border-b border-border/80 bg-card/40 px-4 py-4 backdrop-blur-sm md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                to="/"
                className="font-display text-lg tracking-tight text-primary md:text-xl"
              >
                Syntax Error
              </Link>
              <Link
                to="/games"
                className={cn(
                  'inline-flex items-center gap-1.5 font-body text-muted-foreground text-sm hover:text-primary md:text-base',
                )}
              >
                <Gamepad2 className="size-4 shrink-0 text-primary" aria-hidden />
                Browse by game
              </Link>
              <Link
                to="/favorites"
                className={cn(
                  'inline-flex items-center gap-1.5 font-body text-muted-foreground text-sm hover:text-primary md:text-base',
                )}
              >
                <Star className="size-4 shrink-0 text-primary" aria-hidden />
                Favorites
              </Link>
              <Link
                to="/about"
                className={cn(
                  'inline-flex items-center gap-1.5 font-body text-muted-foreground text-sm hover:text-primary md:text-base',
                )}
              >
                <CircleHelp className="size-4 shrink-0 text-primary" aria-hidden />
                About
              </Link>
            </div>
            <p className="mt-1 font-body text-muted-foreground text-base md:text-lg">
              8-bit &amp; 16-bit SID radio — episode archive
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-auto sm:min-w-[min(100%,22rem)] sm:max-w-xl lg:max-w-2xl">
            <HeaderSearch />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-8">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-6xl border-t border-border/40 px-4 py-6 md:px-8">
        <div className="max-w-3xl space-y-3 font-body text-muted-foreground text-xs leading-relaxed md:text-sm">
          <p>
            <Link to="/about" className="text-primary/90 underline-offset-2 hover:underline">
              About this archive
            </Link>
            {' · '}
            <a
              href="https://www.syntaxerror.nu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/90 underline-offset-2 hover:underline"
            >
              syntaxerror.nu
            </a>{' '}
            — original Syntax Error radio site.
          </p>
          <p>
            Copyright ©2000-2004 Syntax Error™ &amp; Mygrandmotherisgone™ Productions. All Rights Reserved.
          </p>
          <p>
            The &quot;systems&quot; listed on this page are patented by their
            respective patent holders, and the names are trademarked by their
            respective trademark holders.
          </p>
        </div>
      </footer>
      <PlayerBar />
    </div>
  )
}
