import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, EyeOff, Check, Mail, MessageCircle, Github, Linkedin } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [isSignUpView, setIsSignUpView] = useState(location.pathname === '/signup');

  useEffect(() => {
    setIsSignUpView(location.pathname === '/signup');
  }, [location.pathname]);

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    couponCode: '',
    role: 'customer' as UserRole,
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const role = result.user?.role;
      navigate(role === 'customer' ? '/shop' : '/dashboard');
    } else {
      setLoginError(result.error || 'Login failed');
    }
    setLoginLoading(false);
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);
    const result = await signup(signupData);
    if (result.success) {
      navigate('/shop');
    } else {
      setSignupError(result.error || 'Signup failed');
    }
    setSignupLoading(false);
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', met: signupData.password.length >= 6 },
    {
      label: 'Passwords match',
      met: signupData.password === signupData.confirmPassword && signupData.confirmPassword.length > 0,
    },
  ];

  const socialIcons = (
    <div className={styles.socialIcons}>
      <a href="#" className="icon" aria-label="Google">
        <Mail className="h-5 w-5" />
      </a>
      <a href="#" className="icon" aria-label="Facebook">
        <MessageCircle className="h-5 w-5" />
      </a>
      <a href="#" className="icon" aria-label="GitHub">
        <Github className="h-5 w-5" />
      </a>
      <a href="#" className="icon" aria-label="LinkedIn">
        <Linkedin className="h-5 w-5" />
      </a>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${isSignUpView ? styles.active : ''}`}>
        {/* Sign Up form - slides in from left when active */}
        <div className={`${styles.formContainer} ${styles.signUp}`}>
          <h1 className={styles.title}>Create Account</h1>
          {socialIcons}
          <span className={styles.orText}>or use your email for registration</span>
          <form onSubmit={handleSignupSubmit} className={styles.form}>
            {signupError && <div className={styles.error}>{signupError}</div>}
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={signupData.name}
              onChange={handleSignupChange}
              className={styles.input}
              required
              disabled={signupLoading}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={signupData.email}
              onChange={handleSignupChange}
              className={styles.input}
              required
              disabled={signupLoading}
            />
            <div className={styles.passwordRow}>
              <input
                type={showSignupPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={signupData.password}
                onChange={handleSignupChange}
                className={styles.input}
                required
                disabled={signupLoading}
              />
              <button
                type="button"
                className={styles.toggleVisibility}
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
              >
                {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              className={styles.input}
              required
              disabled={signupLoading}
            />
            {signupData.password && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {passwordRequirements.map((req, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check className="h-4 w-4" style={{ color: req.met ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                    <span style={{ color: req.met ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              name="couponCode"
              placeholder="Coupon Code (Optional)"
              value={signupData.couponCode}
              onChange={handleSignupChange}
              className={styles.input}
              disabled={signupLoading}
            />
            <button type="submit" className={styles.submitBtn} disabled={signupLoading}>
              {signupLoading ? <LoadingSpinner size="sm" /> : 'Create account'}
            </button>
          </form>
        </div>

        {/* Sign In form - visible by default */}
        <div className={`${styles.formContainer} ${styles.signIn}`}>
          <h1 className={styles.title}>Sign In</h1>
          {socialIcons}
          <span className={styles.orText}>or use your email and password</span>
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            {loginError && <div className={styles.error}>{loginError}</div>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              required
              disabled={loginLoading}
            />
            <div className={styles.passwordRow}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={styles.input}
                required
                disabled={loginLoading}
              />
              <button
                type="button"
                className={styles.toggleVisibility}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Link to="/forgot-password" className={styles.link}>
              Forgot Your Password?
            </Link>
            <button type="submit" className={styles.submitBtn} disabled={loginLoading}>
              {loginLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Toggle overlay - same animation as Projects-main */}
        <div className={styles.toggleContainer}>
          <div className={styles.toggle}>
            <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button type="button" className={styles.overlayBtn} onClick={() => setIsSignUpView(false)}>
                Sign In
              </button>
            </div>
            <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button type="button" className={styles.overlayBtn} onClick={() => setIsSignUpView(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
