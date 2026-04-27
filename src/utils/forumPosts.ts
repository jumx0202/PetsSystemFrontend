export interface ForumCommentStored {
  id: number
  author: string
  authorAvatar?: string
  content: string
  time: number
  parentId?: number
  replyTo?: string
}

export interface ForumPostStored {
  id: number
  author: string
  authorAvatar?: string
  content: string
  images: string[]
  comments?: ForumCommentStored[]
  createTime: number
}

const STORAGE_KEY = 'pet_forum_posts'

function parseList(raw: string | null): ForumPostStored[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr
      .filter((x: unknown): x is ForumPostStored => {
        if (!x || typeof x !== 'object') return false
        const o = x as Record<string, unknown>
        return (
          typeof o.id === 'number' &&
          typeof o.author === 'string' &&
          typeof o.content === 'string' &&
          Array.isArray(o.images) &&
          typeof o.createTime === 'number'
        )
      })
      .map(x => ({
        id: x.id,
        author: x.author,
        authorAvatar: typeof (x as any).authorAvatar === 'string' ? (x as any).authorAvatar : undefined,
        content: x.content,
        images: Array.isArray(x.images) ? x.images.filter(i => typeof i === 'string') : [],
        comments: Array.isArray((x as any).comments)
          ? (x as any).comments
              .filter((c: any) => c && typeof c === 'object')
              .map((c: any): ForumCommentStored => ({
                id: typeof c.id === 'number' ? c.id : Date.now(),
                author: typeof c.author === 'string' ? c.author : '匿名',
                authorAvatar: typeof c.authorAvatar === 'string' ? c.authorAvatar : undefined,
                content: typeof c.content === 'string' ? c.content : '',
                time: typeof c.time === 'number' ? c.time : Date.now(),
                parentId: typeof c.parentId === 'number' ? c.parentId : undefined,
                replyTo: typeof c.replyTo === 'string' ? c.replyTo : undefined
              }))
          : [],
        createTime: x.createTime
      }))
  } catch {
    return []
  }
}

export function listForumPosts(): ForumPostStored[] {
  if (typeof localStorage === 'undefined') return []
  return parseList(localStorage.getItem(STORAGE_KEY))
}

export function saveForumPosts(list: ForumPostStored[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/** 新发布的帖子放到最前面 */
export function prependForumPost(post: ForumPostStored) {
  const list = listForumPosts().filter(p => p.id !== post.id)
  list.unshift(post)
  saveForumPosts(list)
}

export function removeForumPost(id: number) {
  const list = listForumPosts().filter(p => p.id !== id)
  saveForumPosts(list)
}

export function updateForumPost(post: ForumPostStored) {
  const list = listForumPosts().filter(p => p.id !== post.id)
  list.unshift(post)
  saveForumPosts(list)
}

