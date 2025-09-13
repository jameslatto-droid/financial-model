export function objToRows(obj: Record<string, any[]>) {
  const keys = Object.keys(obj)
  if (keys.length === 0) return []
  const length = Math.max(...keys.map(k => (obj[k]?.length ?? 0)))
  const rows: Record<string, any>[] = []
  for (let i = 0; i < length; i++) {
    const row: Record<string, any> = {}
    for (const k of keys) {
      row[k] = (obj[k] && obj[k][i] !== undefined) ? obj[k][i] : ''
    }
    rows.push(row)
  }
  return rows
}

function arrayToRows(arr: any[]) {
  if (arr.length === 0) return []
  if (typeof arr[0] !== 'object') {
    return arr.map((v, i) => ({ index: i + 1, value: v }))
  }
  return arr
}

export function toCSV(data: any): string {
  let rows: any[] = []
  if (Array.isArray(data)) rows = arrayToRows(data)
  else if (data && typeof data === 'object') {
    const maybeArrays = Object.values(data).every(v => Array.isArray(v))
    if (maybeArrays) {
      rows = objToRows(data as Record<string, any[]>)
    } else if (data.rows && Array.isArray(data.rows)) {
      rows = arrayToRows(data.rows)
    } else {
      rows = [data]
    }
  } else {
    rows = [{ value: String(data) }]
  }

  if (rows.length === 0) return ''

  const headers = Array.from(rows.reduce((acc, r) => { Object.keys(r).forEach(k => acc.add(k)); return acc }, new Set<string>()))
  const lines = [headers.join(',')]
  for (const r of rows) {
    const line = headers.map(h => {
      const v = r[h] === undefined || r[h] === null ? '' : String(r[h])
      const escaped = v.includes('"') || v.includes(',') || v.includes('\n') ? '"' + v.replace(/"/g, '""') + '"' : v
      return escaped
    }).join(',')
    lines.push(line)
  }
  return lines.join('\n')
}

export function downloadCSV(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
