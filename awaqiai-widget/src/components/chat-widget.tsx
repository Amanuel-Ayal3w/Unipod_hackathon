import React, { useState, useRef, useEffect, createContext, useContext } from 'react'
import { WidgetConfig } from '../types/config'
import ApiService from '../services/api'
import { Send, MessageCircle, X, FileText, FileDown, File as FileIcon, ExternalLink, MessagesSquare, HelpCircle, Headset, LifeBuoy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from './ui/button'
import { isRTLText } from '../lib/utils'

// Create a context for theme settings
interface ThemeContextType {
  primaryColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '#1e3a8a',
});

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: number
}

interface DocumentLink {
  url: string
  fileName: string
  fileType: 'pdf' | 'doc' | 'docx' | 'other'
  messageId: string
}

interface ChatWidgetProps {
  config: WidgetConfig & {
    direction?: 'rtl' | 'ltr' | 'default'
  }
}

const extractDocumentLinks = (content: string, messageId: string): DocumentLink[] => {
  const linkRegex = /\[([^\]]+?)(?:\.?\s*)\]\(([^)]+\.(pdf|docx?|PDF|DOCX?))\)\.?\s*/g;
  const urlRegex = /(https?:\/\/[^\s]+?\.(pdf|docx?|PDF|DOCX?))\.?\s*/g;
  const links: DocumentLink[] = [];
  let match;
  
  // Extract markdown links
  while ((match = linkRegex.exec(content)) !== null) {
    const fileName = match[1].trim();
    const url = match[2];
    const extension = match[3].toLowerCase();
    
    links.push({
      url,
      fileName: fileName.replace(/\.+\s*$/, ''),
      fileType: extension === 'pdf' ? 'pdf' : (extension === 'doc' || extension === 'docx' ? 'doc' : 'other'),
      messageId
    });
  }
  
  // Extract plain URLs
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[1];
    let fileName = url.split('/').pop() || url;
    fileName = fileName.replace(/\.+\s*$/, '');
    const extension = match[2].toLowerCase();
    
    if (!links.some(link => link.url === url)) {
      links.push({
        url,
        fileName,
        fileType: extension === 'pdf' ? 'pdf' : (extension === 'doc' || extension === 'docx' ? 'doc' : 'other'),
        messageId
      });
    }
  }
  
  return links;
};

const CustomLink = (props: React.ComponentPropsWithoutRef<'a'>) => {
  const { href, children, ...rest } = props;
  const { primaryColor } = useContext(ThemeContext);
  
  if (!href) return <a {...rest}>{children}</a>;
  
  const isPdf = href.toLowerCase().endsWith('.pdf');
  const isDoc = href.toLowerCase().endsWith('.doc') || href.toLowerCase().endsWith('.docx');
  
  if (isPdf || isDoc) {
    // Clean up display text
    const displayText = React.Children.map(children, child => {
      if (typeof child === 'string') {
        return child.replace(/\s*\.$/, '');
      }
      return child;
    });

    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="bw:inline-flex bw:items-center bw:no-underline bw:font-medium bw:whitespace-normal bw:break-words"
        style={{ color: primaryColor }}
        {...rest}
      >
        <span className="bw:inline-flex bw:items-center">
          <span>{displayText}</span>
          <span className="bw:inline-flex bw:items-center bw:ml-1">
            {isPdf ? (
              <FileText className="bw:h-3.5 bw:w-3.5 bw:text-red-500 bw:mr-0.5" />
            ) : (
              <FileIcon className="bw:h-3.5 bw:w-3.5 bw:text-blue-500 bw:mr-0.5" />
            )}
            <ExternalLink className="bw:h-3 bw:w-3 bw:opacity-60" />
          </span>
        </span>
      </a>
    );
  }
  
  // Regular link styling
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="bw:inline-flex bw:items-center bw:no-underline bw:font-medium bw:whitespace-normal bw:break-words"
      style={{ color: primaryColor }}
      {...rest}
    >
      <span className="bw:flex bw:items-center bw:flex-wrap">
        <span>{children}</span>
        <ExternalLink className="bw:ml-1 bw:h-3 bw:w-3 bw:opacity-60 bw:inline-block" />
      </span>
    </a>
  );
};

