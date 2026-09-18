import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function RegisterCard({
  onSubmit,
  error
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || 'es';

  const [form, setForm] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    confirmContrasena: ''
  });

  const [loading, setLoading] = useState(false);
  const inputRefs = useRef({});

  const getValueLength = (field, input) => {
    const rawValue = input.value || '';

    if (field === 'nombre' || field === 'apellido' || field === 'direccion') {
      return rawValue.trim().length;
    }

    return rawValue.length;
  };

  const getLengthMessage = (field, input, minLength) => {
    const currentLength = getValueLength(field, input);
    const missingCount = Math.max(minLength - currentLength, 1);

    switch (field) {
      case 'nombre':
        return t('validation.register.name.length', { count: missingCount });
      case 'apellido':
        return t('validation.register.lastName.length', { count: missingCount });
      case 'cedula':
        return t('validation.register.cedula.length', { count: missingCount });
      case 'telefono':
        return t('validation.register.phone.length', { count: missingCount });
      case 'direccion':
        return t('validation.register.address.length', { count: missingCount });
      default:
        return '';
    }
  };

  const syncLengthValidity = (field, value) => {
    const input = inputRefs.current[field];
    if (!input) {
      return;
    }

    const minLength = input.minLength || 0;
    const currentLength = ['nombre', 'apellido', 'direccion'].includes(field)
      ? value.trim().length
      : value.length;

    if (!value || currentLength >= minLength) {
      input.setCustomValidity('');
      return;
    }

    input.setCustomValidity(getLengthMessage(field, input, minLength));
  };

  const validateField = (field, input) => {
    switch (field) {
      case 'nombre':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.name.required'));
          return false;
        }

        if (input.validity.tooShort || input.validity.tooLong) {
          input.setCustomValidity(getLengthMessage('nombre', input, input.minLength || 2));
          return false;
        }

        break;

      case 'apellido':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.lastName.required'));
          return false;
        }

        if (input.validity.tooShort || input.validity.tooLong) {
          input.setCustomValidity(getLengthMessage('apellido', input, input.minLength || 2));
          return false;
        }

        break;

      case 'cedula':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.cedula.required'));
          return false;
        }

        if (input.validity.patternMismatch) {
          input.setCustomValidity(t('validation.register.cedula.digits'));
          return false;
        }

        if (input.validity.tooShort || input.validity.tooLong) {
          input.setCustomValidity(getLengthMessage('cedula', input, input.minLength || 8));
          return false;
        }

        break;

      case 'telefono':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.phone.required'));
          return false;
        }

        if (input.validity.patternMismatch) {
          input.setCustomValidity(t('validation.register.phone.digits'));
          return false;
        }

        if (input.validity.tooShort || input.validity.tooLong) {
          input.setCustomValidity(getLengthMessage('telefono', input, input.minLength || 10));
          return false;
        }

        break;

      case 'direccion':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.address.required'));
          return false;
        }

        if (input.validity.tooShort || input.validity.tooLong) {
          input.setCustomValidity(getLengthMessage('direccion', input, input.minLength || 10));
          return false;
        }

        break;

      case 'email':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.email.required'));
          return false;
        }

        if (input.validity.typeMismatch) {
          input.setCustomValidity(t('validation.register.email.invalid'));
          return false;
        }

        break;

      case 'contrasena':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.password.required'));
          return false;
        }

        if ((input.value || '').length < 6) {
          input.setCustomValidity(t('validation.register.password.min'));
          return false;
        }

        break;

      case 'confirmContrasena':
        if (input.validity.valueMissing) {
          input.setCustomValidity(t('validation.register.confirmPassword.required'));
          return false;
        }

        if ((input.value || '').length < 6) {
          input.setCustomValidity(t('validation.register.confirmPassword.min'));
          return false;
        }

        if (form.contrasena !== form.confirmContrasena) {
          input.setCustomValidity(t('validation.register.confirmPassword.mismatch'));
          return false;
        }

        break;

      default:
        break;
    }

    input.setCustomValidity('');
    return true;
  };

  const validateForm = () => {
    const fields = [
      'nombre',
      'apellido',
      'cedula',
      'telefono',
      'direccion',
      'email',
      'contrasena',
      'confirmContrasena'
    ];

    let isValid = true;

    fields.forEach((field) => {
      const input = inputRefs.current[field];
      if (!input) {
        return;
      }

      const fieldValid = validateField(field, input);
      isValid = isValid && fieldValid;
    });

    return isValid;
  };

  const clearFieldValidity = (field) => {
    const input = inputRefs.current[field];
    if (input) {
      input.setCustomValidity('');
    }
  };

  const handleInvalidField = (field, input) => {
    if (input.validity.valueMissing) {
      switch (field) {
        case 'nombre':
          input.setCustomValidity(t('validation.register.name.required'));
          return;
        case 'apellido':
          input.setCustomValidity(t('validation.register.lastName.required'));
          return;
        case 'cedula':
          input.setCustomValidity(t('validation.register.cedula.required'));
          return;
        case 'telefono':
          input.setCustomValidity(t('validation.register.phone.required'));
          return;
        case 'direccion':
          input.setCustomValidity(t('validation.register.address.required'));
          return;
        case 'email':
          input.setCustomValidity(t('validation.register.email.required'));
          return;
        case 'contrasena':
          input.setCustomValidity(t('validation.register.password.required'));
          return;
        case 'confirmContrasena':
          input.setCustomValidity(t('validation.register.confirmPassword.required'));
          return;
        default:
          break;
      }
    }

    validateField(field, input);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    clearFieldValidity(field);

    if (['nombre', 'apellido', 'cedula', 'telefono', 'direccion'].includes(field)) {
      syncLengthValidity(field, value);
    }

    if (field === 'contrasena' || field === 'confirmContrasena') {
      clearFieldValidity('confirmContrasena');
    }
  };

  const handlePositiveNumberChange = (field, value) => {
    const digitsOnly = value.replace(/\D/g, '');
    const sanitizedValue = digitsOnly === '0' ? '' : digitsOnly.replace(/^0+(?=\d)/, '');

    setForm((prev) => ({
      ...prev,
      [field]: sanitizedValue
    }));

    clearFieldValidity(field);
    syncLengthValidity(field, sanitizedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstInvalid = [
        'nombre',
        'apellido',
        'cedula',
        'telefono',
        'direccion',
        'email',
        'contrasena',
        'confirmContrasena'
      ].map((field) => inputRefs.current[field]).find((input) => input && !input.checkValidity());

      firstInvalid?.reportValidity();
      return;
    }

    // setLocalError('');

    setLoading(true);

    try {
      await onSubmit({
        cedula: form.cedula,
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        contrasena: form.contrasena,
        rol: 'CLIENTE'
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
          {t('register.badge')}
        </p>

        <h2 className="
          text-3xl font-black
          text-white uppercase
        ">
          {t('register.title')}
        </h2>

        <p className="
          text-sm text-on-surface-variant
          mt-3
        ">
          {t('register.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        lang={language}
        className="p-8 space-y-5"
      >
        <AuthInput
          label={t('register.name')}
          type="text"
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder={t('register.namePlaceholder')}
          minLength={2}
          maxLength={50}
          onInvalid={(e) => handleInvalidField('nombre', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.nombre = node;
          }}
        />

        <AuthInput
          label={t('register.lastName')}
          type="text"
          value={form.apellido}
          onChange={(e) => handleChange('apellido', e.target.value)}
          placeholder={t('register.lastNamePlaceholder')}
          minLength={2}
          maxLength={50}
          onInvalid={(e) => handleInvalidField('apellido', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.apellido = node;
          }}
        />

        <AuthInput
          label={t('register.cedula')}
          type="text"
          value={form.cedula}
          onChange={(e) => handlePositiveNumberChange('cedula', e.target.value)}
          placeholder="123456789"
          inputMode="numeric"
          pattern="[0-9]*"
          minLength={8}
          maxLength={20}
          onInvalid={(e) => handleInvalidField('cedula', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.cedula = node;
          }}
        />

        <AuthInput
          label={t('register.phone')}
          type="text"
          value={form.telefono}
          onChange={(e) => handlePositiveNumberChange('telefono', e.target.value)}
          placeholder="3001234567"
          inputMode="numeric"
          pattern="[0-9]*"
          minLength={10}
          maxLength={10}
          onInvalid={(e) => handleInvalidField('telefono', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.telefono = node;
          }}
        />

        <AuthInput
          label={t('register.address')}
          type="text"
          value={form.direccion}
          onChange={(e) => handleChange('direccion', e.target.value)}
          placeholder={t('register.addressPlaceholder')}
          required
          minLength={10}
          maxLength={100}
          onInvalid={(e) => handleInvalidField('direccion', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.direccion = node;
          }}
        />

        <AuthInput
          label={t('register.email')}
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder={t('register.emailPlaceholder')}
          onInvalid={(e) => handleInvalidField('email', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.email = node;
          }}
        />

        <AuthInput
          label={t('register.password')}
          type="password"
          value={form.contrasena}
          onChange={(e) => handleChange('contrasena', e.target.value)}
          placeholder="••••••••••"
          onInvalid={(e) => handleInvalidField('contrasena', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.contrasena = node;
          }}
        />

        <AuthInput
          label={t('register.confirmPassword')}
          type="password"
          value={form.confirmContrasena}
          onChange={(e) => handleChange('confirmContrasena', e.target.value)}
          placeholder="••••••••••"
          onInvalid={(e) => handleInvalidField('confirmContrasena', e.currentTarget)}
          inputRef={(node) => {
            inputRefs.current.confirmContrasena = node;
          }}
        />

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
          disabled={loading || form.contrasena !== form.confirmContrasena}
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
          {loading ? t('register.loading') : t('register.submit')}
        </button>
      </form>
    </div>
  );
}

function AuthInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = true,
  inputMode,
  pattern,
  minLength,
  maxLength,
  lang,
  onInvalid,
  inputRef
}) {
  return (
    <div>
      <label className="
        block mb-2
        text-[10px]
        uppercase tracking-[0.2em]
        text-on-surface-variant
        font-black
      ">
        {label}
      </label>

      <input
        type={type}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        value={value}
        lang={lang}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        onInvalid={onInvalid}
        ref={inputRef}
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
  );
}
