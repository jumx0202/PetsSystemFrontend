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
