import type { ReactNode } from 'react'
import { PreviewContext, usePreviewData } from './previewStore'

export function PreviewProvider({ children }: { children: ReactNode }) {
  return <PreviewContext.Provider value={usePreviewData()}>{children}</PreviewContext.Provider>
}
