import { AISummary } from './mandala'

/**
 * API Request and Response Types
 */

// Edge Function: Generate AI Summary
export interface GenerateSummaryRequest {
  mandalaId: string
}

export interface GenerateSummaryResponse {
  success: boolean
  data?: AISummary
  error?: string
}

// Auth
export interface SignInWithEmailRequest {
  email: string
  emailRedirectTo: string
  marketingConsent: boolean
}

export interface SignInWithEmailResponse {
  success: boolean
  error?: string
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
