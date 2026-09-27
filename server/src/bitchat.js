import dotenv from 'dotenv';

dotenv.config();

export const bitchatConfig = {
  enabled: String(process.env.BITCHAT_ENABLED || 'false').toLowerCase() === 'true',
  baseUrl: process.env.BITCHAT_BASE_URL || '',
  apiKey: process.env.BITCHAT_API_KEY || ''
};

export async function getBitChatStatus() {
  if (!bitchatConfig.enabled || !bitchatConfig.baseUrl || !bitchatConfig.apiKey) {
    return {
      connected: false,
      notes: 'BitChat is not configured. Add BITCHAT_BASE_URL and BITCHAT_API_KEY to enable it.'
    };
  }

  try {
    const response = await fetch(`${bitchatConfig.baseUrl}/status`, {
      headers: {
        Authorization: `Bearer ${bitchatConfig.apiKey}`
      }
    });

    if (!response.ok) {
      return {
        connected: false,
        notes: 'BitChat is configured but unavailable right now.'
      };
    }

    const payload = await response.json();
    return {
      connected: true,
      notes: payload.message || 'BitChat is active and connected.'
    };
  } catch (error) {
    return {
      connected: false,
      notes: 'BitChat connection failed. Check your API endpoint and credentials.'
    };
  }
}

export async function toggleBitChat(enabled) {
  if (!bitchatConfig.enabled) {
    return {
      connected: false,
      notes: 'BitChat is disabled in the environment. Set BITCHAT_ENABLED=true to enable it.'
    };
  }

  if (!bitchatConfig.baseUrl || !bitchatConfig.apiKey) {
    return {
      connected: false,
      notes: 'BitChat API settings are missing. Add BITCHAT_BASE_URL and BITCHAT_API_KEY.'
    };
  }

  try {
    const response = await fetch(`${bitchatConfig.baseUrl}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bitchatConfig.apiKey}`
      },
      body: JSON.stringify({ enabled })
    });

    if (!response.ok) {
      return {
        connected: false,
        notes: 'BitChat toggle request failed.'
      };
    }

    const payload = await response.json();
    return {
      connected: Boolean(enabled && payload.connected),
      notes: payload.message || (enabled ? 'BitChat enabled.' : 'BitChat disabled.')
    };
  } catch (error) {
    return {
      connected: false,
      notes: 'BitChat toggle failed. Check the BitChat API configuration.'
    };
  }
}
