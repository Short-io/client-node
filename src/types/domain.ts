type LinkType = "increment" | "random" | "secure" | "four-char" | "eight-char" | "ten-char";
type DomainState = "extra_records" | "not_registered" | "configured" | "not_configured" | "registration_pending";
type SetupType = "dns" | "js";
type HttpLevel = "none" | "redirect" | "hsts";
type RobotPermission = "allow" | "disallow" | "noindex";

export interface Domain {
    id: number;
    hostname: string;
    title: string | null;
    unicodeHostname: string;
    isFavorite: boolean;
    faviconURL: string | null;
    segmentKey: string | null;
    hasFavicon: boolean;
    linkType: LinkType;
    state: DomainState;
    redirect404: string;
    hideReferer: boolean;
    hideVisitorIp: boolean;
    caseSensitive: boolean;
    exportEnabled: boolean;
    cloaking: boolean;
    incrementCounter: string;
    setupType: SetupType;
    httpsLinks: boolean;
    integrationGA: string | null;
    integrationFB: string | null;
    integrationAdroll: string | null;
    integrationGTM: string | null;
    webhookURL: string | null;
    httpsLevel: HttpLevel;
    robots: RobotPermission;
    provider: string | null;
    purgeExpiredLinks: boolean;
    lastPurgeDate: string | null;
    createdAt: string;
    updatedAt: string;
    clientStorage?: string;
    TeamId?: number;
}

export interface DomainCreateOptions
    extends Partial<Pick<Domain, "caseSensitive" | "hideReferer" | "httpsLinks" | "linkType" | "redirect404">> {}
