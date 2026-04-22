interface Insight {
    id: string;
    type: "success" | "warning" | "info";
    message: string;
    action: string | null;
}
export declare const GenerateInsights: (userId: string) => Promise<Insight[]>;
export {};
//# sourceMappingURL=insightService.d.ts.map