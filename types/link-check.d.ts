declare module "link-check" {
  interface LinkCheckResult {
    link: string;
    status: "alive" | "dead" | "invalid" | string;
    statusCode?: number;
    err?: any;
  }
  function linkCheck(url: string, callback: (err: any, result: LinkCheckResult) => void): void;
  export = linkCheck;
}
