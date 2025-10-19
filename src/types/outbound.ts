export const exportTypes = ['sing-box', 'clash', 'surge'] as const;
export type ExportType = (typeof exportTypes)[number];

export interface Outbound {
    id?: number;
    name: string;
    type: string;
    region?: string;
    provider?: string;
    [key: string]: any;
}