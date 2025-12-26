export interface WidgetConfig {
  id: string;
  token?: string;
  direction?: 'ltr' | 'rtl' | 'default';
  projectId?: string;
  theme?: {
    primaryColor?: string;
    position?: 'left' | 'right';
    width?: string;
  };
  text?: {
    title?: string;
    placeholder?: string;
  };
  buttonIcon?: 'default' | 'message' | 'question' | 'support' | 'help';
}

export const DEFAULT_CONFIG: Partial<WidgetConfig> = {
  theme: {
    primaryColor: '#1e3a8a',
    position: 'right'
  },
  direction: 'ltr',
  text: {
    title: 'How can we help?',
    placeholder: 'Type your message...'
  },
  buttonIcon: 'default'
};