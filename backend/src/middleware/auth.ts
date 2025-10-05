import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { User, UserRole } from '../types/index';

interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'password'>;
}

// Define permissions for different user roles
export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  clinician: [
    { resource: 'patients', actions: ['read', 'write', 'delete', 'search'] },
    { resource: 'clinical-notes', actions: ['read', 'write', 'delete', 'search'] },
    { resource: 'lab-results', actions: ['read', 'write', 'search'] },
    { resource: 'medications', actions: ['read', 'write', 'search'] },
    { resource: 'research', actions: ['read', 'search'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'exports', actions: ['read', 'write'] },
    { resource: 'demographics', actions: ['read', 'search'] },
    { resource: 'sensitive-data', actions: ['read'] }
  ],
  patient: [
    { resource: 'patients', actions: ['read'] }, // Own data only
    { resource: 'clinical-notes', actions: ['read'] }, // Own data only
    { resource: 'lab-results', actions: ['read'] }, // Own data only
    { resource: 'medications', actions: ['read'] }, // Own data only
    { resource: 'research', actions: ['read'] }, // Educational content only
    { resource: 'exports', actions: ['read'] }, // Own data only
    { resource: 'demographics', actions: ['read'] } // Own data only
  ]
};

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'Unauthorized',
          message: 'No authorization header provided',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'Unauthorized',
          message: 'No token provided',
        },
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded.user;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'Unauthorized',
        message: 'Invalid token',
      },
    });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'Unauthorized',
          message: 'User not authenticated',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'Forbidden',
          message: `Access denied. Required roles: ${roles.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
};

// Check if user has permission for specific resource and action
export const requirePermission = (resource: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'Unauthorized',
          message: 'User not authenticated',
        },
      });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = userPermissions.some(permission => 
      permission.resource === resource && permission.actions.includes(action)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'Forbidden',
          message: `Access denied. Missing permission: ${action} on ${resource}`,
        },
      });
      return;
    }

    next();
  };
};

// Middleware for clinician-only access
export const requireClinician = requireRole(['clinician']);

// Middleware for patient-only access
export const requirePatient = requireRole(['patient']);

// Middleware to check if user can access specific patient data
export const requirePatientOwnership = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'Unauthorized',
        message: 'User not authenticated',
      },
    });
    return;
  }

  // Clinicians can access any patient data
  if (req.user.role === 'clinician') {
    next();
    return;
  }

  // Patients can only access their own data
  if (req.user.role === 'patient') {
    const patientId = req.params.patientId || req.params.id;
    if (!patientId || patientId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'Forbidden',
          message: 'Patients can only access their own data',
        },
      });
      return;
    }
  }

  next();
};

// Export the AuthenticatedRequest interface for use in other files
export { AuthenticatedRequest };