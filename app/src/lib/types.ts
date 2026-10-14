// Tipe data frontend (selaras shared/types & API revisi)
export interface Project {
  id: number; name: string; engineer: string; company: string;
  project_manager: string | null; start_date: string; status: string;
}
export interface ProjectItem {
  id: number; project_id: number; description: string; unit: string;
  volume: number; price_rab: number; price_rap: number;
}
export interface Week { id: number; number: number; startDate: string; endDate: string }
export interface Mandor {
  id: number; name: string; bank: string | null; account_no: string | null; account_name: string | null;
}
export interface Spk {
  id: number; project_id: number; mandor_id: number; no_spk: string;
  retention_pct: number; payment_method: string | null; value: number; status: string;
}
export interface SpkItem {
  id: number; spk_id: number; project_item_id: number; unit_price: number;
  description: string; unit: string; volume: number; price_rab?: number; price_rap?: number;
}
export interface RecapItem {
  spk_item_id: number; description: string; unit: string;
  contract_volume: number; unit_price: number;
  volume_week: number; volume_cum: number;
  nilai_week: number; nilai_cum: number;
}
export interface Recap {
  items: RecapItem[]; total_week: number; total_cum: number;
  retensi_pct: number; retensi: number; potongan_kasbon: number;
  dibayar_minggu_ini: number; realisasi_total: number; sisa_spk: number;
  realizations: Array<{ id: number; amount: number; method: string | null; date: string; note: string | null }>;
}
export interface Kasbon { id: number; mandor_id: number; spk_id: number | null; amount: number; date: string; note: string | null }
export interface Realization { id: number; spk_id: number; week_id: number | null; amount: number; method: string | null; date: string; note: string | null }
