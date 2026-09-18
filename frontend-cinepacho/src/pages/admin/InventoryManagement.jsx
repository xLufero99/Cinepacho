import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import InventoryFilters from '../../components/dashboard/inventory/InventoryFilters';
import InventoryTable from '../../components/dashboard/inventory/InventoryTable';
import InventoryStats from '../../components/dashboard/inventory/InventoryStats';
import InventoryAdjustModal from '../../components/dashboard/inventory/InventoryAdjustModal';

import api from '../../services/api';
import {
  getInventarioBySede,
  updateInventoryStock
} from '../../services/inventoryService';

export default function InventoryManagement() {

  const { t } = useTranslation();

  const [sedes, setSedes] = useState([]);
  const [selectedSedeId, setSelectedSedeId] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSedes, setLoadingSedes] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mini form state for adding new inventory item to selected sede
  const [newItem, setNewItem] = useState({
    nombre: '',
    marca: '',
    precio: '',
    imageUrl: ''
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const loadSedes = async () => {
      try {
        setLoadingSedes(true);
        const response = await api.get('/sedes/publicas');
        const normalized = Array.isArray(response.data) ? response.data : [];
        setSedes(normalized);

        if (!selectedSedeId && normalized.length > 0) {
          const firstSedeId = normalized[0].id || normalized[0]._id;
          setSelectedSedeId(firstSedeId);
        }
      } catch (err) {
        console.error('Error loading sedes:', err);
        setSedes([]);
        setError(err.response?.data?.message || 'No se pudieron cargar las sedes desde la base de datos');
      } finally {
        setLoadingSedes(false);
      }
    };

    loadSedes();
  }, []);

  useEffect(() => {
    const loadInventory = async () => {
      if (!selectedSedeId) {
        setInventory([]);
        setLoading(false);
        if (!loadingSedes && sedes.length === 0) {
          setError('No hay sedes disponibles en la base de datos');
        }
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await getInventarioBySede(selectedSedeId);
        const normalized = (Array.isArray(data) ? data : []).map(item => ({
          ...item,
          id: item.id || item._id
        }));
        setInventory(normalized);
      } catch (err) {
        console.error('Error loading inventory:', err);
        setInventory([]);
        setError(err.response?.data?.message || 'Error al cargar el inventario');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [selectedSedeId, loadingSedes, sedes.length]);

  const filteredInventory = useMemo(() => {

    return inventory.filter((item) => {

      return (
        item.nombre.toLowerCase().includes(search.toLowerCase())
        || item.marca.toLowerCase().includes(search.toLowerCase())
      );

    });

  }, [inventory, search]);

  const handleAdjustInventory = (item) => {
    const normalizedItem = {
      ...item,
      id: item.id || item._id
    };
    setSelectedItem(normalizedItem);
    setIsModalOpen(true);
  };

  const handleAddNewItem = async (e) => {
    e.preventDefault();

    if (!selectedSedeId) {
      setError('Selecciona una sede antes de agregar un producto');
      return;
    }

    if (!newItem.nombre.trim() || !newItem.marca.trim()) {
      setError('Nombre y marca son requeridos');
      return;
    }

    try {
      setAdding(true);
      setError('');

      let precioNum = Number(newItem.precio);
      if (isNaN(precioNum) || precioNum <= 0) {
        precioNum = 0.01;
      }

      const payload = {
        sedeId: selectedSedeId,
        nombre: newItem.nombre.trim(),
        marca: newItem.marca.trim(),
        cantidad: 0,
        precio: precioNum,
        imageUrl: newItem.imageUrl?.trim() || ''
      };

      const { createInventoryItem } = await import('../../services/inventoryService');
      const created = await createInventoryItem(payload);
      console.log('Producto creado:', created);

      const data = await getInventarioBySede(selectedSedeId);
      const normalized = (Array.isArray(data) ? data : []).map(item => ({
        ...item,
        id: item.id || item._id
      }));
      setInventory(normalized);

      // Limpiar formulario
      setNewItem({ nombre: '', marca: '', precio: '', imageUrl: '' });
    } catch (err) {
      console.error('Error adding inventory item:', err);
      const backendMsg = err.response?.data?.message || err.response?.data?.errors?.[0];
      setError(backendMsg || 'No se pudo crear el producto');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = (item) => {
    const normalizedItem = {
      ...item,
      id: item.id || item._id
    };
    setItemToDelete(normalizedItem);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete?.id) return;

    try {
      setIsDeleting(true);
      setError('');
      const { deleteInventoryItem } = await import('../../services/inventoryService');
      await deleteInventoryItem(itemToDelete.id, selectedSedeId);

      const data = await getInventarioBySede(selectedSedeId);
      const normalized = (Array.isArray(data) ? data : []).map(item => ({
        ...item,
        id: item.id || item._id
      }));
      setInventory(normalized);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      setError(err.response?.data?.message || 'No se pudo eliminar el producto');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteItem = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleSaveAdjustment = async (amount) => {
    if (!selectedSedeId) {
      setError('Selecciona una sede antes de ajustar inventario');
      return;
    }

    const itemId = selectedItem?.id;
    if (!itemId) {
      setError('El producto no tiene un identificador válido');
      return;
    }

    let cantidad = parseInt(amount, 10);
    if (isNaN(cantidad)) {
      setError('La cantidad debe ser un número entero');
      return;
    }

    try {
      await updateInventoryStock(itemId, cantidad, selectedSedeId);

      const data = await getInventarioBySede(selectedSedeId);
      const normalized = (Array.isArray(data) ? data : []).map(item => ({
        ...item,
        id: item.id || item._id
      }));
      setInventory(normalized);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating inventory stock:', err);
      setError(err.response?.data?.message || 'No se pudo actualizar el inventario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-on-surface-variant">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">
          {t('inventory.header.badge')}
        </p>

        <h1 className="text-4xl font-black text-white uppercase font-headline">
          {t('inventory.header.title')}
        </h1>

        <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
          {t('inventory.header.description')}
        </p>
        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>

      {loadingSedes ? (
        <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 text-sm text-on-surface-variant">
          Cargando sedes...
        </div>
      ) : null}

      <InventoryStats inventory={inventory} />

      <InventoryFilters
        sedes={sedes}
        selectedSedeId={selectedSedeId}
        setSelectedSedeId={setSelectedSedeId}
        search={search}
        setSearch={setSearch}
      />

      {/* Mini form: add product to selected sede */}
      <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 mt-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t('inventory.form.title')}</h3>
        <form onSubmit={handleAddNewItem} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">{t('inventory.form.name')}</label>
            <input value={newItem.nombre} onChange={(e) => setNewItem(prev => ({ ...prev, nombre: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/10" />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">{t('inventory.form.brand')}</label>
            <input value={newItem.marca} onChange={(e) => setNewItem(prev => ({ ...prev, marca: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/10" />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">{t('inventory.form.price')}</label>
            <input type="number" value={newItem.precio} onChange={(e) => setNewItem(prev => ({ ...prev, precio: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/10" />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">{t('inventory.form.image')}</label>
            <input value={newItem.imageUrl} onChange={(e) => setNewItem(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/10" />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button type="submit" disabled={adding} className="px-4 py-2 bg-primary rounded-lg text-white font-semibold">{adding ? t('inventory.form.adding') : t('inventory.form.addButton')}</button>
          </div>
        </form>
      </div>

      <InventoryTable
        inventory={filteredInventory}
        onAdjust={handleAdjustInventory}
        onDelete={handleDeleteItem}
      />

      <InventoryAdjustModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSave={handleSaveAdjustment}
      />

      <ConfirmDeleteInventoryModal
        isOpen={isDeleteModalOpen}
        itemName={itemToDelete?.nombre}
        onConfirm={confirmDeleteItem}
        onCancel={cancelDeleteItem}
        isDeleting={isDeleting}
      />

    </div>
  );
}

function ConfirmDeleteInventoryModal({ isOpen, itemName, onConfirm, onCancel, isDeleting }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-sm w-full mx-4">
        <div className="mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-container mb-4">
            <span className="material-symbols-outlined text-error text-lg">warning</span>
          </div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            {t('inventory.deleteModal.title')}
          </h2>
          <p className="text-on-surface-variant text-sm mt-2">
            {t('inventory.deleteModal.description', {
              itemName: itemName || t('inventory.deleteModal.defaultItem')
            })}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-6 py-2 rounded-lg bg-surface-variant text-on-surface hover:bg-surface-variant/80 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 rounded-lg bg-error text-on-error hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                {t('inventory.deleteModal.deleting')}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">delete</span>
                {t('common.delete')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}