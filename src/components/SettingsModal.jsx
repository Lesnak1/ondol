import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, onSave, hasEnvKey }) {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testState, setTestState] = useState({ loading: false, success: null, message: '' });

  const handleSave = () => {
    onSave(inputKey);
    onClose();
  };

  const handleTestKey = async () => {
    const keyToTest = inputKey || (hasEnvKey ? 'ENV_KEY' : '');
    if (!keyToTest) {
      setTestState({ loading: false, success: false, message: 'Please enter an API Key first.' });
      return;
    }
    
    setTestState({ loading: true, success: null, message: 'Testing key with AI Agent API...' });
    
    try {
      const finalKey = keyToTest === 'ENV_KEY' ? import.meta.env.VITE_DEEPSEEK_API_KEY : inputKey;
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [{ role: 'user', content: 'hello' }],
          max_tokens: 5
        })
      });
      
      if (response.ok) {
        setTestState({ 
          loading: false, 
          success: true, 
          message: 'Connection successful! Your AI Agent API key is valid.' 
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestState({ 
          loading: false, 
          success: false, 
          message: `Connection failed: ${errorData?.error?.message || response.statusText || 'Invalid credentials'}` 
        });
      }
    } catch (err) {
      setTestState({ 
        loading: false, 
        success: false, 
        message: `Network error: ${err.message || 'Could not reach API server'}` 
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">System Settings</h2>
          <button className="btn-icon modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <p style={{ fontSize: '13px', marginBottom: '20px', lineHeight: '1.4' }}>
          Configuring the AI Agent API key unlocks the automated <strong>Smart Contract Security Auditor</strong>, 
          <strong>Transaction Explainer</strong>, and <strong>Interactive Dev Assistant</strong>. 
          Your key is saved locally in the browser's sandbox and is only sent directly to official API endpoints.
        </p>

        <div className="input-group" style={{ marginBottom: '24px' }}>
          <label className="input-label">AI Agent API Key</label>
          <div className="input-wrapper">
            <Key className="input-icon" size={16} />
            <input 
              type={showKey ? 'text' : 'password'}
              className="input-field input-field-cyan"
              style={{ paddingRight: '44px' }}
              placeholder={hasEnvKey ? "•••••••• (Vercel Environment Key Active)" : "sk-..."}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
            <button 
              type="button" 
              className="btn-icon" 
              style={{ position: 'absolute', right: '10px' }}
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {testState.message && (
          <div 
            className={`badge ${testState.success === true ? 'badge-success' : testState.success === false ? 'badge-error' : 'badge-cyan'}`}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {testState.success === true ? (
              <CheckCircle2 size={16} />
            ) : testState.success === false ? (
              <AlertCircle size={16} />
            ) : (
              <span className="status-indicator"></span>
            )}
            <span>{testState.message}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={handleTestKey}
            disabled={testState.loading}
          >
            Test Connection
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
