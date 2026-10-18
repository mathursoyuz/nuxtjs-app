import { z } from 'zod';

export const createOrganisationSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().min(1).max(255),
    password: z.string().min(1).max(255),
    websiteUrl: z.string().min(1).max(255),
    shippingCost: z.number().min(1),
    referralCode: z.string().min(1).max(10).nullable().optional(),
    description: z.string().max(255).nullable().optional(),
    logo: z.string().max(255).nullable().optional(),
    billingFirstName: z.string().max(50),
    billingLastName: z.string().max(50),
    billingCompany: z.string().max(100),
    billingAddress: z.string().max(100),
    billingCity: z.string().max(50),
    billingStateCode: z.string().max(5),
    billingPostalCode: z.string().max(10),
    billingCountryCode: z.string().max(5),
    billingPhone: z.string().max(15),
    isActive: z.boolean(),
});

export const updateOrganisationSchema = createOrganisationSchema.partial();

export type CreateOrganisationFormData = z.infer<typeof createOrganisationSchema>;
export type UpdateOrganisationFormData = z.infer<typeof updateOrganisationSchema>;
