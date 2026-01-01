export interface ParsedPlayRecordDate {
  year: string
  month: string
  source: 'payload' | 'fallback'
  valid: boolean
  format?: string
}

function pad2 (value: number): string {
  return value >= 10 ? `${value}` : `0${value}`
}

export function resolvePlayRecordYearMonth (dateValue: unknown, fallbackDate: Date): ParsedPlayRecordDate {
  if (typeof dateValue === 'string') {
    const trimmed = dateValue.trim()
    const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed)
    if (ddmmyyyy != null) {
      return {
        year: ddmmyyyy[3],
        month: ddmmyyyy[2],
        source: 'payload',
        valid: true,
        format: 'DD/MM/YYYY'
      }
    }

    const iso = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(trimmed)
    if (iso != null) {
      return {
        year: iso[1],
        month: iso[2],
        source: 'payload',
        valid: true,
        format: 'YYYY-MM-DD'
      }
    }
  }

  return {
    year: `${fallbackDate.getUTCFullYear()}`,
    month: pad2(fallbackDate.getUTCMonth() + 1),
    source: 'fallback',
    valid: false,
    format: 'fallback'
  }
}