const MessageDocuments = ({ documents }: { documents: DocumentLink[] }) => {
  const { primaryColor } = useContext(ThemeContext);
  
  if (documents.length === 0) return null;

  return (
    <div className="bw:mt-2 bw:flex bw:flex-col bw:gap-2">
      {documents.map((doc, index) => (
        <a
          key={`${doc.url}-${index}`}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bw:group bw:inline-flex bw:items-center bw:gap-2 bw:px-3 bw:py-1.5 bw:bg-white bw:border bw:border-gray-200 hover:bw:border-gray-300 bw:rounded-lg bw:text-sm bw:transition-all hover:bw:shadow-xs bw:w-full"
          style={{ borderColor: `${primaryColor}20` }}
        >
          {doc.fileType === 'pdf' ? (
            <FileText className="bw:h-4 bw:w-4 bw:text-red-500" />
          ) : (
            <FileIcon className="bw:h-4 bw:w-4 bw:text-blue-500" />
          )}
          <span className="bw:truncate bw:max-w-[180px] bw:text-gray-700">{doc.fileName}</span>
          <div className="bw:flex bw:items-center bw:gap-1 bw:text-gray-400 group-hover:bw:text-gray-600 bw:ml-auto">
            <div className="bw:w-[1px] bw:h-4 bw:bg-gray-200 group-hover:bw:bg-gray-300" />
            <FileDown className="bw:h-3.5 bw:w-3.5 bw:transition-colors" />
          </div>
        </a>
      ))}
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message; primaryColor: string }> = ({ message, primaryColor }) => {
  const documents = extractDocumentLinks(message.text, message.id);
  const isRtl = isRTLText(message.text);
  
  return (
    <div
      className={`bw:mb-3 bw:flex ${
        message.sender === 'user' ? 'bw:justify-end' : 'bw:justify-start'
      }`}
    >
      <div
        className={`bw:max-w-[70%] bw:p-3 bw:rounded-lg ${
          message.sender === 'bot' ? 'bw:bg-muted bw:text-foreground' : ''
        }`}
        style={{
          ...(message.sender === 'user' ? { 
            backgroundColor: primaryColor,
            color: isColorDark(primaryColor) ? '#ffffff' : '#000000'
          } : {}),
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left'
        }}
      >
        
        {message.sender === 'bot' ? (
          <ReactMarkdown
            components={{
              a: CustomLink,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              img: ({node, ...props }) => (
                <img
                  className='bw:max-w-full bw:h-auto bw:rounded'
                  {...props}
                  loading='lazy'
                />
              ),
            }}
          >
            {/* remove any source annotations, ie. 【number:number†text】 */}
            {message.text.replace(/【\d+:\d+†[^】]+】\.?/g, '')}
          </ReactMarkdown>
        ) : (
          <span style={{ whiteSpace: 'pre-line' }}>{message.text}</span>
        )}
        {message.sender === 'bot' && documents.length > 0 && (
          <MessageDocuments documents={documents} />
        )}
      </div>
    </div>
  )
}


const TypingIndicator: React.FC = () => (
  <div className='bw:flex bw:mb-3 bw:justify-start'>
    <div className='bw:p-3 bw:bg-muted bw:rounded-lg bw:flex bw:gap-1 bw:items-center'>
      <div className='bw:w-1.5 bw:h-1.5 bw:bg-foreground/50 bw:rounded-full bw:animate-typing-dot' />
      <div className='bw:w-1.5 bw:h-1.5 bw:bg-foreground/50 bw:rounded-full bw:animate-typing-dot bw:[animation-delay:200ms]' />
      <div className='bw:w-1.5 bw:h-1.5 bw:bg-foreground/50 bw:rounded-full bw:animate-typing-dot bw:[animation-delay:400ms]' />
    </div>
  </div>
)


const ChatHeader: React.FC<{ onClose: () => void; title: string; primaryColor: string }> = ({ onClose, title, primaryColor }) => (
  <div className='bw:p-4 bw:bg-primary bw:text-primary-foreground bw:rounded-t-lg bw:flex bw:justify-between bw:items-center'
       style={{ backgroundColor: primaryColor, color: isColorDark(primaryColor) ? '#ffffff' : '#000000' }}>
    <span className='bw:font-medium'>{title}</span>
    <Button
      variant='ghost'
      size='icon'
      onClick={onClose}
      className='bw:text-primary-foreground bw:p-0'
      style={{ color: isColorDark(primaryColor) ? '#ffffff' : '#000000' }}
    >
      <X className='bw:h-5 bw:w-5' />
    </Button>
  </div>
)


interface ChatInputProps {
  inputMessage: string
  setInputMessage: (message: string) => void
  handleSendMessage: () => void
  isLoading: boolean
  placeholder: string
  primaryColor: string
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading,
  placeholder,
  primaryColor,
}) => {
  const isRtl = isRTLText(inputMessage);
  
  return (
    <div className='bw:p-4 bw:border-t bw:bg-background'>
      <div className='bw:flex bw:gap-2'>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          placeholder={placeholder}
          className='bw:flex-1 bw:px-3 bw:py-2 bw:rounded bw:border bw:border-input bw:bg-background focus:bw:outline-hidden focus:bw:ring-1 focus:bw:ring-ring bw:resize-y bw:min-h-[2.5rem] bw:max-h-32 bw:overflow-y-auto'
          disabled={isLoading}
          rows={1}
          style={{
            direction: isRtl ? 'rtl' : 'ltr',
            textAlign: isRtl ? 'right' : 'left'
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading}
          size='icon'
          className='bw:w-10'
          style={{ backgroundColor: primaryColor, color: isColorDark(primaryColor) ? '#ffffff' : '#000000' }}
        >
          {isLoading ? '...' : <Send className='bw:h-4 bw:w-4' />}
        </Button>
      </div>
    </div>
  )
}


interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  partialResponse?: string
  primaryColor: string
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  messagesEndRef,
  partialResponse,
  primaryColor,
}) => {

  return (
    <div className='bw:flex-1 bw:overflow-y-auto bw:p-4 bw:bg-background'>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} primaryColor={primaryColor} />
      ))}
      {partialResponse && (
        <MessageBubble
          message={{
            id: 'partial',
            text: partialResponse,
            sender: 'bot',
            timestamp: Date.now(),
          }}
          primaryColor={primaryColor}
        />
      )}
      {isLoading && !partialResponse && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  )
}

