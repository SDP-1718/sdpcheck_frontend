import { Outlet } from 'react-router'
import { AuthProvider } from '../auth/AuthContext'
import { PreviewProvider } from './PreviewContext'

export default function Root() { return <AuthProvider><PreviewProvider><Outlet /></PreviewProvider></AuthProvider> }
