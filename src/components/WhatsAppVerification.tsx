import React, { useState, useEffect } from 'react';
import { auth } from '../lib/api';
import CountrySelector, { Country } from './CountrySelector';
import { useTranslation } from 'react-i18next';

interface WhatsAppVerificationProps {
  type: 'login' | 'register' | 'reset-password';
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  userData?: {
    name?: string;
    password?: string;
    email?: string;
    role?: 'customer' | 'provider';
    businessName?: string;
    category?: string;
  };
}

const WhatsAppVerification: React.FC<WhatsAppVerificationProps> = ({
  type,
  onSuccess,
  onError,
  userData,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Countdown timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!selectedCountry || !phoneNumber.trim()) {
      onError(t('Please select a country and enter your phone number'));
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
      
      switch (type) {
        case 'register':
          await auth.whatsapp.sendRegistrationCode(fullPhoneNumber, selectedCountry.dialCode);
          break;
        case 'login':
          await auth.whatsapp.sendLoginCode(fullPhoneNumber, selectedCountry.dialCode);
          break;
        case 'reset-password':
          await auth.whatsapp.sendPasswordResetCode(fullPhoneNumber, selectedCountry.dialCode);
          break;
      }
      
      setStep('code');
      setCountdown(60); // 60 seconds countdown
    } catch (error: any) {
      onError(error.response?.data?.message || t('Failed to send verification code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      onError(t('Please enter the verification code'));
      return;
    }

    if (type === 'reset-password' && (!newPassword || newPassword !== confirmPassword)) {
      onError(t('Passwords do not match'));
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phoneNumber}`;
      let response;
      
      switch (type) {
        case 'register':
          if (!userData || !userData.name || !userData.password) {
            onError(t('User data with name and password is required for registration'));
            return;
          }
          response = await auth.whatsapp.verifyRegistrationCode(
            fullPhoneNumber,
            verificationCode,
            {
              name: userData.name,
              password: userData.password,
              email: userData.email,
              role: userData.role,
              businessName: userData.businessName,
              category: userData.category
            }
          );
          break;
        case 'login':
          response = await auth.whatsapp.verifyLoginCode(fullPhoneNumber, verificationCode);
          break;
        case 'reset-password':
          response = await auth.whatsapp.verifyPasswordResetCode(
            fullPhoneNumber,
            verificationCode,
            newPassword
          );
          break;
      }
      
      onSuccess(response.data);
    } catch (error: any) {
      onError(error.response?.data?.message || t('Invalid verification code'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'register':
        return t('Register with WhatsApp');
      case 'login':
        return t('Login with WhatsApp');
      case 'reset-password':
        return t('Reset Password via WhatsApp');
      default:
        return t('WhatsApp Verification');
    }
  };

  const getDescription = () => {
    if (step === 'phone') {
      switch (type) {
        case 'register':
          return t('Enter your phone number to receive a verification code via WhatsApp for registration');
        case 'login':
          return t('Enter your phone number to receive a verification code via WhatsApp for login');
        case 'reset-password':
          return t('Enter your phone number to receive a verification code via WhatsApp to reset your password');
      }
    } else {
      return t('Enter the 6-digit verification code sent to your WhatsApp');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
        <p className="text-gray-600">{getDescription()}</p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Country')}
            </label>
            <CountrySelector
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Phone Number')}
            </label>
            <div className="flex">
              <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-500">
                {selectedCountry?.dialCode || '+1'}
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1234567890"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSendCode}
            disabled={isLoading || !selectedCountry || !phoneNumber.trim()}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                {t('Send WhatsApp Code')}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Verification Code')}
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          {type === 'reset-password' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('New Password')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Confirm New Password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  minLength={6}
                />
              </div>
            </>
          )}

          <button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              t('Verify Code')
            )}
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setStep('phone');
                setVerificationCode('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {t('Change phone number')}
            </button>
          </div>

          {countdown > 0 ? (
            <p className="text-center text-sm text-gray-500">
              {t('Resend code in')} {countdown} {t('seconds')}
            </p>
          ) : (
            <div className="text-center">
              <button
                onClick={handleSendCode}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t('Resend code')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppVerification;