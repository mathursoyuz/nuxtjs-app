export type MembershipSlugAvailability = boolean | null

export const createMembershipSlug = (value: string | null | undefined): string =>
    String(value ?? '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

export const isMembershipSlugValid = (value: string): boolean =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)

export const isMembershipSlugConfirmedDuplicate = (
    availability: MembershipSlugAvailability
): boolean => availability === false
