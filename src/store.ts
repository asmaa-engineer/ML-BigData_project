import { create } from 'zustand';
import { SaleEvent, QualityInspection, Product } from './lib/mockData';
import type { DataSource, MLReportSummary, ReadinessPayload } from './lib/contracts';

interface AppState {
  sales: SaleEvent[];
  quality: QualityInspection[];
  products: Product[];
  productMap: Record<string, Product>;
  isLoading: boolean;
  error: string | null;
  dataSource: DataSource | null;
  readiness: ReadinessPayload | null;
  mlReport: MLReportSummary | null;
  lastLoadedAt: string | null;
  fetchData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  sales: [],
  quality: [],
  products: [],
  productMap: {},
  isLoading: true,
  error: null,
  dataSource: null,
  readiness: null,
  mlReport: null,
  lastLoadedAt: null,
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [dataRes, readinessRes, mlStatusRes] = await Promise.all([
        fetch('/api/data'),
        fetch('/api/readiness'),
        fetch('/api/ml/status'),
      ]);

      if (!dataRes.ok) {
        throw new Error('Unable to load analytics data.');
      }

      if (!readinessRes.ok) {
        throw new Error('Unable to load project readiness.');
      }

      if (!mlStatusRes.ok) {
        throw new Error('Unable to load ML evaluation report.');
      }

      const data = await dataRes.json();
      const readiness = (await readinessRes.json()) as ReadinessPayload;
      const mlStatus = (await mlStatusRes.json()) as { report: MLReportSummary | null };

      set({
        sales: data.sales,
        quality: data.quality,
        products: data.products,
        productMap: data.productMap,
        dataSource: data.source,
        readiness,
        mlReport: mlStatus.report,
        lastLoadedAt: new Date().toISOString(),
        isLoading: false,
        error: null,
      });
    } catch (e) {
      console.error("Failed to load data", e);
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'Failed to load project data.',
      });
    }
  }
}));