// Map button icon types to components
const iconComponents = {
  default: MessageCircle,
  message: MessagesSquare,
  question: HelpCircle,
  support: Headset,
  help: LifeBuoy,
}

// Function to determine if a color is dark or light
const isColorDark = (hexColor: string): boolean => {
  // Remove the # if present
  const color = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate luminance (perceived brightness)
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // If luminance is greater than 0.5, color is light; otherwise, it's dark
  return luminance < 0.5;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [partialResponse, setPartialResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const apiService = useRef<ApiService>(new ApiService(config))

  // Get theme values with fallbacks
  const primaryColor = config.theme?.primaryColor || '#1e3a8a'
  const position = config.theme?.position || 'right'
  const width = config.theme?.width || '380px'
  const title = config.text?.title || 'How can we help?'
  const placeholder = config.text?.placeholder || 'Type your message...'
  const buttonIcon = config.buttonIcon || 'default'
  
  // Get the icon component based on the buttonIcon setting
  const ButtonIcon = iconComponents[buttonIcon]

  // Theme context value
  const themeContextValue = {
    primaryColor
  }
  
  const getDirection = () => {
    if (!config.direction || config.direction === 'default') {
      return document.documentElement.dir || 'ltr'
    }
    return config.direction
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  useEffect(() => {
    scrollToBottom()
  }, [messages, partialResponse])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setPartialResponse('')

    try {
      const botMessageId = (Date.now() + 1).toString()
      let accumulatedResponse = ''

      await apiService.current.streamMessage(inputMessage.trim(), (chunk) => {
        accumulatedResponse += chunk
        setPartialResponse(accumulatedResponse)
      }, {
        delay: 100 // delay 100ms
      })

      const botMessage: Message = {
        id: botMessageId,
        text: accumulatedResponse,
        sender: 'bot',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, botMessage])
      setPartialResponse('')
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const containerDirection = getDirection() as 'rtl' | 'ltr'

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div
        className='blueyeai-widget-container bw:fixed bw:bottom-5 bw:z-[99999] bw:isolate'
        style={{ 
          [position]: '20px', 
          direction: containerDirection,
          isolation: 'isolate' // Fallback for older browsers
        }}
      >
        {isOpen ? (
          <div className='bw:h-[550px] bw:bg-background bw:rounded-lg bw:shadow-lg bw:flex bw:flex-col'
               style={{ 
                 width: width,
                 direction: containerDirection,
                 backgroundColor: '#ffffff'
               }}>
            <ChatHeader 
              onClose={toggleChat} 
              title={title} 
              primaryColor={primaryColor} 
            />
            <MessageList
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
              partialResponse={partialResponse}
              primaryColor={primaryColor}
            />
            <ChatInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder={placeholder}
              primaryColor={primaryColor}
            />
            <div className='bw:p-2 bw:border-t bw:text-center bw:text-xs bw:text-muted-foreground'>
              <a
                href='https://blueyeai.co.il'
                target='_blank'
                rel='noopener noreferrer'
                className='bw:text-primary hover:bw:underline'
                style={{ color: primaryColor }}
              >
                Powered by blueyeai.co.il
              </a>
            </div>
          </div>
        ) : (
          <Button
            onClick={toggleChat}
            className='bw:h-[60px] bw:w-[60px] bw:p-0 bw:rounded-full bw:aspect-square'
            style={{ 
              borderRadius: '100%',
              backgroundColor: primaryColor,
              color: isColorDark(primaryColor) ? '#ffffff' : '#000000'
            }}
          >
            <ButtonIcon className='bw:h-6 bw:w-6' />
          </Button>
        )}
      </div>
    </ThemeContext.Provider>
  )
}

export default ChatWidget
