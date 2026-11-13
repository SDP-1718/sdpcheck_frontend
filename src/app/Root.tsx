import { Outlet } from 'react-router'
import { AuthProvider } from '../auth/AuthContext'
import { PreviewProvider } from './PreviewContext'
import PushNotifications from '../notifications/PushNotifications'

export default function Root() { return <AuthProvider><PreviewProvider><PushNotifications /><Outlet /></PreviewProvider></AuthProvider> }
