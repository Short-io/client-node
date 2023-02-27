import { ErrorResBody, SuccessResBody } from "./common.js";
import { Domain } from "./domain.js";

export interface Link {
    idString: string;
    path: string;
    DomainId: number;
    createdAt: string;
    updatedAt: string | null;
    expiresAt: string | null;
    shortURL: string;
    cloaking: boolean;
    OwnerId: number;
    originalURL: string;
    secureShortURL: string;
    title?: string;
    expiredURL?: string;
    ttl?: string;
    source?: string;
    duplicate?: boolean;
    archived?: boolean;
    redirectType?: string;
    clicksLimit?: number;
    passwordContact?: boolean;
    hasPassword?: true;
    password?: string;
    tags?: string[];
    androidURL?: string;
    iphoneURL?: string;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
    utmContent?: string | null;
}

export interface LinkCountry {
    id: string;
    LinkIdString: Link["idString"];
    country: string;
    originalURL: string;
    createdAt: Date;
}

export interface LinkRegion {
    id: string;
    LinkIdString: Link["idString"];
    country: string;
    region: string;
    originalURL: string;
    name: string;
    createdAt: Date;
}

export interface LinkCreateOptions
    extends Pick<
        Partial<Link>,
        | "source"
        | "cloaking"
        | "password"
        | "redirectType"
        | "expiredURL"
        | "title"
        | "path"
        | "androidURL"
        | "iphoneURL"
        | "clicksLimit"
    > {
    tags?: string[];
    allowDuplicates?: boolean;
    folderId?: LinkFolder["id"];
    expiresAt?: number;
    ttl?: string;
    createdAt?: number;
}

export interface LinkUpdateOptions extends LinkCreateOptions {
    originalURL?: Link["originalURL"];
    archived?: Link["archived"];
    icon?: string;
    splitURL?: string;
    splitPercent?: number;
    passwordContact?: boolean;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
    utmContent?: string | null;
}

export interface LinkBulkCreateOptions extends LinkCreateOptions, Pick<Link, "originalURL"> {}

export interface LinkWithUser extends Link, User {}

export interface LinksAndCount {
    links: LinkWithUser[];
    count: number;
    nextPageToken: string | null;
    hasMore?: boolean;
}

export interface LinkListOptions {
    domain_id: string;
    beforeDate?: string;
    afterDate?: string;
    dateSortOrder?: SortingOrder;
    createdAt?: string;
    idString?: string;
    pageToken?: string;
    folderId?: LinkFolder["id"];
    limit?: number;
    offset?: number;
}

export interface UpdateLinkErrorRes extends ErrorResBody {
    field: string;
}

export interface DeleteLinkRes extends SuccessResBody, Pick<Link, "idString"> {}

export interface GetLinkQRCodeOptions {
    type?: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
}

export type LinkOpenGraphData = [string, string][];

export interface LinkCountryCreateOptions {
    country: string;
    originalURL: string;
}

export interface LinkRegionCreateOptions {
    country: string;
    region: string;
    originalURL: string;
}

export interface LinkRegionDeleteOptions {
    country: string;
    region: string;
}

type SortingOrder = "asc" | "desc";

interface User {
    email: string;
    id: number;
    name: string;
    photoURL: string;
}

interface LinkFolder {
    id: string;
    name: string;
    DomainId: Domain["id"];
}
