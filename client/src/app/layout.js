import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
    title: 'Wash2Door — Admin',
    description: 'Wash2Door Admin Dashboard'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <SocketProvider>
                        {children}
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#0a0a0a',
                                    color: '#ffffff',
                                    border: '1px solid #262626',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontFamily: 'Inter, sans-serif',
                                    padding: '12px 16px'
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#ffffff',
                                        secondary: '#0a0a0a'
                                    }
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ffffff',
                                        secondary: '#0a0a0a'
                                    }
                                }
                            }}
                        />
                    </SocketProvider>
                </AuthProvider>
            </body>
        </html>
    );
}