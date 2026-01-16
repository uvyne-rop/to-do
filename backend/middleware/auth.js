const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // ADD THESE LOGS
    console.log('🔐 Auth header received:', authHeader ? 'Yes' : 'No');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

    const decodedToken = await auth.verifyIdToken(token);
    console.log('✅ Token verified for user:', decodedToken.uid);
    
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired - Please login again'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
};