import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { ServiceProvider } from '../models/ServiceProvider';
import { notificationService } from '../services/notification.service';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, password, role, businessName, category } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      phone,
      email,
      password,
      role: role || 'customer'
    });

    await user.save();

    // If registering as provider, create provider profile with minimal required data
    if (role === 'provider' && businessName && category) {
      const provider = new ServiceProvider({
        userId: user._id,
        businessName,
        category,
        description: `${businessName} - ${category}`, // Default description
        location: {
          type: 'Point',
          coordinates: [36.2021, 37.1343], // Default coordinates (Aleppo, Syria)
          address: 'سوريا' // Default address
        },
        services: [], // Empty services array - to be filled later
        workingHours: [ // Default working hours
          { day: 'sunday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'monday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'tuesday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'wednesday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'thursday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'friday', open: '09:00', close: '17:00', isClosed: true },
          { day: 'saturday', open: '09:00', close: '17:00', isClosed: false }
        ]
      });

      await provider.save();
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

// Send WhatsApp verification code for registration
export const sendRegistrationCode = async (req: Request, res: Response) => {
  try {
    const { phone, countryCode, language = 'ar' } = req.body;
    
    // Format phone number with country code
    const fullPhoneNumber = `${countryCode}${phone.replace(/^0+/, '')}`;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone: fullPhoneNumber });
    if (existingUser && existingUser.isPhoneVerified) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }
    
    // Generate verification code
    const code = notificationService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create or update user with verification code
    if (existingUser) {
      existingUser.verificationCode = code;
      existingUser.verificationCodeExpires = expiresAt;
      existingUser.verificationCodeType = 'register';
      existingUser.countryCode = countryCode;
      await existingUser.save();
    } else {
      const tempUser = new User({
        name: 'Temp User',
        phone: fullPhoneNumber,
        password: 'temp_password',
        verificationCode: code,
        verificationCodeExpires: expiresAt,
        verificationCodeType: 'register',
        countryCode,
        language,
        isPhoneVerified: false
      });
      await tempUser.save();
    }
    
    // Send WhatsApp verification code
    await notificationService.sendVerificationCode(fullPhoneNumber, code, 'register', language);
    
    return res.json({ 
      message: 'Verification code sent to WhatsApp',
      phone: fullPhoneNumber
    });
  } catch (error) {
    console.error('Send registration code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify registration code and complete registration
export const verifyRegistrationCode = async (req: Request, res: Response) => {
  try {
    const { phone, code, name, email, password, role, businessName, category } = req.body;
    
    // Find user with verification code
    const user = await User.findOne({
      phone,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
      verificationCodeType: 'register'
    }).select('+verificationCode +verificationCodeExpires +verificationCodeType');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Update user with actual registration data
    user.name = name;
    user.email = email;
    user.password = password;
    user.role = role || 'customer';
    user.isPhoneVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.verificationCodeType = undefined;
    await user.save();
    
    // If registering as provider, create provider profile
    if (role === 'provider' && businessName && category) {
      const provider = new ServiceProvider({
        user: user._id,
        businessName,
        category,
        description: '',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: ''
        },
        services: [],
        workingHours: []
      });
      await provider.save();
    }
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    return res.json({
      message: 'Registration completed successfully',
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (error) {
    console.error('Verify registration code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Send WhatsApp verification code for login
export const sendLoginCode = async (req: Request, res: Response) => {
  try {
    const { phone, countryCode } = req.body;
    
    // Format phone number with country code
    const fullPhoneNumber = `${countryCode}${phone.replace(/^0+/, '')}`;
    
    // Find user
    const user = await User.findOne({ phone: fullPhoneNumber });
    if (!user || !user.isPhoneVerified) {
      return res.status(404).json({ message: 'User not found or phone not verified' });
    }
    
    // Generate verification code
    const code = notificationService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Update user with verification code
    user.verificationCode = code;
    user.verificationCodeExpires = expiresAt;
    user.verificationCodeType = 'login';
    await user.save();
    
    // Send WhatsApp verification code
    await notificationService.sendVerificationCode(fullPhoneNumber, code, 'login', user.language);
    
    return res.json({ 
      message: 'Login verification code sent to WhatsApp',
      phone: fullPhoneNumber
    });
  } catch (error) {
    console.error('Send login code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify login code and authenticate user
export const verifyLoginCode = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    
    // Find user with verification code
    const user = await User.findOne({
      phone,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
      verificationCodeType: 'login'
    }).select('+verificationCode +verificationCodeExpires +verificationCodeType');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Clear verification code
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.verificationCodeType = undefined;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    return res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (error) {
    console.error('Verify login code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Send WhatsApp verification code for password reset
export const sendPasswordResetCode = async (req: Request, res: Response) => {
  try {
    const { phone, countryCode } = req.body;
    
    // Format phone number with country code
    const fullPhoneNumber = `${countryCode}${phone.replace(/^0+/, '')}`;
    
    // Find user
    const user = await User.findOne({ phone: fullPhoneNumber });
    if (!user || !user.isPhoneVerified) {
      return res.status(404).json({ message: 'User not found or phone not verified' });
    }
    
    // Generate verification code
    const code = notificationService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Update user with verification code
    user.verificationCode = code;
    user.verificationCodeExpires = expiresAt;
    user.verificationCodeType = 'password_reset';
    await user.save();
    
    // Send WhatsApp verification code
    await notificationService.sendVerificationCode(fullPhoneNumber, code, 'password_reset', user.language);
    
    return res.json({ 
      message: 'Password reset code sent to WhatsApp',
      phone: fullPhoneNumber
    });
  } catch (error) {
    console.error('Send password reset code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify password reset code and reset password
export const verifyPasswordResetCode = async (req: Request, res: Response) => {
  try {
    const { phone, code, newPassword } = req.body;
    
    // Find user with verification code
    const user = await User.findOne({
      phone,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
      verificationCodeType: 'password_reset'
    }).select('+verificationCode +verificationCodeExpires +verificationCodeType');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Update password and clear verification code
    user.password = newPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.verificationCodeType = undefined;
    await user.save();
    
    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Verify password reset code error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone }).select('+resetCode +resetCodeExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the code in the user document
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send the code via SMS
    // FIX: Call the method on the notificationService instance
    await notificationService.sendSMS(phone, `Your verification code is: ${code}`);

    res.json({ message: 'Reset code sent successfully' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    const user = await User.findOne({
      phone,
      resetCode: code,
      resetCodeExpires: { $gt: Date.now() }
    }).select('+resetCode +resetCodeExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { phone, code, newPassword } = req.body;
    const user = await User.findOne({
      phone,
      resetCode: code,
      resetCodeExpires: { $gt: Date.now() }
    }).select('+resetCode +resetCodeExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};