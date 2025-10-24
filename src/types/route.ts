export const exportTypes = ['sing-box', 'clash', 'surge'] as const;
export type ExportType = (typeof exportTypes)[number];