import { ErrorResBody, StatusResBody, SuccessResBody } from "./types/common.js";
import { Domain, DomainCreateOptions } from "./types/domain.js";
import {
    DeleteLinkRes,
    GetLinkQRCodeOptions,
    Link,
    LinkBulkCreateOptions,
    LinkCountry,
    LinkCountryCreateOptions,
    LinkCreateOptions,
    LinkListOptions,
    LinkOpenGraphData,
    LinkRegion,
    LinkRegionCreateOptions,
    LinkRegionDeleteOptions,
    LinksAndCount,
    LinkUpdateOptions,
    LinkWithUser,
    UpdateLinkErrorRes,
} from "./types/link.js";
import {
    Column,
    DomainStatistics,
    FilterOptions,
    GetLastClicksOptions,
    GetStatisticsOptions,
    IncludeExcludeOptions,
    LastClicksRes,
    LinkClicks,
    LinkIds,
    LinkStatistics,
    PathClicks,
    PathDate,
    StartEndDate,
    TopByColumnOptions,
    TopByIntervalOptions,
    TopByIntervalRes,
    TopColumnRes,
} from "./types/statistics.js";

export class Shortio {
    private readonly baseApiUrl = "https://api.short.io";
    private readonly baseStatisticsUrl = "https://api-v2.short.cm/statistics";

    constructor(private readonly apiKey: string) {}

