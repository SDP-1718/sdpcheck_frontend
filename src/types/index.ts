export interface Notice { id: string; title: string; body: string; date: string; author: string; pinned: boolean }
export interface Schedule { id: string; title: string; date: string; time: string; location: string }
export interface Member { id: string; name: string; generation: number; admin: boolean; attendance: number; late: number; absent: number }
