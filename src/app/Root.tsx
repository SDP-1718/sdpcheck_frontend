import { Outlet } from 'react-router'
import { PreviewProvider } from './PreviewContext'

export default function Root() { return <PreviewProvider><Outlet /></PreviewProvider> }
