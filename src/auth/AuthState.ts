import { createContext, useContext } from 'react'
import type { MyInfo } from '../api/types'
import type { MemberRegistration } from '../types/registration'
export type Session = {status:'loading'} | {status:'anonymous'} | {status:'error'} | {status:'onboarding';name:string|null} | {status:'authenticated';member:MyInfo}
type AuthValue = {logoutFailed:boolean;session:Session;retry:()=>Promise<void>;register:(input:MemberRegistration)=>Promise<MyInfo>;logout:()=>Promise<void>}
export const AuthContext=createContext<AuthValue|null>(null)
export function useAuth(){const value=useContext(AuthContext);if(!value)throw Error('AuthProvider is required');return value}
