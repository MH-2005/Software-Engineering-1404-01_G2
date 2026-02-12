import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
    initialMode?: 'login' | 'signup';
}

const AuthDialog: React.FC<AuthDialogProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialMode = 'signup'
}) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

    if (!isOpen) return null;

    const handleSuccess = (user: any) => {
        onSuccess(user);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <i className="fa-solid fa-times text-xl"></i>
                </button>

                <div className="logo flex items-center justify-center mb-6">
                    <i className="fa-solid fa-leaf text-persian-gold text-4xl ml-3"></i>
                    <div className="logo-text">
                        <h1 className="text-2xl font-black text-text-dark">ایران‌نما</h1>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-center text-text-dark mb-6">
                    {mode === 'login' ? 'ورود به حساب کاربری' : 'ایجاد حساب جدید'}
                </h2>

                {mode === 'login' ? (
                    <LoginForm
                        onSuccess={handleSuccess}
                        onSwitchToSignup={() => setMode('signup')}
                        showSwitchLink={true}
                    />
                ) : (
                    <SignupForm
                        onSuccess={handleSuccess}
                        onSwitchToLogin={() => setMode('login')}
                        showSwitchLink={true}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthDialog;
