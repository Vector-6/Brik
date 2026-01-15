declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'consent',
      targetId: string,
      config?: Record<string, string | number | boolean>
    ) => void;
  }
}

export {};
