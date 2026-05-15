// @ts-ignore
import request from '../api/request.js'
import { listFavorites } from './favorites'
import { listForumPosts } from './forumPosts'

const FORUM_MIGRATION_KEY = 'forum_backend_migrated_v2'

export async function migrateLegacyForumData() {
  if (typeof localStorage === 'undefined') return
  if (!localStorage.getItem('token')) return
  if (localStorage.getItem(FORUM_MIGRATION_KEY) === 'done') return

  const legacyPosts = listForumPosts()
  const legacyForumFavorites = listFavorites().filter((item) => item.kind === 'forum')

  if (legacyPosts.length === 0 && legacyForumFavorites.length === 0) {
    localStorage.setItem(FORUM_MIGRATION_KEY, 'done')
    return
  }

  if (legacyPosts.length > 0) {
    await request.post('/api/forum/import-local', legacyPosts)
  }

  for (const favorite of legacyForumFavorites) {
    try {
      await request.post(`/api/forum/posts/${favorite.id}/favorite`)
    } catch {
      // ignore duplicate or missing favorite imports
    }
  }

  localStorage.setItem(FORUM_MIGRATION_KEY, 'done')
}
