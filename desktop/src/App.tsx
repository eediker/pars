import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { appWindow } from '@tauri-apps/api/window';
import './App.css';

interface Message {
  role: 'user' | 'pars';
  content: string;
  modifiedFiles?: string[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'pars', content: 'Greetings. The spirits are listening. What shall we build?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const query = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3333/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error('Ritual connection failed.');

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'pars', 
        content: data.response,
        modifiedFiles: data.modifiedFiles 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'pars', content: `**Error:** ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleClose = async () => {
    // Kill the daemon backend first
    fetch('http://localhost:3333/api/close', { method: 'POST' }).catch(() => {});
    // Kill the Tauri UI Window
    await appWindow.close();
  };

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  return (
    <div className="app-container">
      
      {/* Sleek Antigravity Title Bar */}
      <div className="title-bar data-tauri-drag-region">
        <div className="title-left data-tauri-drag-region">
          <img src="/parslogo.png" alt="Pars" className={`logo ${isLoading ? 'glowing' : ''}`} />
          <h1 className="app-title data-tauri-drag-region">Pars</h1>
        </div>

        <div className="window-controls">
          <button onClick={handleMinimize} className="win-btn minimize" title="Minimize">
            <svg viewBox="0 0 10 10"><path d="M 1,5 L 9,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <button onClick={handleClose} className="win-btn close" title="Close">
            <svg viewBox="0 0 10 10"><path d="M 1,1 L 9,9 M 1,9 L 9,1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-window">
        <div className="messages-wrapper">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              
              {msg.modifiedFiles && msg.modifiedFiles.length > 0 && (
                <div className="modified-files-notice">
                  <p>The spirits have altered:</p>
                  <ul>
                    {msg.modifiedFiles.map((file, i) => <li key={i}>{file}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message pars loading-pulse">
              Channeling the ether...
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* Floating Input Terminal */}
      <div className="input-area-wrapper">
        <div className="input-area">
          <input 
            type="text" 
            className="terminal-input" 
            placeholder="Talk to Pars..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isLoading}
          />
          <button className="send-button" onClick={handleSend} disabled={isLoading}>
            {isLoading ? '...' : 'Invoke'}
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default App;
