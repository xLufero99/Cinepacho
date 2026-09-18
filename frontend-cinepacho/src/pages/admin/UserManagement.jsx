import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import userService from '../../services/userService';

const emptyForm = {
  cedula: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  contrasena: '',
  rol: 'CLIENTE'
};

const formatPoints = (user) => user?.puntos?.total ?? user?.puntos ?? 0;

export default function UserManagement() {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err?.response?.data?.message || t('userManagement.errors.loadUsers'));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const haystack = `${user.cedula} ${user.nombre} ${user.apellido} ${user.email} ${user.rol}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.rol === roleFilter;
    return matchesSearch && matchesRole;
  }), [users, search, roleFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedUser(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({
      cedula: user.cedula || '',
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      contrasena: '',
      rol: user.rol || 'CLIENTE'
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...form };

      if (!selectedUser && !payload.contrasena) {
        throw new Error(t('userManagement.errors.passwordRequired'));
      }

      const savedUser = selectedUser
        ? await userService.updateUser(selectedUser.id, payload)
        : await userService.createUser(payload);

      setUsers((prev) => {
        if (selectedUser) {
          return prev.map((item) => (item.id === savedUser.id ? savedUser : item));
        }

        return [savedUser, ...prev];
      });

      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('userManagement.errors.saveUser'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmDelete = window.confirm(
      t('userManagement.confirmDelete', { name: `${user.nombre} ${user.apellido}` })
    );
    if (!confirmDelete) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      if (selectedUser?.id === user.id) {
        resetForm();
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('userManagement.errors.deleteUser'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
          {t('userManagement.header.badge')}
        </p>
        <h1 className="text-4xl font-black text-white uppercase font-headline">
          {t('userManagement.header.title')}
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
          {t('userManagement.header.description')}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('userManagement.filters.searchPlaceholder')}
              className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/10 text-on-surface placeholder:text-on-surface-variant"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-56 px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/10 text-on-surface"
            >
              <option value="all">{t('userManagement.filters.allRoles')}</option>
              <option value="CLIENTE">{t('userManagement.roles.cliente')}</option>
              <option value="EMPLEADO">{t('userManagement.roles.empleado')}</option>
              <option value="ADMINISTRADOR">{t('userManagement.roles.administrador')}</option>
            </select>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-outline-variant/10 bg-surface-container">
            <table className="min-w-full divide-y divide-outline-variant/10">
              <thead className="bg-surface-container-high">
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                  <th className="px-4 py-3">Cédula</th>
                  <th className="px-4 py-3">{t('userManagement.table.name')}</th>
                  <th className="px-4 py-3">{t('userManagement.table.email')}</th>
                  <th className="px-4 py-3">{t('userManagement.table.role')}</th>
                  <th className="px-4 py-3">{t('userManagement.table.points')}</th>
                  <th className="px-4 py-3 text-right">{t('userManagement.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-on-surface-variant" colSpan={6}>{t('userManagement.table.loading')}</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-on-surface-variant" colSpan={6}>{t('userManagement.table.empty')}</td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="text-sm text-on-surface">
                    <td className="px-4 py-3">{user.cedula}</td>
                    <td className="px-4 py-3">{user.nombre} {user.apellido}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.rol}</td>
                    <td className="px-4 py-3">{formatPoints(user)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-bold uppercase tracking-[0.12em]"
                      >
                        {t('userManagement.actions.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs font-bold uppercase tracking-[0.12em]"
                      >
                        {t('userManagement.actions.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full xl:w-[420px] rounded-2xl border border-outline-variant/10 bg-surface-container-high p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-black mb-1">
              {selectedUser ? t('userManagement.form.editBadge') : t('userManagement.form.createBadge')}
            </p>
            <h2 className="text-2xl font-black text-white">
              {selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}` : t('userManagement.form.newRecord')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input value={form.cedula} onChange={(e) => handleChange('cedula', e.target.value)} placeholder={t('userManagement.form.placeholders.cedula')} className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface" required />
            <input value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} placeholder={t('userManagement.form.placeholders.nombre')} className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface" required />
            <input value={form.apellido} onChange={(e) => handleChange('apellido', e.target.value)} placeholder={t('userManagement.form.placeholders.apellido')} className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface" required />
            <input value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder={t('userManagement.form.placeholders.email')} className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface" required />
            <input value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} placeholder={t('userManagement.form.placeholders.telefono')} className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface" required />
            <input value={form.direccion} onChange={(e) => handleChange('direccion', e.target.value)} placeholder={t('userManagement.form.placeholders.direccion')} className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface" required />
            <input value={form.contrasena} onChange={(e) => handleChange('contrasena', e.target.value)} placeholder={selectedUser ? t('userManagement.form.placeholders.newPassword') : t('userManagement.form.placeholders.password')} type="password" className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface" required={!selectedUser} />
            <select value={form.rol} onChange={(e) => handleChange('rol', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface">
              <option value="CLIENTE">{t('userManagement.roles.cliente')}</option>
              <option value="EMPLEADO">{t('userManagement.roles.empleado')}</option>
              <option value="ADMINISTRADOR">{t('userManagement.roles.administrador')}</option>
            </select>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {saving ? t('userManagement.actions.saving') : selectedUser ? t('userManagement.actions.update') : t('userManagement.actions.create')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 rounded-xl border border-outline-variant/15 text-on-surface-variant font-bold uppercase tracking-[0.14em]"
              >
                {t('userManagement.actions.clear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
