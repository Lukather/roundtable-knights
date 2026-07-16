export const AVATAR_COLORS = [
  'bg-purple-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-600',
  'bg-amber-600', 'bg-cyan-600', 'bg-pink-600', 'bg-indigo-600',
]

const AVATAR_COLORS_HEX = [
  '#9333ea', '#2563eb', '#059669', '#e11d48',
  '#d97706', '#0891b2', '#db2777', '#4f46e5',
]

function colorIndex(id: string): number {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return sum % AVATAR_COLORS.length
}

export function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export function avatarColor(id: string): string {
  return AVATAR_COLORS[colorIndex(id)]
}

export function avatarColorHex(id: string): string {
  return AVATAR_COLORS_HEX[colorIndex(id)]
}
