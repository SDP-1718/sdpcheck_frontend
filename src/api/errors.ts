export class ApiError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code }
}
export function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) return '로그인이 만료되었습니다. 다시 로그인해주세요.'
  if (error instanceof ApiError && error.status === 403) return '이 화면에 접근할 권한이 없습니다.'
  if (error instanceof ApiError && error.status === 404) return '요청한 정보를 찾을 수 없습니다.'
  return '정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
}
