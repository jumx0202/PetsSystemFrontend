/**
 * 领养 / 寻宠帖子收藏（localStorage，供多页与个人中心共用）
 */
export type FavoriteKind = 'adoption' | 'lost' | 'forum'

export interface StoredFavorite {
  kind: FavoriteKind
  id: number
  image: string
  title: string
  subtitle: string
  detail?: Record<string, unknown>
}

const STORAGE_KEY = 'pet_post_favorites'

function parseList(raw: string | null): StoredFavorite[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr
      .filter((x: unknown): x is StoredFavorite => {
        if (!x || typeof x !== 'object') return false
        const o = x as Record<string, unknown>
        const kind = o.kind
        return (
          (kind === 'adoption' || kind === 'lost' || kind === 'forum') &&
          typeof o.id === 'number' &&
          typeof o.image === 'string' &&
          typeof o.title === 'string' &&
          typeof o.subtitle === 'string'
        )
      })
      .map(x => ({
        kind: x.kind,
        id: x.id,
        image: x.image,
        title: x.title,
        subtitle: x.subtitle,
        detail: (x as unknown as { detail?: Record<string, unknown> }).detail
      }))
  } catch {
    return []
  }
}

export function listFavorites(): StoredFavorite[] {
  if (typeof localStorage === 'undefined') return []
  return parseList(localStorage.getItem(STORAGE_KEY))
}

export function saveFavoriteList(list: StoredFavorite[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function isFavorite(kind: FavoriteKind, id: number): boolean {
  return listFavorites().some(f => f.kind === kind && f.id === id)
}

/** 写入或更新一条收藏 */
export function upsertFavorite(entry: StoredFavorite) {
  const list = listFavorites().filter(f => !(f.kind === entry.kind && f.id === entry.id))
  list.push(entry)
  saveFavoriteList(list)
}

export function removeFavorite(kind: FavoriteKind, id: number) {
  const list = listFavorites().filter(f => !(f.kind === kind && f.id === id))
  saveFavoriteList(list)
}

export function favoriteCount(): number {
  return listFavorites().length
}
