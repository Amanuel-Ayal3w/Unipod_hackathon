import React from 'react'
import { createRoot } from 'react-dom/client'
import ChatWidget from './components/chat-widget'
import type { WidgetConfig } from './types/config'
import inlineStyles from './styles/globals.css?inline'

class BlueyeWidget {
  private config: WidgetConfig
  private shadowRoot: ShadowRoot | null = null
  private mountEl: HTMLElement | null = null

  constructor(config: WidgetConfig) {
    this.config = config
  }

  init() {
    if (!this.config.id) {
      throw new Error('Widget ID is required')
    }


    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.createContainer()
        this.render()
      })
    } else {
      this.createContainer()
      this.render()
    }
  }

  private createContainer() {
    const containerId = 'blueyeai-widget-container'
    let container = document.getElementById(containerId)

    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      document.body.appendChild(container)
    }

    // If a shadow root already exists on this container, reuse it
    const existingShadow = (container as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot
    if (existingShadow) {
      this.shadowRoot = existingShadow
    }

    // Attach Shadow DOM for style encapsulation
    if (container && !this.shadowRoot && container.attachShadow) {
      this.shadowRoot = container.attachShadow({ mode: 'open' })

      // Inject compiled Tailwind CSS directly into the shadow root
      if (this.shadowRoot) {
        const styleEl = document.createElement('style')
        styleEl.textContent = inlineStyles as unknown as string
        this.shadowRoot.appendChild(styleEl)
      }

      // Load Roboto font inside shadow root to avoid relying on host
      const fontLink = document.createElement('link')
      fontLink.setAttribute('rel', 'stylesheet')
      fontLink.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap')
      this.shadowRoot.appendChild(fontLink)

      // Create mount element for React
      this.mountEl = document.createElement('div')
      this.mountEl.id = 'blueyeai-root'
      this.shadowRoot.appendChild(this.mountEl)
    } else if (!this.mountEl) {
      // Reuse existing shadow root mount if present, otherwise fallback without shadow DOM
      if (this.shadowRoot) {
        const existingMount = this.shadowRoot.getElementById('blueyeai-root')
        if (existingMount) {
          this.mountEl = existingMount as HTMLElement
        } else {
          this.mountEl = document.createElement('div')
          this.mountEl.id = 'blueyeai-root'
          this.shadowRoot.appendChild(this.mountEl)
        }
      } else {
        this.mountEl = container
      }
    }
  }

  private render() {
    if (!this.mountEl) return

    const root = createRoot(this.mountEl)
    root.render(React.createElement(ChatWidget, { config: this.config }))
  }
}



export default {
  init: (config: WidgetConfig) => {
    const widget = new BlueyeWidget(config)
    widget.init()
    return widget
  },
  create: (config: WidgetConfig) => new BlueyeWidget(config)
} 