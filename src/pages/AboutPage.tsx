import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

import { Seo } from '@/components/Seo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SEO } from '@/lib/seo/staticCopy'

export function AboutPage() {
  return (
    <div className="space-y-8">
      <Seo
        title={SEO.about.title}
        description={SEO.about.description}
        canonicalPath="/about"
      />
      <div>
        <h1 className="font-display text-2xl text-primary md:text-3xl">About this site</h1>
        <p className="mt-2 font-body text-muted-foreground text-lg">
          What this archive is and who it is for.
        </p>
      </div>

      <Card className="border-border/80 bg-card/40">
        <CardHeader>
          <CardTitle className="font-display text-base text-primary md:text-lg">
            What we built here
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 font-body text-muted-foreground leading-relaxed">
          <p>
            This is an unofficial, fan-maintained web app for the{' '}
            <strong className="text-foreground">Syntax Error</strong> radio show — 8-bit and 16-bit
            SID and related music. You can browse every episode, see playlists where we have them,
            stream main-show MP3s in the browser, queue favorites, and explore episodes by game.
          </p>
          <p>
            Episode data and playlist metadata are served from a database; audio files stay on
            their original hosts (we do not mirror the music in our own storage). The interface is
            deliberately retro: dark phosphor-style colors, pixel display headings, and a fixed
            player bar so you can keep listening while you browse.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/40">
        <CardHeader>
          <CardTitle className="font-display text-base text-primary md:text-lg">
            Why this exists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 font-body text-muted-foreground leading-relaxed">
          <p>
            This site is made by{' '}
            <strong className="text-foreground">fried_eggz</strong> to keep this valuable content
            available and easy to enjoy for listeners around the world — long after old pages or
            players may be hard to use or find.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/40">
        <CardHeader>
          <CardTitle className="font-display text-base text-primary md:text-lg">
            Credit to the original creators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 font-body text-muted-foreground leading-relaxed">
          <p>
            The <strong className="text-foreground">Syntax Error</strong> show, branding, and the
            original website are the work of their creators — not this project. All respect and
            credit belong to them.
          </p>
          <p>
            For the authoritative, original experience and history, visit{' '}
            <a
              href="https://www.syntaxerror.nu/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
            >
              syntaxerror.nu
              <ExternalLink className="size-3.5 shrink-0" aria-hidden />
            </a>
            .
          </p>
          <p className="text-xs md:text-sm">
            The legal notices in the site footer (copyright, trademarks, etc.) reflect the original
            production; this mirror is offered in good faith to help fans listen and explore the
            archive.
          </p>
        </CardContent>
      </Card>

      <p className="font-body text-muted-foreground text-sm">
        <Link to="/" className="text-primary underline-offset-2 hover:underline">
          ← Back to episodes
        </Link>
      </p>
    </div>
  )
}
