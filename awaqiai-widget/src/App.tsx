import React from 'react'
import ChatWidget from './components/chat-widget'
import { WidgetConfig } from './types/config'

interface AppProps {
  config: WidgetConfig
}

const App: React.FC<AppProps> = ({ config }) => {
  return (
    <>
      <ChatWidget config={config} />
    </>
  )
}

export default App
