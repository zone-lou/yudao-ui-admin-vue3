import dayjs from 'dayjs'

export type OutingCalendar = Record<string, boolean>

type TimeValue = string | number | Date | null | undefined

/** 与 08:30—11:30、13:30—17:30 各时段有实际重叠分别计半天。 */
export const calculateOutingDays = (begin: TimeValue, end: TimeValue, calendar: OutingCalendar = {}): number | null => {
  if (begin == null || begin === '' || end == null || end === '') return null
  const parse = (value: Exclude<TimeValue, null | undefined>) =>
    dayjs(typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value)
  const start = parse(begin)
  const finish = parse(end)
  if (!start.isValid() || !finish.isValid() || finish.isBefore(start)) return null
  if (finish.isSame(start)) return 0
  let days = 0
  for (let date = start.startOf('day'); date.isBefore(finish); date = date.add(1, 'day')) {
    const configured = calendar[date.format('YYYY-MM-DD')]
    if (!(configured ?? (date.day() !== 0 && date.day() !== 6))) continue
    const morningStart = date.hour(8).minute(30)
    const morningEnd = date.hour(11).minute(30)
    const afternoonStart = date.hour(13).minute(30)
    const afternoonEnd = date.hour(17).minute(30)
    if (start.isBefore(morningEnd) && finish.isAfter(morningStart)) days += 0.5
    if (start.isBefore(afternoonEnd) && finish.isAfter(afternoonStart)) days += 0.5
  }
  return days
}
