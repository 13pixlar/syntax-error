import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EpisodeSortMode } from '@/lib/episodeSort'

const OPTIONS: { value: EpisodeSortMode; label: string }[] = [
  { value: 'ref-asc', label: 'Episode #' },
  { value: 'air-date-desc', label: 'Air date (newest)' },
  { value: 'air-date-asc', label: 'Air date (oldest)' },
  { value: 'rating-desc', label: 'Highest rated' },
  { value: 'rating-asc', label: 'Lowest rated' },
]

const ITEMS: Record<EpisodeSortMode, string> = {
  'ref-asc': 'Episode #',
  'air-date-desc': 'Air date (newest)',
  'air-date-asc': 'Air date (oldest)',
  'rating-desc': 'Highest rated',
  'rating-asc': 'Lowest rated',
}

type Props = {
  value: EpisodeSortMode
  onChange: (mode: EpisodeSortMode) => void
  id?: string
}

export function EpisodeSortSelect({ value, onChange, id }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor={id}
        className="font-body text-muted-foreground text-sm whitespace-nowrap"
      >
        Sort by
      </label>
      <Select
        value={value}
        items={ITEMS}
        onValueChange={(v) => {
          if (v) onChange(v as EpisodeSortMode)
        }}
      >
        <SelectTrigger id={id} size="sm" className="min-w-[12rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
