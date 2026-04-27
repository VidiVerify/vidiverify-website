import type {
   ContactOption,
   Service,
   SiteConfig,
   SocialProfile,
} from "@/types";

import personalData from "../../data/personal.json";
import servicesData from "../../data/services.json";
import formatsData from "../../data/formats.json";
import contactData from "../../data/contact.json";
import donateData from "../../data/donate.json";

export const getName = (): string => personalData.name;
export const getRoles = (): string[] => personalData.roles;
export const getAbout = (): Record<string, string> => personalData.about;
export const getStatistics = (): Record<string, string> =>
   personalData.statistics;
export const getSocialProfiles = (): SocialProfile[] =>
   personalData.social_profiles;
export const getServices = (): Service[] => servicesData as Service[];
export const getContactOptions = (): ContactOption[] =>
   contactData.contact_options as ContactOption[];
export const getGitHubUsername = (): string => personalData.contact.github;
export const getSiteConfig = (): SiteConfig =>
   (personalData.site || {}) as SiteConfig;
export const getFormats = () => formatsData;
export const getDonate = () => donateData;
