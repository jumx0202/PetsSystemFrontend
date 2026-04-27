export type CommentKind = 'adoption' | 'lost'

export interface PostComment {
  id: number
  author: string
  authorAvatar?: string
  content: string
  time: number
  parentId?: number
  replyTo?: string
}

type StoreShape = Record<CommentKind, Record<string, PostComment[]>>

const STORAGE_KEY = 'pet_post_comments_v1'

function parseStore(raw: string | null): StoreShape {
  const empty: StoreShape = { adoption: {}, lost: {} }
  if (!raw) return empty
  try {
    const obj = JSON.parse(raw) as any
    if (!obj || typeof obj !== 'object') return empty
    const result: StoreShape = { adoption: {}, lost: {} }
    ;(['adoption', 'lost'] as const).forEach(kind => {
      const bucket = obj[kind]
      if (!bucket || typeof bucket !== 'object') return
      Object.keys(bucket).forEach(id => {
        const arr = bucket[id]
        if (!Array.isArray(arr)) return
        result[kind][id] = arr
          .filter((c: any) => c && typeof c === 'object')
          .map((c: any): PostComment => ({
            id: typeof c.id === 'number' ? c.id : Date.now(),
            author: typeof c.author === 'string' ? c.author : '匿名',
            authorAvatar: typeof c.authorAvatar === 'string' ? c.authorAvatar : undefined,
            content: typeof c.content === 'string' ? c.content : '',
            time: typeof c.time === 'number' ? c.time : Date.now(),
            parentId: typeof c.parentId === 'number' ? c.parentId : undefined,
            replyTo: typeof c.replyTo === 'string' ? c.replyTo : undefined
          }))
      })
    })
    return result
  } catch {
    return empty
  }
}

function readStore(): StoreShape {
  if (typeof localStorage === 'undefined') return { adoption: {}, lost: {} }
  return parseStore(localStorage.getItem(STORAGE_KEY))
}

function writeStore(store: StoreShape) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function listComments(kind: CommentKind, postId: number): PostComment[] {
  const store = readStore()
  return store[kind][String(postId)] ?? []
}

export function addComment(kind: CommentKind, postId: number, comment: PostComment) {
  const store = readStore()
  const key = String(postId)
  const arr = store[kind][key] ?? []
  store[kind][key] = [...arr, comment]
  writeStore(store)
}

