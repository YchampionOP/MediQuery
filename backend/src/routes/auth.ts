import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { AuthRequest, AuthResponse, User } from '../types/index';

const router = Router();

// Demo users for testing (in production, these would come from a database)
const demoUsers: User[] = [
  {
    id: 'clinician-1',
    email: 'doctor@mediquery.ai',
    role: 'clinician',
    name: 'Dr. Sarah Johnson',
    department: 'Internal Medicine',
    licenseNumber: 'MD123456',
    preferences: {
      language: 'en',
      theme: 'light',
      notificationsEnabled: true,
      detailLevel: 'comprehensive'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'patient-1',
    email: 'patient@mediquery.ai',
    role: 'patient',
    name: 'John Smith',
    dateOfBirth: '1980-05-15',
    preferences: {
      language: 'en',
      theme: 'light',
      notificationsEnabled: true,
      detailLevel: 'basic'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, role }: AuthRequest = req.body;

    // Validate input
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Email and role are required',
        },
      });
    }

    // Find user (in production, this would query a database)
    const user = demoUsers.find(u => u.email === email && u.role === role);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'Unauthorized',
          message: 'Invalid credentials',
        },
      });
    }

    // Generate JWT token
    const payload = { user: { ...user } };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' });

    const response: AuthResponse = {
      user,
      token,
      expiresIn: config.jwt.expiresIn,
    };

    return res.json({
      success: true,
      data: response,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Login failed',
      },
    });
  }
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'Unauthorized',
          message: 'No authorization header provided',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'Unauthorized',
          message: 'No token provided',
        },
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    return res.json({
      success: true,
      data: {
        user: (decoded as any).user,
        valid: true,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'Unauthorized',
        message: 'Invalid token',
      },
    });
  }
});

// GET /api/auth/demo-users
router.get('/demo-users', (req, res) => {
  const publicUsers = demoUsers.map(user => ({
    email: user.email,
    role: user.role,
    name: user.name,
    department: user.department,
  }));

  res.json({
    success: true,
    data: publicUsers,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
      version: '1.0.0',
    },
  });
});

export default router;