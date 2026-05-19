// @ts-ignore
import request from '../api/request.js'

export interface AiRecognitionCandidate {
  breed: string
  breedCn: string
  confidence: number
}

export interface AiRecognitionResult {
  breed: string
  breedCn: string
  confidence: number
  petType: string
  petTypeCn: string
  top5: AiRecognitionCandidate[]
}

export interface PetFaceVerifyResult {
  samePet: boolean
  similarity: number
  threshold: number
  confidenceLevel: string
  modelVersion: string
}

export interface PetFaceMatchResult {
  petId: number
  petName: string
  petType: number
  petTypeDesc: string
  breed: string
  gender: string
  avatar: string
  ownerName: string
  ownerPhone: string
  similarity: number
  confidenceLevel: string
  modelVersion: string
}

export async function recognizePetImage(file: File): Promise<AiRecognitionResult> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await request.post('/api/ai/recognize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 65000
  })

  if (res?.code !== 200 || !res?.data) {
    throw new Error(res?.message || 'AI识别失败，请稍后重试')
  }

  return res.data as AiRecognitionResult
}

export async function verifySamePet(file1: File, file2: File): Promise<PetFaceVerifyResult> {
  const formData = new FormData()
  formData.append('file1', file1)
  formData.append('file2', file2)

  const res = await request.post('/api/ai/petface/verify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 65000
  })

  if (res?.code !== 200 || !res?.data) {
    throw new Error(res?.message || '同宠验证失败，请稍后重试')
  }

  return res.data as PetFaceVerifyResult
}

export async function searchSimilarPets(file: File, topK = 5): Promise<PetFaceMatchResult[]> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('topK', String(topK))

  const res = await request.post('/api/ai/petface/search', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 65000
  })

  if (res?.code !== 200) {
    throw new Error(res?.message || '相似宠物检索失败，请稍后重试')
  }

  return (res.data || []) as PetFaceMatchResult[]
}

export async function saveLostPostMatches(
  lostPostId: number,
  queryImageUrl: string,
  matches: PetFaceMatchResult[]
): Promise<void> {
  const res = await request.post(`/api/lost/${lostPostId}/petface/matches`, {
    queryImageUrl,
    matches
  })

  if (res?.code !== 200) {
    throw new Error(res?.message || '保存匹配记录失败')
  }
}

export async function getLostPostMatches(lostPostId: number): Promise<PetFaceMatchResult[]> {
  const res = await request.get(`/api/lost/${lostPostId}/petface/matches`)

  if (res?.code !== 200) {
    throw new Error(res?.message || '获取匹配记录失败')
  }

  return (res.data || []) as PetFaceMatchResult[]
}
