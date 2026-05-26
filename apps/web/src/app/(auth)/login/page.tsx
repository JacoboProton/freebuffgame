'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { GoogleAuthButton } from '@/components/google-auth-button';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Duobi-Jac</h1>
          <p className="text-muted-foreground">¡Tu cabrito te espera!</p>
        </div>

        {/* Clerk SignIn Component */}
        <SignIn />

        {/* Google Auth Button */}
        <GoogleAuthButton mode="signin" />
      </motion.div>
    </div>
  );
}
