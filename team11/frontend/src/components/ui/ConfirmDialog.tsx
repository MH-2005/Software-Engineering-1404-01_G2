import React, { useEffect, useRef } from 'react';
import Button from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تایید',
    cancelText = 'انصراف',
    variant = 'warning',
    isLoading = false,
}) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Lock body scroll and compensate for scrollbar to avoid layout shift
        if (!isOpen) return;

        const body = document.body;
        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const onKey = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape' && !isLoading) {
                onClose();
            }
        };
        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'fa-exclamation-triangle',
            iconColor: 'text-red-500',
            iconBg: 'bg-red-100',
        },
        warning: {
            icon: 'fa-exclamation-circle',
            iconColor: 'text-yellow-500',
            iconBg: 'bg-yellow-100',
        },
        info: {
            icon: 'fa-info-circle',
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-100',
        },
    };

    const currentVariant = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-30 transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all max-h-[80vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-start p-6 pb-4">
                    <div className={`flex-shrink-0 ${currentVariant.iconBg} rounded-full p-3 ml-4`}>
                        <i className={`fas ${currentVariant.icon} ${currentVariant.iconColor} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                        <h3 id="confirm-dialog-title" className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-sm text-gray-600">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-6 pt-2 border-t border-gray-200">
                    <Button
                        variant="cancel"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="px-6 py-2 text-sm"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
