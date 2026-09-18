import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MetricCard from '../../components/dashboard/overview/MetricCard';
import RevenueFlowChart from '../../components/dashboard/overview/RevenueFlowChart';
import TopPerformingMovies from '../../components/dashboard/overview/TopPerformingMovies';
import { getMultiplexes } from '../../services/multiplexService';
import { getPurchasesBySede } from '../../services/purchaseService';
import { getFuncionesBySede } from '../../services/adminFuncionService';
import { getPeliculas } from '../../services/peliculaService';

const PAID_STATES = new Set(['PAGADA', 'COMPLETADA']);

const toDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSameDay = (a, b) => (
  a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate()
);

const safeNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const formatCurrency = (value) => (
  new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(safeNumber(value))
);

const computeTrend = (today, previous) => {
  if (previous === 0) {
    return today > 0 ? 100 : 0;
  }

  return ((today - previous) / previous) * 100;
};

const formatTrend = (value) => `${Math.abs(value).toFixed(0)}%`;

const PERIODS = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  TOTAL: 'total',
  CUSTOM: 'custom'
};

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isBetweenBounds = (date, bounds) => {
  if (!bounds) {
    return true;
  }

  return date >= bounds.start && date <= bounds.end;
};

const getPeriodBounds = (period, customStartDate, customEndDate, now = new Date()) => {
  if (period === PERIODS.TOTAL) {
    return null;
  }

  if (period === PERIODS.DAILY) {
    return {
      start: startOfDay(now),
      end: endOfDay(now)
    };
  }

  if (period === PERIODS.MONTHLY) {
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  }

  const parsedStart = parseDateInput(customStartDate);
  const parsedEnd = parseDateInput(customEndDate);

  if (!parsedStart || !parsedEnd) {
    return null;
  }

  const start = startOfDay(parsedStart);
  const end = endOfDay(parsedEnd);

  if (start > end) {
    return {
      start: end,
      end: start
    };
  }

  return { start, end };
};

const getPreviousBounds = (period, activeBounds) => {
  if (!activeBounds || period === PERIODS.TOTAL) {
    return null;
  }

  if (period === PERIODS.DAILY) {
    const prevDay = new Date(activeBounds.start);
    prevDay.setDate(prevDay.getDate() - 1);
    return {
      start: startOfDay(prevDay),
      end: endOfDay(prevDay)
    };
  }

  if (period === PERIODS.MONTHLY) {
    const prevMonthDate = new Date(activeBounds.start);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    return {
      start: startOfMonth(prevMonthDate),
      end: endOfMonth(prevMonthDate)
    };
  }

  const spanMs = activeBounds.end.getTime() - activeBounds.start.getTime();
  return {
    start: new Date(activeBounds.start.getTime() - spanMs - 1),
    end: new Date(activeBounds.start.getTime() - 1)
  };
};

const createChartPoints = (entries) => {
  if (!entries.length) {
    return [];
  }

  const maxValue = Math.max(...entries.map((entry) => entry.total), 1);
  return entries.map((entry) => {
    const heightPct = Math.max(8, Math.round((entry.total / maxValue) * 95));
    return {
      time: entry.label,
      label: `$${formatCurrency(entry.total)}`,
      heightPct,
      isHigh: entry.total === maxValue && entry.total > 0
    };
  });
};

const buildChartByHour = (purchases) => {
  const entries = Array.from({ length: 12 }, (_, idx) => {
    const hour = idx + 11;
    const labelHour = hour % 12 === 0 ? 12 : hour % 12;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    return { key: hour, label: `${labelHour}${suffix}`, total: 0 };
  });

  purchases.forEach((compra) => {
    const date = toDate(compra.fecha);
    if (!date) {
      return;
    }

    const bucket = entries.find((entry) => entry.key === date.getHours());
    if (bucket) {
      bucket.total += safeNumber(compra.total);
    }
  });

  return createChartPoints(entries);
};

