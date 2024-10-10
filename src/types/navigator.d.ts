interface Navigator {
    deviceMemory?: number;
    hardwareConcurrency: number;
    platform: string;
    userAgent: string;
    languages: readonly string[];
    connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
    };
  }
  