    public readonly link = {
        /**
         * Fetch links for a given domain id.
         * By default it returns 150 links, this behavior can be changed by passing limit option.
         * API reference: https://developers.short.io/reference/apilinksget
         * @param domainId Domain id
         * @param options Options for the request
         * @returns Links, total link count and the next page token for pagination
         */
        list: async (domainId: Domain["id"], options?: LinkListOptions): Promise<LinksAndCount | ErrorResBody> => {
            let queryString = `domain_id=${domainId}`;
            if (options) {
                for (const param in options) {
                    queryString += `&${param}=${options[param as keyof LinkListOptions]}`;
                }
            }
            const linksRes = await fetch(`${this.baseApiUrl}/api/links?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const linksData = await linksRes.json();
            return linksData;
        },

        /**
         * Fetch link info by path.
         * API reference: https://developers.short.io/reference/linksexpandbydomainandpathget
         * @param hostname Domain hostname
         * @param path Path of the link
         * @returns Link details
         */
        getByPath: async (hostname: Domain["hostname"], path: Link["path"]): Promise<Link | ErrorResBody> => {
            const queryString = `domain=${hostname}&path=${path}`;
            const linkInfoRes = await fetch(`${this.baseApiUrl}/links/expand?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const linkInfo = await linkInfoRes.json();
            return linkInfo;
        },

        /**
         * Fetch link info by original URL.
         * API reference: https://developers.short.io/reference/linksbyoriginalurlbydomainandoriginalurlget
         * @param hostname Domain hostname
         * @param originalURL Original URL of the link
         * @returns Link details
         */
        getByOriginalURL: async (
            hostname: Domain["hostname"],
            originalURL: Link["originalURL"],
        ): Promise<Link | ErrorResBody> => {
            const queryString = `domain=${hostname}&originalURL=${originalURL}`;
            const linkInfoRes = await fetch(`${this.baseApiUrl}/links/by-original-url?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const linkInfo = await linkInfoRes.json();
            return linkInfo;
        },

        /**
         * Shorten a URL and create a new short link. If parameter "path" in the options is omitted, it
generates path by algorithm, chosen in domain settings.
         * API reference: https://developers.short.io/reference/linkspost
         * @param hostname Domain hostname
         * @param originalURL Original URL of the link
         * @param options Options for the request
         */
        create: async (
            hostname: Domain["hostname"],
            originalURL: Link["originalURL"],
            options?: LinkCreateOptions,
        ): Promise<Link | ErrorResBody> => {
            const linkRes = await fetch(`${this.baseApiUrl}/links`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify({
                    domain: hostname,
                    originalURL,
                    ...options,
                }),
            });
            const link = await linkRes.json();
            return link;
        },

        /**
         * Shorten a URL with public key and create a new short link. If parameter "path" in the options is omitted, it generates path by algorithm, chosen in domain settings.
         * API reference: https://developers.short.io/reference/linkspostpublic
         * @param hostname Domain hostname
         * @param originalURL Original URL of the link
         * @param publicAPIKey Public API key
         * @param options Options for the request
         * @returns Shortened link
         */
        createPublic: async (
            hostname: Domain["hostname"],
            originalURL: Link["originalURL"],
            publicAPIKey: string,
            options?: LinkCreateOptions,
        ): Promise<Link | (SuccessResBody & ErrorResBody)> => {
            const linkRes = await fetch(`${this.baseApiUrl}/links/public`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: publicAPIKey,
                },
                body: JSON.stringify({
                    domain: hostname,
                    originalURL,
                    ...options,
                }),
            });
            const link = await linkRes.json();
            return link;
        },

        /**
         * Shorten links in bulk. Method accepts up to 1000 links in one API call.
         * API reference: https://developers.short.io/reference/linksbulkpost
         * @param hostname Domain hostname
         * @param links Links to be shortened
         * @param allowDuplicates Allow duplicate links
         * @returns Shortened links
         */
        bulkCreate: async (
            hostname: Domain["hostname"],
            links: LinkBulkCreateOptions[],
            allowDuplicates = false,
        ): Promise<(Link & SuccessResBody)[] | (SuccessResBody & ErrorResBody & StatusResBody)> => {
            const linkRes = await fetch(`${this.baseApiUrl}/links/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify({
                    domain: hostname,
                    links,
                    allowDuplicates,
                }),
            });
            const link = await linkRes.json();
            return link;
        },

        /**
         * Archive link by its id string.
         * API reference: https://developers.short.io/reference/archivelink
         * @param linkIdString Link id string
         */
        archive: async (linkIdString: Link["idString"]): Promise<SuccessResBody | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/links/archive`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify({
                    link_id: linkIdString,
                }),
            });
            const linkArchiveRes = await res.json();
            return linkArchiveRes;
        },

        /**
         * Update existing link.
         * API reference: https://developers.short.io/reference/linksbylinkidpost
         * @param linkIdString Link id string
         * @param options Options for the request
         * @returns Updated link with a user details
         */
        update: async (
            linkIdString: Link["idString"],
            options: LinkUpdateOptions,
        ): Promise<LinkWithUser | UpdateLinkErrorRes> => {
            const res = await fetch(`${this.baseApiUrl}/links/${linkIdString}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(options),
            });
            const linkUpdateRes = await res.json();
            return linkUpdateRes;
        },

        /**
         * Delete link by its id string.
         * API reference: https://developers.short.io/reference/linksbylinkiddelete
         * @param linkIdString Link id string
         * @returns Deleted link id string
         */
        delete: async (linkIdString: Link["idString"]): Promise<DeleteLinkRes | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/links/${linkIdString}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const linkDeleteRes = await res.json();
            return linkDeleteRes;
        },

        /**
         * Generate QR code for a link.
         * API reference: https://developers.short.io/reference/qrcodebylinkidpost
         * @param linkIdString Link id string
         * @param options Options for the request
         * @returns QR code image
         */
        generateQRCode: async (
            linkIdString: Link["idString"],
            options?: GetLinkQRCodeOptions,
        ): Promise<ErrorResBody | Buffer> => {
            const res = await fetch(`${this.baseApiUrl}/links/qr/${linkIdString}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(options),
            });
            const buffer = Buffer.from(await res.arrayBuffer());
            return buffer;
        },

        /**
         * Get Open Graph data for a link.
         * API reference: https://developers.short.io/reference/opengraphbydomainidandlinkidget
         * @param domainId Domain id
         * @param linkIdString Link id string
         * @returns Open Graph data
         */
        getOpenGraph: async (
            domainId: Domain["id"],
            linkIdString: Link["idString"],
        ): Promise<LinkOpenGraphData | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/links/opengraph/${domainId}/${linkIdString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const openGraphData = await res.json();
            return openGraphData;
        },

        /**
         * Update Open Graph data for a link.
         * API reference: https://developers.short.io/reference/opengraphbydomainidandlinkidpost
         * @param domainId Domain id
         * @param linkIdString Link id string
         * @param newOpenGraphData updated Open Graph data
         * @returns Updated Open Graph data
         */
        updateOpenGraph: async (
            domainId: Domain["id"],
            linkIdString: Link["idString"],
            newOpenGraphData: LinkOpenGraphData,
        ): Promise<LinkOpenGraphData | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/links/opengraph/${domainId}/${linkIdString}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(newOpenGraphData),
            });
            const openGraphData = await res.json();
            return openGraphData;
        },
    };

    public readonly domain = {
        /**
         * Fetch all user domains.
         * API reference: https://developers.short.io/reference/apidomainsget
         * @returns List of domains
         */
        list: async (): Promise<Domain[] | ErrorResBody> => {
            const domainsRes = await fetch(`${this.baseApiUrl}/api/domains`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const domains = await domainsRes.json();
            return domains;
        },

        /**
         * Create a new domain and add it to your short.io account.
         * API reference: https://developers.short.io/reference/domainspost
         */
        create: async (hostname: Domain["hostname"], options?: DomainCreateOptions): Promise<Domain | ErrorResBody> => {
            const domainsRes = await fetch(`${this.baseApiUrl}/domains`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify({
                    hostname,
                    ...options,
                }),
            });
            const domain = await domainsRes.json();
            return domain;
        },
    };

    public readonly linkCountry = {
        /**
         * Returns list of country rules for a given link
         * API reference: https://developers.short.io/reference/linkcountrybylinkidget
         * @param linkIdString Link id string
         * @returns List of link country rules
         */
        list: async (linkIdString: Link["idString"]): Promise<LinkCountry[] | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/link_country/${linkIdString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const linkCountries = await res.json();
            return linkCountries;
        },

        /**
         * Create country rule for a given link
         * API reference: https://developers.short.io/reference/linkcountrybylinkidpost
         * @param linkIdString Link id string
         * @param options Options for the request
         * @returns Created link country rule
         */
        create: async (
            linkIdString: Link["idString"],
            options: LinkCountryCreateOptions,
        ): Promise<LinkCountry | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/link_country/${linkIdString}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(options),
            });
            const linkCountry = await res.json();
            return linkCountry;
        },

        /**
         * Delete country rule for a given link
         * API reference: https://developers.short.io/reference/linkcountrybylinkidandcountrydelete
         * @param linkIdString Link id string
         * @param country Country code
         * @returns Empty response body
         */
        delete: async (
            linkIdString: Link["idString"],
            country: LinkCountry["country"],
        ): Promise<SuccessResBody | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/link_country/${linkIdString}/${country}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const linkCountryDeleteRes = await res.json();
            return linkCountryDeleteRes;
        },
    };

    public readonly linkRegion = {
        /**
         * Returns list of region rules for a given link
         * API reference: https://developers.short.io/reference/linkregionbylinkidget
         * @param linkIdString Link id string
         * @returns List of link region rules
         */
        list: async (linkIdString: Link["idString"]): Promise<LinkRegion[] | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/link_region/${linkIdString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const linkRegions = await res.json();
            return linkRegions;
        },

        /**
         * Create region rule for a given link
         * API reference: https://developers.short.io/reference/linkregionbylinkidpost
         * @param linkIdString Link id string
         * @param options Options for the request
         * @returns Created link region rule
         */
        create: async (
            linkIdString: Link["idString"],
            options: LinkRegionCreateOptions,
        ): Promise<LinkRegion | ErrorResBody> => {
            const res = await fetch(`${this.baseApiUrl}/link_region/${linkIdString}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(options),
            });
            const linkRegion = await res.json();
            return linkRegion;
        },

        /**
         * Delete region rule for a given link
         * API reference: https://developers.short.io/reference/linkregionregionbylinkidandcountrydelete
         * @param linkIdString Link id string
         * @param options Options for the request
         * @returns Empty response body
         */
        delete: async (
            linkIdString: Link["idString"],
            options: LinkRegionDeleteOptions,
        ): Promise<SuccessResBody | ErrorResBody> => {
            const res = await fetch(
                `${this.baseApiUrl}/link_region/${linkIdString}/${options.country}/${options.region}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: this.apiKey,
                    },
                },
            );
            const linkRegionDeleteRes = await res.json();
            return linkRegionDeleteRes;
        },
    };

    public readonly statistics = {
        /**
         * Return link statistics
         * API reference: https://developers.short.io/reference/getlinklinkid
         * @param linkIdString Link id string
         * @param options Options for the request
         * @returns Link statistics
         */
        getByLink: async (
            linkIdString: Link["idString"],
            options?: GetStatisticsOptions,
        ): Promise<LinkStatistics | ErrorResBody> => {
            let queryString = "";
            if (options) {
                for (const param in options) {
                    queryString += `&${param}=${options[param as keyof GetStatisticsOptions]}`;
                }
            }
            const res = await fetch(
                `${this.baseStatisticsUrl}/link/${linkIdString}${queryString ? "?" + queryString : ""}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: this.apiKey,
                    },
                },
            );
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Return link statistics. The same as getByLink(), but uses POST method and sends all parameters in the body including filter parameters (include and exclude)
         * API reference: https://developers.short.io/reference/postlinklinkid
         * @param linkIdString Link id string
         * @param options Options for the request
         * @returns Link statistics
         */
        getByLinkPost: async (
            linkIdString: Link["idString"],
            options?: GetStatisticsOptions & {
                include?: FilterOptions;
                exclude?: FilterOptions;
            },
        ): Promise<LinkStatistics | ErrorResBody> => {
            const res = await fetch(`${this.baseStatisticsUrl}/link/${linkIdString}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(options),
            });
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Return domain statistics
         * API reference: https://developers.short.io/reference/getdomaindomainid
         * @param domainId Domain id
         * @param options Options for the request
         * @returns Domain statistics
         */
        getByDomain: async (
            domainId: Domain["id"],
            options?: GetStatisticsOptions,
        ): Promise<DomainStatistics | ErrorResBody> => {
            let queryString = "";
            if (options) {
                for (const param in options) {
                    queryString += `&${param}=${options[param as keyof GetStatisticsOptions]}`;
                }
            }
            const res = await fetch(
                `${this.baseStatisticsUrl}/domain/${domainId}${queryString ? "?" + queryString : ""}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: this.apiKey,
                    },
                },
            );
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Return domain statistics. The same as getByDomain(), but uses POST method and sends all parameters in the body including filter parameters (include and exclude)
         * API reference: https://developers.short.io/reference/postdomaindomainid
         * @param domainId Domain id
         * @param options Options for the request
         * @returns Domain statistics
         */
        getByDomainPost: async (
            domainId: Domain["id"],
            options?: GetStatisticsOptions & IncludeExcludeOptions,
        ): Promise<DomainStatistics | ErrorResBody> => {
            const res = await fetch(`${this.baseStatisticsUrl}/domain/${domainId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(options),
            });
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Gets link clicks for link ids
         * API reference: https://developers.short.io/reference/getdomaindomainidlink_clicks
         * @param domainId Domain id
         * @param options Options for the request. Ids is a string with comma separated link id strings
         * @returns Link clicks for requested links
         */
        getLinkClicks: async (
            domainId: Domain["id"],
            options: StartEndDate & LinkIds,
        ): Promise<LinkClicks | ErrorResBody> => {
            let queryString = "";
            for (const param in options) {
                queryString += `&${param}=${options[param as keyof (StartEndDate & LinkIds)]}`;
            }
            const res = await fetch(
                `${this.baseStatisticsUrl}/domain/${domainId}/link_clicks${queryString ? "?" + queryString : ""}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: this.apiKey,
                    },
                },
            );
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Gets link clicks for link paths and dates in the body
         * API reference: https://developers.short.io/reference/postdomaindomainidlink_clicks
         * @param domainId Domain id
         * @param options Options for the request
         * @returns Link clicks for requested links
         */
        getLinkClicksByPathDates: async (
            domainId: Domain["id"],
            pathsDates: PathDate[],
            options?: StartEndDate,
        ): Promise<PathClicks | ErrorResBody> => {
            let queryString = "";
            if (options) {
                for (const param in options) {
                    queryString += `&${param}=${options[param as keyof StartEndDate]}`;
                }
            }
            const res = await fetch(
                `${this.baseStatisticsUrl}/domain/${domainId}/link_clicks${queryString ? "?" + queryString : ""}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: this.apiKey,
                    },
                    body: JSON.stringify({ pathsDates }),
                },
            );
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Get top values of specified column, ordered by clicks desc
         * API reference: https://developers.short.io/reference/postdomaindomainidtop
         * @param domainId Domain id
         * @param column Column to get top values for
         * @param options Options for the request
         * @returns Top values of specified column for the domain
         */
        getTopByColumn: async (
            domainId: Domain["id"],
            column: Column,
            options?: TopByColumnOptions,
        ): Promise<TopColumnRes[]> => {
            const res = await fetch(`${this.baseStatisticsUrl}/domain/${domainId}/top`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify({ column, ...options }),
            });
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Get values by interval and counts for specified column
         * @param domainId Domain id
         * @param column Column to get top values for
         * @param options Options for the request
         * @returns Values by interval and counts for specified column
         */
        getTopByInterval: async (
            domainId: Domain["id"],
            column: Column,
            options?: TopByIntervalOptions,
        ): Promise<TopByIntervalRes[] | ErrorResBody> => {
            const res = await fetch(`${this.baseStatisticsUrl}/domain/${domainId}/top_by_interval`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify({ column, ...options }),
            });
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Get list of latest raw clicks
         * API reference: https://developers.short.io/reference/postdomaindomainidlast_clicks
         * @param domainId Domain id
         * @param options Options for the request
         * @returns List of latest raw clicks
         */
        getLastClicks: async (
            domainId: Domain["id"],
            options?: GetLastClicksOptions,
        ): Promise<LastClicksRes | ErrorResBody> => {
            const res = await fetch(`${this.baseStatisticsUrl}/domain/${domainId}/last_clicks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
                body: JSON.stringify(options),
            });
            const statistics = await res.json();
            return statistics;
        },

        /**
         * Clear statistics of specified domain
         * API reference: https://developers.short.io/reference/deletedomaindomainidstatistics
         * @param domainId Domain id
         * @returns Empty response body
         */
        clear: async (domainId: Domain["id"]): Promise<SuccessResBody | ErrorResBody> => {
            const res = await fetch(`${this.baseStatisticsUrl}/domain/${domainId}/statistics`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            });
            const deleteRes = await res.json();
            return deleteRes;
        },
    };
}