const buildChartByDay = (purchases, bounds) => {
  if (!bounds) {
    return [];
  }

  const entries = [];
  const cursor = new Date(bounds.start);
  while (cursor <= bounds.end) {
    const key = formatDateInput(cursor);
    entries.push({ key, label: `${cursor.getDate()}/${cursor.getMonth() + 1}`, total: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  purchases.forEach((compra) => {
    const date = toDate(compra.fecha);
    if (!date) {
      return;
    }

    const key = formatDateInput(date);
    const bucket = byKey.get(key);
    if (bucket) {
      bucket.total += safeNumber(compra.total);
    }
  });

  return createChartPoints(entries);
};

const buildChartByMonth = (purchases) => {
  const monthMap = new Map();

  purchases.forEach((compra) => {
    const date = toDate(compra.fecha);
    if (!date) {
      return;
    }

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(2)}`;
    const existing = monthMap.get(key) || { key, label, total: 0 };
    existing.total += safeNumber(compra.total);
    monthMap.set(key, existing);
  });

  return createChartPoints(Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key)));
};

const buildRevenuePoints = (purchases, period, bounds) => {
  if (!purchases.length) {
    return [];
  }

  if (period === PERIODS.DAILY) {
    return buildChartByHour(purchases);
  }

  if (period === PERIODS.MONTHLY) {
    return buildChartByDay(purchases, bounds);
  }

  if (period === PERIODS.CUSTOM && bounds) {
    const days = Math.floor((bounds.end.getTime() - bounds.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days <= 62) {
      return buildChartByDay(purchases, bounds);
    }
  }

  return buildChartByMonth(purchases);
};

const escapeCsvValue = (value) => {
  const raw = String(value ?? '');
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
};

const toCsvLine = (values) => values.map(escapeCsvValue).join(',');

export default function DailySummary({ sedeActualInfo }) {

  const { t } = useTranslation();
  const outletContext = useOutletContext() || {};
  const sedeDesdeContexto = sedeActualInfo || outletContext.sedeActualInfo;

  const [sedes, setSedes] = useState([]);
  const [selectedSedeId, setSelectedSedeId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.DAILY);
  const [customStartDate, setCustomStartDate] = useState(formatDateInput(new Date()));
  const [customEndDate, setCustomEndDate] = useState(formatDateInput(new Date()));
  const [isLoadingSedes, setIsLoadingSedes] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [salesCountInPeriod, setSalesCountInPeriod] = useState(0);
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    snackSales: 0,
    activeFunctions: 0,
    activeFunctionsTotal: 0,
    trendRevenue: 0,
    trendTickets: 0,
    trendSnacks: 0
  });
  const [revenuePoints, setRevenuePoints] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [purchasesInPeriodForExport, setPurchasesInPeriodForExport] = useState([]);

  useEffect(() => {
    const loadSedes = async () => {
      try {
        const sedesData = await getMultiplexes();
        const normalized = Array.isArray(sedesData)
          ? sedesData.map((sede) => ({ ...sede, id: sede.id || sede._id }))
          : [];

        setSedes(normalized);

        if (normalized.length === 0) {
          return;
        }

        const contextoId = sedeDesdeContexto?.id || sedeDesdeContexto?._id;
        const sedeInicial = normalized.find((sede) => sede.id === contextoId) || normalized[0];
        setSelectedSedeId(sedeInicial.id);
      } catch (error) {
        console.error('Error loading sedes in daily summary:', error);
      } finally {
        setIsLoadingSedes(false);
      }
    };

    loadSedes();
  }, [sedeDesdeContexto?.id, sedeDesdeContexto?._id]);

  const selectedSede = useMemo(
    () => sedes.find((sede) => sede.id === selectedSedeId),
    [sedes, selectedSedeId]
  );

  const periodBounds = useMemo(
    () => getPeriodBounds(selectedPeriod, customStartDate, customEndDate),
    [selectedPeriod, customStartDate, customEndDate]
  );

  const trendLabel = useMemo(() => {
    if (selectedPeriod === PERIODS.DAILY) {
      return t('admin.metrics.vsYesterday');
    }

    if (selectedPeriod === PERIODS.MONTHLY) {
      return t('admin.metrics.vsPreviousMonth');
    }

    if (selectedPeriod === PERIODS.CUSTOM) {
      return t('admin.metrics.vsPreviousRange');
    }

    return t('admin.metrics.vsHistoricalAverage');
  }, [selectedPeriod, t]);

  useEffect(() => {
    if (!selectedSedeId) {
      setSummaryMetrics({
        totalRevenue: 0,
        ticketsSold: 0,
        snackSales: 0,
        activeFunctions: 0,
        activeFunctionsTotal: 0,
        trendRevenue: 0,
        trendTickets: 0,
        trendSnacks: 0
      });
      setRevenuePoints([]);
      setTopMovies([]);
      setPurchasesInPeriodForExport([]);
      setSalesCountInPeriod(0);
      return;
    }

    const loadSummary = async () => {
      setIsLoadingSummary(true);
      setSummaryError('');

      try {
        const [comprasResponse, funcionesResponse, peliculasResponse] = await Promise.all([
          getPurchasesBySede(selectedSedeId),
          getFuncionesBySede(selectedSedeId),
          getPeliculas()
        ]);

        const comprasRaw = Array.isArray(comprasResponse) ? comprasResponse : [];

        // Defensive filter: ensure we only process purchases that belong to the selected sede.
        const compras = comprasRaw.filter((compra) => {
          const sedeField = compra.sedeId || (compra.sede && (compra.sede.id || compra.sede._id));
          return sedeField ? String(sedeField) === String(selectedSedeId) : false;
        });

        if (comprasRaw.length > 0 && compras.length === 0) {
          // If backend returned purchases but none matched the selected sede, log for debugging.
          // eslint-disable-next-line no-console
          console.warn('Filtered out purchases that do not match selectedSedeId', { selectedSedeId, comprasRawSample: comprasRaw.slice(0, 3) });
        }
        const funciones = Array.isArray(funcionesResponse) ? funcionesResponse : [];
        const peliculas = Array.isArray(peliculasResponse) ? peliculasResponse : [];

        const comprasPagadas = compras.filter((compra) => PAID_STATES.has(compra.estado));
        const purchasesInPeriod = comprasPagadas.filter((compra) => {
          const fecha = toDate(compra.fecha);
          return fecha ? isBetweenBounds(fecha, periodBounds) : false;
        });

        const previousBounds = getPreviousBounds(selectedPeriod, periodBounds);
        const previousPurchases = previousBounds
          ? comprasPagadas.filter((compra) => {
            const fecha = toDate(compra.fecha);
            return fecha ? isBetweenBounds(fecha, previousBounds) : false;
          })
          : [];

        const calcMetrics = (purchases) => purchases.reduce((acc, compra) => {
          const totalCompra = safeNumber(compra.total);
          const items = Array.isArray(compra.compra) ? compra.compra : [];

          const tickets = items
            .filter((item) => item.tipo === 'boleta')
            .reduce((sum, item) => sum + safeNumber(item.cantidad), 0);

          const snacks = items
            .filter((item) => item.tipo === 'snack')
            .reduce((sum, item) => sum + safeNumber(item.subtotal || (item.precioUnitario * item.cantidad)), 0);

          return {
            totalRevenue: acc.totalRevenue + totalCompra,
            ticketsSold: acc.ticketsSold + tickets,
            snackSales: acc.snackSales + snacks
          };
        }, {
          totalRevenue: 0,
          ticketsSold: 0,
          snackSales: 0
        });

        const periodMetrics = calcMetrics(purchasesInPeriod);
        const previousMetrics = calcMetrics(previousPurchases);

        const trendRevenue = selectedPeriod === PERIODS.TOTAL
          ? 0
          : computeTrend(periodMetrics.totalRevenue, previousMetrics.totalRevenue);
        const trendTickets = selectedPeriod === PERIODS.TOTAL
          ? 0
          : computeTrend(periodMetrics.ticketsSold, previousMetrics.ticketsSold);
        const trendSnacks = selectedPeriod === PERIODS.TOTAL
          ? 0
          : computeTrend(periodMetrics.snackSales, previousMetrics.snackSales);

        const funcionesEnPeriodo = funciones.filter((funcion) => {
          const fechaFuncion = toDate(funcion.fecha);
          return fechaFuncion ? isBetweenBounds(fechaFuncion, periodBounds) : false;
        });

        setSummaryMetrics({
          ...periodMetrics,
          activeFunctions: funcionesEnPeriodo.length,
          activeFunctionsTotal: funciones.length,
          trendRevenue,
          trendTickets,
          trendSnacks
        });

        setSalesCountInPeriod(purchasesInPeriod.length);
        setPurchasesInPeriodForExport(purchasesInPeriod);
        setRevenuePoints(buildRevenuePoints(purchasesInPeriod, selectedPeriod, periodBounds));

        const funcionesById = new Map(funciones.map((funcion) => [funcion.id, funcion]));
        const peliculasById = new Map(peliculas.map((pelicula) => [pelicula.id, pelicula]));
        const movieSalesMap = new Map();

        purchasesInPeriod.forEach((compra) => {
          const items = Array.isArray(compra.compra) ? compra.compra : [];
          items
            .filter((item) => item.tipo === 'boleta' && item.referenciaId)
            .forEach((item) => {
              const funcion = funcionesById.get(item.referenciaId);
              const peliculaId = funcion?.peliculaId;

              if (!peliculaId) {
                return;
              }

              const current = movieSalesMap.get(peliculaId) || {
                tickets: 0,
                funcion
              };

              current.tickets += safeNumber(item.cantidad);
              movieSalesMap.set(peliculaId, current);
            });
        });

        const topMoviesData = Array.from(movieSalesMap.entries())
          .sort(([, a], [, b]) => b.tickets - a.tickets)
          .slice(0, 3)
          .map(([peliculaId, data]) => {
            const pelicula = peliculasById.get(peliculaId);
            const funcion = data.funcion || {};
            return {
              _id: peliculaId,
              nombre: pelicula?.nombre || t('admin.topMovies.unknownMovie'),
              url_poster: pelicula?.urlPoster || 'https://via.placeholder.com/120x160',
              funcionInfo: {
                sala_id: funcion?.salaId || '-',
                hora: funcion?.hora || '-',
                sillasVendidas: data.tickets
              }
            };
          });

        setTopMovies(topMoviesData);
      } catch (error) {
        console.error('Error loading daily summary metrics:', error);
        setSummaryError(t('admin.dailySummary.summaryError'));
        setSummaryMetrics({
          totalRevenue: 0,
          ticketsSold: 0,
          snackSales: 0,
          activeFunctions: 0,
          activeFunctionsTotal: 0,
          trendRevenue: 0,
          trendTickets: 0,
          trendSnacks: 0
        });
        setRevenuePoints([]);
        setTopMovies([]);
        setPurchasesInPeriodForExport([]);
        setSalesCountInPeriod(0);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    loadSummary();
  }, [selectedSedeId, selectedPeriod, customStartDate, customEndDate, periodBounds, t]);

  const handleExportCSV = () => {
    if (!selectedSedeId) {
      return;
    }

    const now = new Date();
    const reportDate = now.toISOString();
    const periodLabel = selectedPeriod === PERIODS.DAILY
      ? t('admin.dailySummary.periodDaily')
      : selectedPeriod === PERIODS.MONTHLY
        ? t('admin.dailySummary.periodMonthly')
        : selectedPeriod === PERIODS.TOTAL
          ? t('admin.dailySummary.periodTotal')
          : t('admin.dailySummary.periodCustom');

    const rangeLabel = periodBounds
      ? `${formatDateInput(periodBounds.start)} ${t('admin.dailySummary.to')} ${formatDateInput(periodBounds.end)}`
      : t('admin.dailySummary.allTimeRange');

    const headerRows = [
      toCsvLine(['CinePacho - Reporte de Ventas']),
      toCsvLine(['Sede', selectedSede?.nombre || selectedSedeId]),
      toCsvLine(['Periodo', periodLabel]),
      toCsvLine(['Rango', rangeLabel]),
      toCsvLine(['Generado en', reportDate]),
      ''
    ];

    const metricRows = [
      toCsvLine(['Metricas']),
      toCsvLine([t('admin.metrics.totalRevenue'), summaryMetrics.totalRevenue]),
      toCsvLine([t('admin.metrics.ticketsSold'), summaryMetrics.ticketsSold]),
      toCsvLine([t('admin.metrics.snackSales'), summaryMetrics.snackSales]),
      toCsvLine([t('admin.metrics.activeFunctions'), summaryMetrics.activeFunctions]),
      toCsvLine([t('admin.dailySummary.salesCount'), salesCountInPeriod]),
      ''
    ];

    const topMovieRows = [
      toCsvLine([t('admin.topMovies.title')]),
      toCsvLine(['Pelicula', 'Boletas vendidas', 'Sala', 'Hora']),
      ...topMovies.map((movie) => toCsvLine([
        movie.nombre,
        movie.funcionInfo?.sillasVendidas || 0,
        movie.funcionInfo?.sala_id || '-',
        movie.funcionInfo?.hora || '-'
      ])),
      ''
    ];

    const detailRows = [
      toCsvLine(['Detalle de Compras']),
      toCsvLine(['Compra ID', 'Fecha', 'Estado', 'Total', 'Items', 'Boletas', 'Snacks']),
      ...purchasesInPeriodForExport.map((purchase) => {
        const items = Array.isArray(purchase.compra) ? purchase.compra : [];
        const ticketCount = items
          .filter((item) => item.tipo === 'boleta')
          .reduce((sum, item) => sum + safeNumber(item.cantidad), 0);
        const snackSubtotal = items
          .filter((item) => item.tipo === 'snack')
          .reduce((sum, item) => sum + safeNumber(item.subtotal || (item.precioUnitario * item.cantidad)), 0);

        return toCsvLine([
          purchase.id || '',
          purchase.fecha || '',
          purchase.estado || '',
          safeNumber(purchase.total),
          items.length,
          ticketCount,
          snackSubtotal
        ]);
      })
    ];

    const csvContent = [
      ...headerRows,
      ...metricRows,
      ...topMovieRows,
      ...detailRows
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileDate = formatDateInput(now);
    link.href = url;
    link.setAttribute('download', `reporte_ventas_${selectedSedeId}_${selectedPeriod}_${fileDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCloseShift = () =>
    window.confirm(t('admin.dailySummary.closeShiftConfirm'));

  return (
    <div className="animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-2 text-white tracking-tight">
            {t('admin.dailySummary.title')}{' '}
            <span className="text-primary italic">
              {t('admin.dailySummary.highlight')}
            </span>
          </h2>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <p className="text-on-surface-variant font-body">
              {t('admin.dailySummary.branch')}:
            </p>

            <select
              value={selectedSedeId}
              onChange={(e) => setSelectedSedeId(e.target.value)}
              disabled={isLoadingSedes || sedes.length === 0}
              className="min-w-[220px] px-3 py-2 rounded-md border border-outline-variant/30 bg-surface-variant/40 text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            >
              {isLoadingSedes && (
                <option value="">
                  {t('admin.dailySummary.loadingBranches')}
                </option>
              )}

              {!isLoadingSedes && sedes.length === 0 && (
                <option value="">
                  {t('admin.dailySummary.noBranches')}
                </option>
              )}

              {!isLoadingSedes && sedes.length > 0 && sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>

            {selectedSede?.nombre && (
              <span className="text-primary font-semibold font-body">
                {selectedSede.nombre}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <p className="text-on-surface-variant font-body">
              {t('admin.dailySummary.period')}:
            </p>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="min-w-[220px] px-3 py-2 rounded-md border border-outline-variant/30 bg-surface-variant/40 text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={PERIODS.DAILY}>{t('admin.dailySummary.periodDaily')}</option>
              <option value={PERIODS.MONTHLY}>{t('admin.dailySummary.periodMonthly')}</option>
              <option value={PERIODS.TOTAL}>{t('admin.dailySummary.periodTotal')}</option>
              <option value={PERIODS.CUSTOM}>{t('admin.dailySummary.periodCustom')}</option>
            </select>

            {selectedPeriod === PERIODS.CUSTOM && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 rounded-md border border-outline-variant/30 bg-surface-variant/40 text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <span className="text-on-surface-variant font-body">{t('admin.dailySummary.to')}</span>

                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 rounded-md border border-outline-variant/30 bg-surface-variant/40 text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-md border border-outline-variant/20 text-secondary font-label text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors bg-surface-variant/20 backdrop-blur-md"
          >
            {t('admin.dailySummary.exportCSV')}
          </button>

          <button
            onClick={handleCloseShift}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold font-label text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
          >
            {t('admin.dailySummary.closeShift')}
          </button>

        </div>

      </div>

      {/* METRICS */}
      {summaryError && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error/10 text-error px-4 py-3">
          {summaryError}
        </div>
      )}

      {salesCountInPeriod === 0 && !isLoadingSummary && (
        <div className="mb-6 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface-variant">
          {t('admin.dailySummary.noSalesForPeriod')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

        <MetricCard
          title={t('admin.metrics.totalRevenue')}
          value={`$${formatCurrency(summaryMetrics.totalRevenue)}`}
          icon="account_balance_wallet"
          trend={formatTrend(summaryMetrics.trendRevenue)}
          trendDirection={summaryMetrics.trendRevenue >= 0 ? 'up' : 'down'}
          trendLabel={trendLabel}
          colorTheme="primary"
        />

        <MetricCard
          title={t('admin.metrics.ticketsSold')}
          value={summaryMetrics.ticketsSold}
          icon="confirmation_number"
          trend={formatTrend(summaryMetrics.trendTickets)}
          trendDirection={summaryMetrics.trendTickets >= 0 ? 'up' : 'down'}
          trendLabel={trendLabel}
          colorTheme="secondary"
        />

        <MetricCard
          title={t('admin.metrics.snackSales')}
          value={`$${formatCurrency(summaryMetrics.snackSales)}`}
          icon="local_cafe"
          trend={formatTrend(summaryMetrics.trendSnacks)}
          trendDirection={summaryMetrics.trendSnacks >= 0 ? 'up' : 'down'}
          trendLabel={trendLabel}
          colorTheme="tertiary"
        />

        <MetricCard
          title={t('admin.metrics.activeFunctions')}
          value={summaryMetrics.activeFunctions}
          subValue={`/${summaryMetrics.activeFunctionsTotal}`}
          icon="theaters"
          colorTheme="white"
          progress={summaryMetrics.activeFunctionsTotal > 0
            ? (summaryMetrics.activeFunctions / summaryMetrics.activeFunctionsTotal) * 100
            : 0}
        />

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">
          <RevenueFlowChart
            comprasHoy={revenuePoints}
            emptyStateMessage={t('admin.dailySummary.noSalesForPeriod')}
            loading={isLoadingSummary}
          />
        </div>

        <div>
          <TopPerformingMovies
            topMovies={topMovies}
            emptyStateMessage={t('admin.dailySummary.noSalesForPeriod')}
            loading={isLoadingSummary}
          />
        </div>

      </div>

    </div>
  );
}