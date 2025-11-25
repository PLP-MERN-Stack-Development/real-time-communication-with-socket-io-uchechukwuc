import { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const API_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

function MessageInput({ onSendMessage, onTyping, disabled, placeholder }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const fileData = await response.json();
      return fileData;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !disabled && !isUploading) {
      try {
        let messageData = message.trim();

        if (selectedFile) {
          setIsUploading(true);
          const fileData = await uploadFile(selectedFile);
          messageData = messageData ? `${messageData}\n[File: ${fileData.originalName}]` : `[File: ${fileData.originalName}]`;
          // Include file data in the message
          onSendMessage(messageData, { file: fileData });
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          onSendMessage(messageData);
        }

        setMessage('');
        if (isTyping) {
          onTyping(false);
          setIsTyping(false);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (!isTyping && e.target.value.trim()) {
      onTyping(true);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        onTyping(false);
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        onTyping(false);
      }
    };
  }, [isTyping, onTyping]);

  return (
    <div className="message-input-container">
      {selectedFile && (
        <div className="file-preview">
          <div className="file-info">
            <span className="file-name">📎 {selectedFile.name}</span>
            <span className="file-size">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            <button type="button" onClick={handleFileRemove} className="file-remove">✕</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            maxLength={500}
            className="message-input"
          />

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            id="file-input"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="file-button"
            disabled={disabled || isUploading}
            title="Attach file"
          >
            📎
          </button>

          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || disabled || isUploading}
            className="send-button"
          >
            {isUploading ? '⏳' : '📤'}
          </button>
        </div>
      </form>

      {(message.length > 450 || selectedFile) && (
        <div className="input-footer">
          {message.length > 450 && (
            <div className="character-count">
              {message.length}/500
            </div>
          )}
          {isUploading && (
            <div className="upload-status">
              Uploading file...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageInput;