import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { getProfile } from '../services/userService';
import '../styles/Chatbot.css';

// Utility function to capitalize the first letter of each word
const capitalizeName = (name) => {
  if (!name) return 'User';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Utility function to parse markdown-like text and render as JSX
const parseMessageText = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let currentList = null;

  lines.forEach((line, index) => {
    // Handle headings (## Heading ##)
    if (line.startsWith('##') && line.endsWith('##')) {
      const headingText = line.slice(2, -2).trim();
      elements.push(<h3 key={index} className="chat-heading">{headingText}</h3>);
      currentList = null; // Reset list context
      return;
    }

    // Handle bullet points (  - Text)
    if (line.startsWith('  -')) {
      const bulletText = line.slice(3).trim();
      // Parse bold text within bullet points (**Text**)
      const parts = bulletText.split(/(\*\*[^\*]+\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (!currentList) {
        currentList = [];
        elements.push(<ul key={`ul-${index}`} className="chat-list">{currentList}</ul>);
      }
      currentList.push(<li key={index} className="chat-bullet">{parts}</li>);
      return;
    }

    // Handle bold text in plain lines (**Text**)
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^\*]+\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(<p key={index} className="chat-paragraph">{parts}</p>);
      currentList = null; // Reset list context
      return;
    }

    // Handle plain text
    if (line.trim()) {
      elements.push(<p key={index} className="chat-paragraph">{line.trim()}</p>);
      currentList = null; // Reset list context
    }
  });

  return elements.length > 0 ? elements : <p>{text}</p>;
};

const allowedRoutes = ['/dashboard', '/profile', '/events', '/announcements', '/membership'];

const Chatbot = ({ userId, token, user }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am SPECS Nexus Bot. How may I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(user);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch user profile if full_name is missing
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.full_name && token) {
        try {
          console.log('Chatbot: Fetching user profile due to missing full_name', { userId });
          const profile = await getProfile(token);
          setUserData(profile);
          console.log('Chatbot: Fetched user profile:', profile);
        } catch (error) {
          console.error('Chatbot: Failed to fetch user profile:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
        }
      } else {
        setUserData(user);
      }
    };

    fetchUserProfile();
    console.log('Chatbot: User prop received:', { userId, user, userData });
  }, [user, userId, token]);

  const checkRoute = useCallback(() => {
    const isAllowed = allowedRoutes.includes(location.pathname);
    console.log('Chatbot check:', {
      userId,
      token,
      route: location.pathname,
      isAllowed
    });
    return isAllowed;
  }, [location.pathname, userId, token]);

  useEffect(() => {
    checkRoute();
  }, [checkRoute]);

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const isMobileView = currentWidth <= 768;

      // Only update state if width changes significantly, not height (keyboard)
      if (Math.abs(currentWidth - lastWidth) > 10) {
        setIsMobile(isMobileView);
        if (isMobileView) {
          setIsMaximized(false); // Reset maximized state on mobile
        }
        lastWidth = currentWidth;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard visibility on mobile
  useEffect(() => {
    const handleFocus = () => {
      // Ensure chatbot stays open when input is focused
      setIsOpen(true);
      // Scroll input into view
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300); // Delay to account for keyboard animation
    };

    const handleBlur = () => {
      // Optional: Keep chatbot open on blur to prevent closing
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Only close on route change if not typing
  useEffect(() => {
    if (!inputRef.current?.matches(':focus')) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post("https://specs-nexus-production.up.railway.app/chat/", {
        message: userMessage.text,
        userId: userId
      }, {
        headers: {
          Authorization: `Bearer ${token.trim()}`
        }
      });
      const botResponse = response.data.response;
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Chatbot: Error from chat endpoint:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Sorry, I'm having trouble processing your request: ${error.response?.data?.detail || error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!checkRoute()) {
    console.log('Chatbot hidden: Route not allowed');
    return null;
  }

  console.log('Chatbot rendering for route:', location.pathname);

  return (
    <>
      <button
        className="chatbot-button"
        onClick={toggleChat}
        aria-label="Toggle chatbot"
        aria-expanded={isOpen}
      >
        <i className="fas fa-robot"></i>
      </button>
      {isOpen && (
        <div className={`chatbot-container ${isMaximized ? 'maximized' : ''}`} role="dialog" aria-label="SPECS Nexus Bot Chatbot">
          <div className="chatbot-header">
            <div className="header-text">
              <span className="specs-text">SPECS</span>
              <span className="assistance-text"> Nexus Bot</span>
            </div>
            <div className="header-buttons">
              <button
                className="maximize-button"
                onClick={toggleMaximize}
                aria-label={isMaximized ? 'Minimize chatbot' : 'Maximize chatbot'}
              >
                <i className={isMaximized ? 'fas fa-compress' : 'fas fa-expand'}></i>
              </button>
              <button
                className="closed-button"
                onClick={toggleChat}
                aria-label="Close chatbot"
              >
                ×
              </button>
            </div>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="sender-name">
                  {msg.sender === 'bot' ? 'SPECS Nexus Bot' : capitalizeName(userData?.full_name)}
                </div>
                <div className={`chat-bubble ${msg.sender}`}>
                  {msg.sender === 'bot' ? parseMessageText(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-wrapper bot">
                <div className="sender-name">SPECS Nexus Bot</div>
                <div className="chat-bubble bot">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              disabled={loading}
              aria-label="Chat message input"
              autoComplete="off"
            />
            <button onClick={sendMessage} disabled={loading} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;