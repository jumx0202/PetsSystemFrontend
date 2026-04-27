// const BASE_URL = 'http://localhost:8080'

// export function testConnection() {
//   return fetch(`${BASE_URL}/api/test/ping`)
//     .then(res => res.json())
// }

import request from './request.js'

export const testPing = () => {
  return request.get('/api/test/ping')
}