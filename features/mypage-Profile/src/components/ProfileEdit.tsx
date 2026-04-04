'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@xgen/i18n';
import { ContentArea, Button, useToast, cn } from '@xgen/ui';
import { fetchUserProfile, updateUserProfile, updateUserPassword, type UserProfileDetail } from '@xgen/api-client';

// ─────────────────────────────────────────────────────────────
// Icons (inline SVG — Feather style)
// ─────────────────────────────────────────────────────────────

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LoaderIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Password Validation
// ─────────────────────────────────────────────────────────────

function validatePassword(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  const categoriesMet = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  const hasTwoCategoriesCombination = categoriesMet >= 2;

  return {
    isValid: hasMinLength && hasTwoCategoriesCombination,
    hasMinLength,
    hasTwoCategoriesCombination,
  };
}

// ─────────────────────────────────────────────────────────────
// ProfileEdit Component
// ─────────────────────────────────────────────────────────────

export const ProfileEdit: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [user, setUser] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile edit state
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const passwordValidation = validatePassword(newPassword);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profile = await fetchUserProfile();
        setUser(profile);
        setFullName(profile.full_name || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : t('mypage.profile.loadError'));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [t]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error(t('mypage.profileEdit.toast.nameRequired'));
      return;
    }

    try {
      setSaving(true);
      const updated = await updateUserProfile({ full_name: fullName.trim() });
      setUser(updated);
      toast.success(t('mypage.profileEdit.toast.profileSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('mypage.profileEdit.toast.profileError'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error(t('mypage.profileEdit.toast.currentPasswordRequired'));
      return;
    }
    if (!newPassword) {
      toast.error(t('mypage.profileEdit.toast.newPasswordRequired'));
      return;
    }
    if (!passwordValidation.isValid) {
      toast.error(t('mypage.profileEdit.toast.passwordCondition'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('mypage.profileEdit.toast.passwordMismatch'));
      return;
    }

    try {
      setPasswordSaving(true);
      await updateUserPassword(currentPassword, newPassword);
      toast.success(t('mypage.profileEdit.toast.passwordSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('mypage.profileEdit.toast.passwordError'));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <ContentArea title={t('mypage.profileEdit.title')} description={t('mypage.profileEdit.description')}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <LoaderIcon className="animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('mypage.profile.loading')}</span>
          </div>
        </div>
      </ContentArea>
    );
  }

  if (error) {
    return (
      <ContentArea title={t('mypage.profileEdit.title')} description={t('mypage.profileEdit.description')}>
        <div className="flex items-center justify-center h-64">
          <span className="text-sm text-destructive">{error}</span>
        </div>
      </ContentArea>
    );
  }

  return (
    <ContentArea title={t('mypage.profileEdit.title')} description={t('mypage.profileEdit.description')}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Profile Edit Section ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserIcon className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{t('mypage.profileEdit.sectionTitle')}</h3>
          </div>

          <div className="space-y-4">
            {/* Username (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('mypage.profileEdit.fields.username')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-muted-foreground cursor-not-allowed"
                value={user?.username || ''}
                disabled
              />
              <span className="text-xs text-muted-foreground">{t('mypage.profileEdit.fields.usernameHelper')}</span>
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('mypage.profileEdit.fields.email')}</label>
              <input
                type="email"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-muted-foreground cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
              <span className="text-xs text-muted-foreground">{t('mypage.profileEdit.fields.emailHelper')}</span>
            </div>

            {/* Full Name (editable) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('mypage.profileEdit.fields.fullName')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#0891B2]/30 focus:border-[#0891B2] transition-colors"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('mypage.profileEdit.fields.fullNamePlaceholder')}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} disabled={saving} size="sm">
                {saving ? <LoaderIcon className="animate-spin mr-1.5" /> : <SaveIcon className="mr-1.5" />}
                {saving ? t('mypage.profileEdit.buttons.saving') : t('mypage.profileEdit.buttons.save')}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Password Change Section ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <LockIcon className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{t('mypage.profileEdit.password.sectionTitle')}</h3>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('mypage.profileEdit.password.current')}</label>
              <PasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrentPassword}
                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                placeholder={t('mypage.profileEdit.password.currentPlaceholder')}
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('mypage.profileEdit.password.new')}</label>
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                show={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                placeholder={t('mypage.profileEdit.password.newPlaceholder')}
              />
              {/* Validation indicators */}
              {newPassword && (
                <div className="flex flex-col gap-1 mt-1">
                  <ValidationItem
                    valid={passwordValidation.hasMinLength}
                    label={t('mypage.profileEdit.validation.minLength')}
                  />
                  <ValidationItem
                    valid={passwordValidation.hasTwoCategoriesCombination}
                    label={t('mypage.profileEdit.validation.combination')}
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t('mypage.profileEdit.password.confirm')}</label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder={t('mypage.profileEdit.password.confirmPlaceholder')}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <span className="text-xs text-destructive">{t('mypage.profileEdit.password.mismatch')}</span>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <span className="text-xs text-emerald-600">{t('mypage.profileEdit.password.match')}</span>
              )}
            </div>

            {/* Change Password Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleChangePassword}
                disabled={passwordSaving || !passwordValidation.isValid || newPassword !== confirmPassword}
                size="sm"
              >
                {passwordSaving ? <LoaderIcon className="animate-spin mr-1.5" /> : <LockIcon className="mr-1.5" />}
                {passwordSaving ? t('mypage.profileEdit.password.changing') : t('mypage.profileEdit.password.changeButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ContentArea>
  );
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}> = ({ value, onChange, show, onToggle, placeholder }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-gray-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#0891B2]/30 focus:border-[#0891B2] transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
    />
    <button
      type="button"
      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
      onClick={onToggle}
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </div>
);

const ValidationItem: React.FC<{ valid: boolean; label: string }> = ({ valid, label }) => (
  <div className={cn('flex items-center gap-1.5 text-xs', valid ? 'text-emerald-600' : 'text-muted-foreground')}>
    {valid ? <CheckIcon /> : <XIcon />}
    <span>{label}</span>
  </div>
);
