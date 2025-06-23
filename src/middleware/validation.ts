import { body, query } from 'express-validator';

// Auth validation rules
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('mobileNo')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be 10 digits'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('mobileNo')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be 10 digits'),
];

// Entry validation rules
export const validateCreateEntry = [
  body('srNo')
    .trim()
    .notEmpty()
    .withMessage('Serial number is required')
    .isLength({ max: 20 })
    .withMessage('Serial number cannot be more than 20 characters'),
  body('vehicleNo')
    .trim()
    .notEmpty()
    .withMessage('Vehicle number is required')
    .isLength({ max: 20 })
    .withMessage('Vehicle number cannot be more than 20 characters'),
  body('nameDetails')
    .trim()
    .notEmpty()
    .withMessage('Name details is required')
    .isLength({ max: 100 })
    .withMessage('Name details cannot be more than 100 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('netWeight')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Net weight cannot be more than 20 characters'),
  body('moisture')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Moisture cannot be more than 20 characters'),
  body('gatePassNo')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Gate pass number cannot be more than 30 characters'),
  body('mobileNo')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  body('unload')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Unload cannot be more than 50 characters'),
  body('shortage')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Shortage cannot be more than 50 characters'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Remarks cannot be more than 200 characters'),
];

export const validateUpdateEntry = [
  body('srNo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Serial number must be between 1 and 20 characters'),
  body('vehicleNo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Vehicle number must be between 1 and 20 characters'),
  body('nameDetails')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name details must be between 1 and 100 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('netWeight')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Net weight cannot be more than 20 characters'),
  body('moisture')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Moisture cannot be more than 20 characters'),
  body('gatePassNo')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Gate pass number cannot be more than 30 characters'),
  body('mobileNo')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  body('unload')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Unload cannot be more than 50 characters'),
  body('shortage')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Shortage cannot be more than 50 characters'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Remarks cannot be more than 200 characters'),
];

// Query validation rules
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot be more than 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['srNo', 'vehicleNo', 'nameDetails', 'date', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
]; 