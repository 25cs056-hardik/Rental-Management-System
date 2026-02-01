import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, EyeOff, Check, Mail, MessageCircle, Github, Linkedin } from 'lucide-react';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    gstin: '',
    password: '',
    confirmPassword: '',
    couponCode: '',
    role: 'customer' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signup(formData);

    if (result.success) {
      navigate(formData.role === 'customer' ? '/shop' : '/dashboard');
    } else {
      setError(result.error || 'Signup failed');
    }
    setIsLoading(false);
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', met: formData.password.length >= 6 },
    {
      label: 'Passwords match',
      met: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Create Account</h1>

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

        <span className={styles.orText}>or use your email for registration</span>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.select}
            required
            disabled={isLoading}
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
            disabled={isLoading}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
            disabled={isLoading}
          />

          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            className={styles.input}
            required
            disabled={isLoading}
          />

          <input
            type="text"
            name="gstin"
            placeholder="GSTIN (e.g. 29ABCDE1234F1Z5)"
            value={formData.gstin}
            onChange={handleChange}
            className={`${styles.input} uppercase`}
            required
            disabled={isLoading}
          />

          <div className={styles.passwordRow}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={isLoading}
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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={styles.input}
            required
            disabled={isLoading}
          />

          {formData.password && (
            <div className={styles.requirement}>
              {passwordRequirements.map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Check
                    className="h-4 w-4"
                    style={{ color: req.met ? '#2da0a8' : '#999', flexShrink: 0 }}
                  />
                  <span style={{ color: req.met ? '#2da0a8' : '#666', fontSize: '0.75rem' }}>{req.label}</span>
                </div>
              ))}
            </div>
          )}

          <input
            type="text"
            name="couponCode"
            placeholder="Coupon Code (Optional)"
            value={formData.couponCode}
            onChange={handleChange}
            className={styles.input}
            disabled={isLoading}
          />

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Sign Up'}
          </button>
        </form>

        <p className={styles.signInLink}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
