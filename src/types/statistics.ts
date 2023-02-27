import { Link } from "./link";

export interface GetStatisticsOptions extends StartEndDate {
    period?: Period;
    tzOffset?: number;
    clicksChartInterval?: Interval;
}

export interface TopByColumnOptions extends StartEndDate, Pick<LimitOffset, "limit">, IncludeExcludeOptions {
    period?: Period;
    tzOffset?: number;
    prefix?: string;
}

export interface TopByIntervalOptions extends StartEndDate, Pick<LimitOffset, "limit">, IncludeExcludeOptions {
    interval?: Interval;
    period?: Period;
    tzOffset?: number;
}

export interface TopByIntervalRes {
    date: string;
    statistics: {
        column: string;
        score: string;
    }[];
}

export interface TopByColumnRes {
    name: string;
}

export interface GetLastClicksOptions
    extends StartEndDate,
        Pick<LimitOffset, "limit">,
        IncludeExcludeOptions,
        BeforeAfterDate {
    tzOffset?: number;
    period?: Period;
}

export interface LastClicksRes {
    host: string;
    path: string;
    lcpath: string;
    dt: string;
    method: string;
    url: string;
    st: number;
    ip: string;
    proto: string;
    ref: string;
    ua: string;
    human: boolean;
    browser: string;
    browser_version: string;
    country: string;
    city: string;
    social: string;
    refhost: string;
    os: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    goal_completed: boolean | null;
    ab_path: string | null;
}

export interface FilterOptions {
    paths?: Set<string>;
    countries?: Set<string>;
    dt?: [Date, Date];
    browsers?: string[];
    human?: boolean;
    socials?: string[];
    browserVersions?: string[];
    statuses?: number[];
    methods?: string[];
    protos?: ("http" | "https")[];
    refhosts?: string[];
    utmSources?: string[];
    utmMediums?: string[];
    utmCampaigns?: string[];
}

export interface IncludeExcludeOptions {
    include?: FilterOptions;
    exclude?: FilterOptions;
}

export interface LinkIds {
    ids: string;
}

export interface PathDate extends Pick<Link, "path" | "createdAt"> {}

export interface PathClicks {
    [path: Link["path"]]: number;
}

export interface LinkStatistics {
    totalClicks: number;
    humanClicks: number;
    humanClicksChange: string;
    totalClicksChange: string;
    clickStatistics: {
        datasets: [
            {
                data: DatePoint[];
            },
        ];
    };
    interval: IntervalResponse;
    referer: Referer[];
    social: Social[];
    browser: Browser[];
    os: OS[];
    city: City[];
    country: Country[];
}

export interface DomainStatistics {
    country: Country[];
    city: City[];
    clicks: number;
    humanClicks: number;
    links: number;
    linksChange: string;
    linksChangePositive: boolean;
    clicksPerLink: string;
    clicksPerLinkChange: string;
    humanClicksPerLink: string;
    prevClicksChange: string;
    humanClicksChange: string;
    humanClicksChangePositive: boolean;
    interval: IntervalResponse;
    clickStatistics: {
        datasets: [
            {
                data: DatePoint[];
            },
        ];
    };
    referer: Referer[];
    social: Social[];
    browser: Browser[];
    os: OS[];
    utm_medium: ({ utm_medium: string } & ClicksScore)[];
    utm_source: ({ utm_source: string } & ClicksScore)[];
    utm_campaign: ({ utm_campaign: string } & ClicksScore)[];
}

interface IntervalResponse {
    startDate: Date | null;
    endDate: Date | null;
    prevStartDate: Date | null;
    prevEndDate: Date | null;
}

interface DatePoint {
    x: Date;
    y: number;
}

interface City extends ClicksScore {
    city: number;
    name: string;
}

interface OS extends ClicksScore {
    os: string;
}

interface Social extends ClicksScore {
    social: string;
    socialName?: string;
}

interface Browser extends ClicksScore {
    browser: string;
    browserName?: string;
}

interface Referer extends ClicksScore {
    referer: string;
}

interface Country extends ClicksScore {
    country: string;
    countryName: string;
}

interface ClicksScore {
    score: number;
}

type Period = "custom" | "today" | "yesterday" | "total" | "week" | "month" | "lastmonth" | "last7" | "last30";
type Interval = "hour" | "day" | "week" | "month";

export interface StartEndDate {
    startDate?: string;
    endDate?: string;
}

export interface BeforeAfterDate {
    afterDate?: string;
    beforeDate?: string;
}

export interface LinkClicks {
    [key: Link["idString"]]: number;
}

export interface LimitOffset {
    limit?: number;
    offset?: number;
}

export type Column =
    | "path"
    | "method"
    | "st"
    | "proto"
    | "human"
    | "browser"
    | "browser_version"
    | "country"
    | "city"
    | "social"
    | "refhost"
    | "os"
    | "utm_source"
    | "utm_medium"
    | "utm_campaign"
    | "goal_completed"
    | "ab_path";

export interface TopColumnRes {
    score: number;
    column: string;
    displayName: string;
}
