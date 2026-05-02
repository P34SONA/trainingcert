import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  FileText, 
  Upload, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Search,
  Bell,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  FileSearch,
  Plus
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { analyzeCertificate } from './services/geminiService';
import type { 
  Profile, 
  Training, 
  UserTraining, 
  Certificate, 
  UserRole,
  TrainingStatus 
} from './types';

// --- UI Components ---

interface BaseProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const Card = ({ children, className = "", ...props }: BaseProps) => (
  <div className={`glass-card overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "", 
  disabled = false,
  loading = false,
  ...props
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  className?: string,
  disabled?: boolean,
  loading?: boolean,
  [key: string]: any
}) => {
  const base = "px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm uppercase tracking-wide";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 border border-blue-400/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10 shadow-inner",
    outline: "border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white backdrop-blur-sm",
    ghost: "hover:bg-white/5 text-slate-400 hover:text-white transition-colors",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

const Badge = ({ children, variant = 'info', className = "", ...props }: BaseProps & { variant?: 'success' | 'warning' | 'info' | 'error' }) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    error: "bg-red-500/10 text-red-400 border-red-500/30"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// --- Main Application ---

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [configError, setConfigError] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'learning' | 'certificates' | 'users'>('dashboard');

  React.useEffect(() => {
    try {
      // Check initial auth state
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      }).catch(err => {
        if (err.message === 'SUPABASE_CONFIG_MISSING') setConfigError(true);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err: any) {
      if (err.message === 'SUPABASE_CONFIG_MISSING') setConfigError(true);
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (configError) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-12 border-white/10 bg-white/[0.02] backdrop-blur-3xl space-y-8">
          <div className="flex items-center gap-4 text-blue-400">
            <ShieldCheck className="w-12 h-12" />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">System Configuration Required</h1>
          </div>
          
          <div className="space-y-6 text-slate-400 leading-relaxed">
            <p className="text-lg italic">
              The <span className="text-white font-bold">LUMINA_CORE</span> environment is currently uninitialized. Connect your Supabase project to activate the learning architecture.
            </p>
            
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Protocol Instructions:</h3>
              <ol className="list-decimal list-inside space-y-3 text-sm font-mono">
                <li>Open the <span className="text-blue-400">Settings &gt; Secrets</span> menu in AI Studio.</li>
                <li>Add <code className="text-white bg-white/10 px-2 py-0.5 rounded">VITE_SUPABASE_URL</code> from your Supabase project.</li>
                <li>Add <code className="text-white bg-white/10 px-2 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> from your project settings.</li>
                <li>Add <code className="text-white bg-white/10 px-2 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> for backend authentication.</li>
                <li>Reload the application to initialize the stream.</li>
              </ol>
            </div>
          </div>

          <Button 
            onClick={() => window.location.reload()} 
            className="w-full py-5 text-sm tracking-widest bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30"
          >
            RE-INITIALIZE SYSTEM
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
          <div className="w-12 h-12 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin relative z-10" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[100px]"></div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        role={profile?.role || 'user'} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        profile={profile}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10">
        <div className="max-w-7xl mx-auto">
          <Header profile={profile} activeTab={activeTab} />
          
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {profile?.role === 'admin' ? (
                <AdminRouter tab={activeTab} />
              ) : (
                <UserRouter tab={activeTab} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Views & Routers ---

function AdminRouter({ tab }: { tab: string }) {
  switch (tab) {
    case 'dashboard': return <AdminDashboard />;
    case 'learning': return <AdminLearningManagement />;
    case 'certificates': return <AdminCertificateReview />;
    case 'users': return <AdminUserManagement />;
    default: return <AdminDashboard />;
  }
}

function UserRouter({ tab }: { tab: string }) {
  switch (tab) {
    case 'dashboard': return <UserDashboard />;
    case 'learning': return <UserLearningView />;
    case 'certificates': return <UserCertificateVault />;
    default: return <UserDashboard />;
  }
}

// --- AUTH COMPONENTS ---

function LoginView() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 overflow-hidden relative">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
      </div>

      <div className="min-h-screen grid lg:grid-cols-2 relative z-10">
        <div className="hidden lg:flex p-12 flex-col justify-between relative overflow-hidden backdrop-blur-3xl bg-white/[0.02] border-r border-white/10">
          <div className="relative">
            <div className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BarChart3 className="text-white" />
              </div>
              EduTrack
            </div>
          </div>

          <div className="relative">
            <h1 className="text-6xl font-black italic mb-8 leading-tight text-white tracking-tighter">
              INTELLIGENT <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">SYNTHESIS.</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-md font-light leading-relaxed">
              Automated document scanning and real-time training analytics. Faster insights, less friction.
            </p>
          </div>

          <div className="relative flex items-center gap-8 opacity-40">
            <div className="flex -space-x-4">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border border-white/20" />
              ))}
            </div>
            <p className="text-xs uppercase tracking-widest font-bold">Enterprise Ready</p>
          </div>
        </div>

        <div className="flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl p-10 rounded-3xl border border-white/10 shadow-2xl space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight">Access Control</h2>
              <p className="mt-2 text-slate-400">Identify yourself via Google to continue</p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm border border-red-500/20 font-medium">
                  {error}
                </div>
              )}
              
              <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl text-center space-y-6">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-sm text-slate-400 italic">
                  "EduTrack mandates Google workspace authentication for all system access."
                </p>
              </div>

              <Button 
                onClick={handleGoogleLogin} 
                className="w-full py-4 text-sm flex items-center justify-center gap-3" 
                loading={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- SHARED COMPONENTS ---

function Sidebar({ role, activeTab, onTabChange, onLogout, profile }: any) {
  const menuItems = role === 'admin' ? [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'learning', icon: BookOpen, label: 'Training Modules' },
    { id: 'certificates', icon: ShieldCheck, label: 'Cert Audits' },
    { id: 'users', icon: Users, label: 'User Directory' },
  ] : [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'learning', icon: BookOpen, label: 'Learning Center' },
    { id: 'certificates', icon: FileText, label: 'Security Vault' },
  ];

  return (
    <aside className="w-full md:w-64 flex flex-col z-20 bg-white/[0.02] backdrop-blur-3xl border-r border-white/10 shadow-2xl h-screen sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white italic">EduTrack</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id 
                ? 'bg-white/10 text-white border border-white/10 shadow-inner' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/20 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-60"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate uppercase tracking-tighter">{profile?.full_name}</p>
            <p className="text-[10px] text-slate-500 truncate italic">{profile?.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-400/60 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}

function Header({ profile, activeTab }: any) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          {activeTab.replace('-', ' ')}
        </h1>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">System Node: {profile?.id.split('-')[0]}</p>
      </div>
      <div className="flex gap-4">
        <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#030712] animate-pulse" />
        </button>
      </div>
    </header>
  );
}

// --- ADMIN VIEWS ---

function AdminDashboard() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Learners', value: '124', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completion Rate', value: '78%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Modules Live', value: '12', icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Pending Audits', value: '8', icon: FileSearch, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 group hover:bg-white/[0.05] transition-all">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 h-full">
        <Card className="lg:col-span-4 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Progress</h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">LIVE SYNC</span>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center gap-4 py-8">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="60" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                <circle cx="72" cy="72" r="60" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="376" strokeDashoffset="113" className="text-blue-500" />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white">70%</span>
                <p className="text-[10px] text-slate-500 font-bold">TOTAL</p>
              </div>
            </div>
            <div className="w-full space-y-4 pt-6">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Ongoing</span>
                  <span className="text-white">124 Units</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-blue-500"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Completed</span>
                  <span className="text-white">382 Units</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[70%] bg-cyan-400"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold text-white tracking-widest uppercase italic">Gemini Engine</span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Recent Machine Analysis</h3>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                    <FileText className={`w-6 h-6 ${i === 1 ? 'text-blue-400' : 'text-purple-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold text-white truncate">CERT_UNIT_0X{i}24.PDF</p>
                      <span className="text-[10px] text-slate-500 font-mono">SCANNED // 12:0{i} PM</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      <span className="text-blue-400 font-bold mr-1">Extraction:</span> Document valid. Course "Advanced Cloud Security" identified. Issued June 2024. Authority: AWS. Name match: Verified.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1 p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Operations</h3>
                <Button variant="outline" className="text-[10px] h-8 px-3">View Full Log</Button>
             </div>
             <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs text-slate-300 font-medium">User profile sync complete</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">0.4ms ago</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function AdminUserManagement() {
  const [showInvite, setShowInvite] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('user');
  const [password, setPassword] = React.useState('TempPass123!');
  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState<Profile[]>([]);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, role, password })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      
      setShowInvite(false);
      setEmail('');
      setFullName('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold italic text-white tracking-widest uppercase">Node Directory</h2>
        <Button onClick={() => setShowInvite(true)} className="gap-2 px-6">
          <Plus className="w-4 h-4" />
          Onboard User
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">User Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Authorization</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Joined Node</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((profile) => (
                <tr key={profile.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-black text-xs uppercase tracking-tighter">
                        {profile.full_name?.substring(0,2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{profile.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono lowercase">{profile.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                       <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">R</span>
                       <span className="bg-white/10 text-slate-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">W</span>
                       {profile.role === 'admin' && <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">Root</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" className="p-2 opacity-0 group-hover:opacity-100"><ChevronRight className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#030712] rounded-3xl p-10 max-w-md w-full border border-white/10 shadow-2xl space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Initialize User</h3>
              <button className="text-slate-500 hover:text-white" onClick={() => setShowInvite(false)}><X/></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                <input required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Identity Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Access Tier</label>
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 ring-blue-500 appearance-none">
                  <option value="user">LEARNER_NODE</option>
                  <option value="admin">ROOT_ADMIN</option>
                </select>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest text-center">Auto-assigning Entropy Hash Password</p>
              </div>
              <Button className="w-full py-4" loading={loading}>Deploy User Node</Button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function AdminLearningManagement() {
  const [modules, setModules] = React.useState<Training[]>([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    const { data } = await supabase.from('trainings').select('*').order('created_at', { ascending: false });
    if (data) setModules(data);
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('trainings').insert([{ title, description }]);
    if (!error) {
      setShowAdd(false);
      setTitle('');
      setDescription('');
      fetchModules();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold italic text-white tracking-widest uppercase">Instructional Assets</h2>
        <Button onClick={() => setShowAdd(true)} className="gap-2 px-6">
          <Plus className="w-4 h-4" />
          Deploy Module
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <Card key={m.id} className="group relative border-white/5 hover:border-white/10">
            <div className="aspect-video bg-white/[0.02] flex items-center justify-center border-b border-white/5">
              <BookOpen className="w-12 h-12 text-slate-700 group-hover:text-blue-500/50 group-hover:scale-110 transition-all duration-500" />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-white mb-2 tracking-tight">{m.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 h-8 mb-6 italic leading-relaxed">{m.description}</p>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[10px] font-mono text-slate-600">ID: {m.id.split('-')[0]}</span>
                <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-blue-400">Modify</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#030712] rounded-3xl p-10 max-w-md w-full border border-white/10 shadow-2xl space-y-8"
          >
             <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Initialize Module</h3>
              <button className="text-slate-500 hover:text-white" onClick={() => setShowAdd(false)}><X/></button>
            </div>
            <form onSubmit={handleAddModule} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Technical Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 ring-blue-500" placeholder="e.g. CYBER_DEFENSE_01" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mission Parameters</label>
                <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 ring-blue-500" placeholder="Define learning objectives..." />
              </div>
              <Button className="w-full py-4">Commit to Repository</Button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function AdminCertificateReview() {
  const [certs, setCerts] = React.useState<Certificate[]>([]);

  React.useEffect(() => {
    supabase.from('certificates').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setCerts(data);
    });
  }, []);

  return (
    <Card className="border-white/5">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <h3 className="font-bold text-white uppercase tracking-[0.2em] italic text-sm">Security Audit Registry</h3>
        <Badge variant="info">{certs.length} TOTAL NODES</Badge>
      </div>
      <div className="divide-y divide-white/5">
        {certs.map(c => (
          <div key={c.id} className="p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-white/[0.02] transition-colors group">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:border-blue-500/30 transition-colors">
              <FileText className="text-blue-500/40 w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h4 className="font-bold text-white text-lg tracking-tight uppercase italic">{c.extracted_data.course_name || 'UNDEFINED_RESOURCE'}</h4>
                <Badge variant={c.extracted_data.validity_score && c.extracted_data.validity_score > 80 ? 'success' : 'warning'}>
                  AUTH_CONFIDENCE: {c.extracted_data.validity_score}%
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mb-4 italic leading-relaxed max-w-2xl">"{c.summary || 'Awaiting AI synthesis report...'}"</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  <Users className="w-3 h-3 text-slate-700" />
                  Owner: {c.user_id.split('-')[0]}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                  <Clock className="w-3 h-3 text-slate-700" />
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest italic">
                  <ShieldCheck className="w-3 h-3" />
                  {c.extracted_data.issuer}
                </div>
              </div>
            </div>
            <Button variant="outline" className="px-6 h-10 text-[10px] group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">Inspect Document</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- USER VIEWS ---

function UserDashboard() {
  const [stats, setStats] = React.useState({ completed: 0, ongoing: 0, certs: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [tr, ct] = await Promise.all([
        supabase.from('user_trainings').select('status').eq('user_id', user.id),
        supabase.from('certificates').select('id').eq('user_id', user.id)
      ]);

      const completed = tr.data?.filter(t => t.status === 'completed').length || 0;
      const ongoing = tr.data?.filter(t => t.status === 'ongoing').length || 0;
      const certCount = ct.data?.length || 0;

      setStats({ completed, ongoing, certs: certCount });
    };
    fetchStats();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Completed Modules', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Ongoing Missions', value: stats.ongoing, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Secured Documents', value: stats.certs, icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-8 hover:bg-white/[0.04] transition-all group">
             <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-8">
              <p className="text-4xl font-black text-white tracking-widest italic">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         <Card className="p-8">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest italic">Learning Pulse</h3>
              <span className="text-[10px] text-blue-400 font-mono">STATUS: SYNCED</span>
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                   <div className="w-full bg-white/[0.02] rounded-t-xl relative h-full flex items-end overflow-hidden border-x border-t border-white/5">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="w-full bg-gradient-to-t from-blue-600/40 to-blue-400/20 group-hover:from-blue-500/60 group-hover:to-blue-300/40 transition-all rounded-t-sm"
                      />
                   </div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Cycle {i+1}</span>
                </div>
              ))}
            </div>
         </Card>

         <Card className="p-0 border-none bg-gradient-to-br from-blue-600/40 to-purple-600/40 relative overflow-hidden flex flex-col justify-center min-h-[320px] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-white/[0.02]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 animate-pulse" />
            <div className="p-12 relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-[1px] bg-blue-400"></div>
                <span className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase">Machine Advisory</span>
              </div>
              <h3 className="text-3xl font-light italic leading-tight mb-8 text-white tracking-tight">
                "Keep your <span className="font-bold underline decoration-blue-500 underline-offset-8">Certification Vault</span> fresh. Upload your latest achievements for automatic AI verification."
              </h3>
              <Button variant="primary" className="w-fit px-10 py-5 rounded-2xl shadow-2xl shadow-blue-600/40">
                 Execute Upload
              </Button>
            </div>
         </Card>
      </div>
    </motion.div>
  );
}

function UserLearningView() {
  const [modules, setModules] = React.useState<Training[]>([]);
  const [userTrainings, setUserTrainings] = React.useState<UserTraining[]>([]);
  const [filter, setFilter] = React.useState<'all' | TrainingStatus>('all');

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [m, ut] = await Promise.all([
      supabase.from('trainings').select('*'),
      supabase.from('user_trainings').select('*').eq('user_id', user.id)
    ]);
    
    if (m.data) setModules(m.data);
    if (ut.data) setUserTrainings(ut.data);
  };

  const enroll = async (tid: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_trainings').insert([{
      user_id: user.id,
      training_id: tid,
      status: 'ongoing',
      progress: 0
    }]);
    fetchData();
  };

  const resumeModule = async (ut: UserTraining) => {
    const newProgress = Math.min(ut.progress + 20, 100);
    const newStatus = newProgress === 100 ? 'completed' : 'ongoing';

    await supabase
      .from('user_trainings')
      .update({ 
        progress: newProgress, 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', ut.id);
    
    fetchData();
  };

  const filtered = userTrainings.filter(ut => filter === 'all' || ut.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit backdrop-blur-xl">
        {(['all', 'ongoing', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              filter === f ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(m => {
          const ut = userTrainings.find(t => t.training_id === m.id);
          return (
            <Card key={m.id} className="group hover:border-white/10 transition-colors">
              <div className="aspect-video bg-white/[0.02] flex items-center justify-center overflow-hidden border-b border-white/5">
                <BookOpen className="w-16 h-16 text-slate-800 group-hover:scale-110 group-hover:text-blue-500/40 transition-all duration-700" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg text-white italic tracking-tight">{m.title}</h3>
                   {ut && <Badge variant={ut.status === 'completed' ? 'success' : 'warning'}>{ut.status}</Badge>}
                </div>
                <p className="text-xs text-slate-500 mb-8 line-clamp-2 h-8 italic leading-relaxed">{m.description}</p>
                {ut ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Sync Progress</span>
                      <span className="text-blue-400">{ut.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width: `${ut.progress}%`}} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                    </div>
                    <Button 
                      onClick={() => resumeModule(ut)}
                      variant="secondary" 
                      className="w-full py-4 text-xs"
                      disabled={ut.status === 'completed'}
                    >
                      {ut.status === 'completed' ? 'Module Secured' : 'Resume Stream'}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => enroll(m.id)} className="w-full py-4 text-xs">Initialize Module</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function UserCertificateVault() {
  const [certs, setCerts] = React.useState<Certificate[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);

  React.useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('certificates').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setCerts(data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setAnalyzing(true);

    try {
      // 1. Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // 2. Analyze with Gemini
        const analysis = await analyzeCertificate(base64, file.type);
        
        // 3. Save to database
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('certificates').insert([{
          user_id: user?.id,
          file_name: file.name,
          file_url: 'shared_storage_path', // In a real app, upload to storage first
          extracted_data: { 
            ...analysis, 
            original_base64: base64, 
            mime_type: file.type 
          },
          summary: analysis.summary,
          status: analysis.validity_score > 70 ? 'valid' : 'invalid'
        }]);

        fetchCerts();
        setAnalyzing(false);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("AI analysis failed. Please try again.");
      setAnalyzing(false);
      setUploading(false);
    }
  };

  const handleRescan = async (cert: Certificate) => {
    const base64 = cert.extracted_data.original_base64;
    const mimeType = cert.extracted_data.mime_type || 'application/pdf';

    if (!base64) {
      alert("Original source data not found for this certificate. Rescan is only available for newly uploaded documents in this environment.");
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analyzeCertificate(base64, mimeType);
      
      await supabase.from('certificates').update({
        extracted_data: { 
          ...analysis, 
          original_base64: base64, 
          mime_type: mimeType 
        },
        summary: analysis.summary,
        status: analysis.validity_score > 70 ? 'valid' : 'invalid'
      }).eq('id', cert.id);

      fetchCerts();
    } catch (err) {
      console.error(err);
      alert("Rescan failed. Connection to Gemini engine interrupted.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12">
      <Card className="p-16 border-dashed border-2 border-white/10 bg-white/[0.02] text-center relative overflow-hidden group backdrop-blur-3xl">
         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
         <div className="max-w-md mx-auto space-y-6 relative z-10">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-500">
               <Upload className="w-10 h-10 text-white/40 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Initialize Upload</h3>
            <p className="text-slate-500 text-sm italic leading-relaxed">
               Deploy your PDF or image assets. Our Gemini synthesis engine will programmatically verify and extract metadata.
            </p>
            <div className="relative pt-6">
              <input 
                type="file" 
                accept="image/*,application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                onChange={handleFileChange}
                disabled={uploading}
              />
              <Button loading={uploading} className="px-12 py-5 text-sm tracking-widest relative z-10 shadow-2xl shadow-blue-600/30">
                SELECT SOURCE FILE
              </Button>
            </div>
         </div>
      </Card>

      {analyzing && (
        <Card className="p-8 bg-blue-600/20 border-blue-500/30 text-white animate-pulse backdrop-blur-3xl">
           <div className="flex items-center gap-6">
              <div className="w-10 h-10 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
              <div>
                <p className="font-black text-sm uppercase tracking-widest italic">Engine Analysis in Progress</p>
                <p className="text-xs text-blue-400 mt-1 font-mono">GEMINI_SCAN_MODULE // VERIFYING_AUTH</p>
              </div>
           </div>
        </Card>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 mb-8">
           <div className="w-4 h-[1px] bg-slate-700"></div>
           <h3 className="font-black text-xs text-slate-500 uppercase tracking-[0.4em] italic">Encryption VaultRegistry</h3>
        </div>
        {certs.map(c => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={c.id}>
            <Card className="p-8 group hover:bg-white/[0.04] transition-all border-white/5 hover:border-white/10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:border-blue-500/30 transition-colors">
                  <FileText className="w-10 h-10 text-slate-700 group-hover:text-blue-500/50 transition-colors" />
                  <span className="text-[10px] font-black mt-2 text-slate-800 uppercase tracking-tighter">DATA</span>
                </div>
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                    <h4 className="font-bold text-xl text-white italic tracking-tight">{c.extracted_data.course_name}</h4>
                    <Badge variant={c.status === 'valid' ? 'success' : 'error'}>
                      {c.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 italic leading-relaxed max-w-2xl">"{c.summary}"</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                     <span className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] italic">
                       <ShieldCheck className="w-4 h-4 text-blue-500/60"/> {c.extracted_data.issuer}
                     </span>
                     <span className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                       <Clock className="w-4 h-4 text-slate-800"/> {new Date(c.created_at).toLocaleDateString()}
                     </span>
                     <span className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                       AI_CONF: {c.extracted_data.validity_score}%
                     </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => handleRescan(c)}
                    variant="secondary" 
                    className="px-8 h-12 text-[10px] uppercase font-black tracking-widest opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap"
                  >
                     Rescan 0xAuto
                  </Button>
                  <Button variant="outline" className="px-8 h-12 text-[10px] uppercase font-black tracking-widest opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">
                     View Resource
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
