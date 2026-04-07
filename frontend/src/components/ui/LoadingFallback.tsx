import React from 'react';

const LoadingFallback: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--color-border, #e5e7eb)',
                borderTopColor: 'var(--color-primary, #6366f1)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default LoadingFallback;
