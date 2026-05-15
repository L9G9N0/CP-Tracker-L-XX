import { SignIn } from '@clerk/clerk-react';
import { Cpu } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center px-4">
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
          <Cpu size={20} className="text-sky-400" />
        </div>
        <span className="text-lg font-bold text-white">CP Tracker</span>
      </div>

      <SignIn 
        routing="path" 
        path="/login" 
        signUpUrl="/signup" 
        forceRedirectUrl="/dashboard" 
      />
    </div>
  );
}