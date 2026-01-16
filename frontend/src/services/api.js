const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    // ADD THESE LOGS
    console.log('🔐 Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('📡 Making request to:', `${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // ADD THIS LOG
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    
    // ADD THIS LOG
    console.log('📦 Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('❌ API request error:', error);
    throw error;
  }
};