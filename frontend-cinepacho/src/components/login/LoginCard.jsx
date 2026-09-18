import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginCard({
  onSubmit,
  error,
  clearError
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || 'es';

  const [form, setForm] = useState({
    email: '',
    contrasena: ''
  });

  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validateEmail = (input) => {
    if (input.validity.valueMissing) {
      input.setCustomValidity(t('validation.login.email.required'));
      return false;
    }

    if (input.validity.typeMismatch) {
      input.setCustomValidity(t('validation.login.email.invalid'));
      return false;
    }

    input.setCustomValidity('');
    return true;
  };

  const validatePassword = (input) => {
    if (input.validity.valueMissing) {
      input.setCustomValidity(t('validation.login.password.required'));
      return false;
    }

    if ((input.value || '').length < 6) {
      input.setCustomValidity(t('validation.login.password.min'));
      return false;
    }

    input.setCustomValidity('');
    return true;
  };

  const handleEmailInvalid = (event) => {
    const input = event.currentTarget;

    if (input.validity.valueMissing) {
      input.setCustomValidity(t('validation.login.email.required'));
      return;
    }

    if (input.validity.typeMismatch) {
      input.setCustomValidity(t('validation.login.email.invalid'));
      return;
    }

    input.setCustomValidity('');
  };

  const handlePasswordInvalid = (event) => {
    const input = event.currentTarget;

    if (input.validity.valueMissing) {
      input.setCustomValidity(t('validation.login.password.required'));
      return;
    }

    if (input.validity.tooShort) {
      input.setCustomValidity(t('validation.login.password.min'));
      return;
    }

    input.setCustomValidity('');
  };

  const validateForm = () => {
    const emailInput = emailRef.current;
    const passwordInput = passwordRef.current;

    const emailValid = emailInput ? validateEmail(emailInput) : true;
    const passwordValid = passwordInput ? validatePassword(passwordInput) : true;

    return emailValid && passwordValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();

    if (!validateForm()) {
      emailRef.current?.reportValidity();
      passwordRef.current?.reportValidity();
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        email: form.email,
        contrasena: form.contrasena
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      bg-surface-container/95
      backdrop-blur-xl
      border border-outline-variant/10
      rounded-3xl
      overflow-hidden
      shadow-2xl
    ">
      <div className="
        px-8 py-7
        border-b border-outline-variant/10
      ">
        <p className="
          text-[10px]
          uppercase tracking-[0.3em]
          text-primary font-black
          mb-3
        ">
          {t('login.badge')}
        </p>

        <h2 className="
          text-3xl font-black
          text-white uppercase
        ">
          {t('login.title')}
        </h2>

        <p className="
          text-sm text-on-surface-variant
          mt-3
        ">
          {t('login.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        lang={language}
        className="p-8 space-y-5"
      >
        <div>
          <label className="
            block mb-2
            text-[10px]
            uppercase tracking-[0.2em]
            text-on-surface-variant
            font-black
          ">
            {t('login.email')}
          </label>

          <input
            type="email"
            required
            ref={emailRef}
            value={form.email}
            lang={language}
            onInvalid={handleEmailInvalid}
            onInput={(e) => {
              clearError?.();
              e.currentTarget.setCustomValidity('');
              validateEmail(e.currentTarget);
            }}
            onChange={(e) => {
              clearError?.();
              setForm({
                ...form,
                email: e.target.value
              });
            }}
            placeholder={t('login.emailPlaceholder')}
            className="
              w-full
              bg-surface-container-high
              border border-outline-variant/10
              rounded-2xl
              px-4 py-4
              text-sm text-white
              outline-none
              focus:border-primary
              transition-all
            "
          />
        </div>

        <div>
          <label className="
            block mb-2
            text-[10px]
            uppercase tracking-[0.2em]
            text-on-surface-variant
            font-black
          ">
            {t('login.password')}
          </label>

          <input
            type="password"
            required
            ref={passwordRef}
            value={form.contrasena}
            lang={language}
            onInvalid={handlePasswordInvalid}
            onInput={(e) => {
              clearError?.();
              e.currentTarget.setCustomValidity('');
              validatePassword(e.currentTarget);
            }}
            onChange={(e) => {
              clearError?.();
              setForm({
                ...form,
                contrasena: e.target.value
              });
            }}
            placeholder="••••••••••"
            className="
              w-full
              bg-surface-container-high
              border border-outline-variant/10
              rounded-2xl
              px-4 py-4
              text-sm text-white
              outline-none
              focus:border-primary
              transition-all
            "
          />
        </div>

        {error && (
          <div className="
            px-4 py-3 rounded-2xl
            bg-red-500/10
            border border-red-500/20
            text-sm text-red-400
          ">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-4
            rounded-2xl
            bg-primary
            hover:bg-red-700
            disabled:opacity-50
            text-white
            text-sm font-black
            uppercase tracking-[0.2em]
            transition-all
            shadow-lg shadow-primary/20
          "
        >
          {loading ? t('login.loading') : t('login.submit')}
        </button>
      </form>
    </div>
  );
}
