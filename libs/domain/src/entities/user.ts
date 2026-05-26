import { z } from 'zod';

const experienceSchema = z.enum(['beginner', 'intermediate', 'advanced']);
const availabilityDaySchema = z.enum(['today', 'tomorrow', 'weekend']);
const availabilityTimeSchema = z.enum(['morning', 'afternoon', 'evening']);
const drinksSchema = z.enum(['coffee', 'tea']);

export type Experience = z.infer<typeof experienceSchema>;

export const userSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    drivingExperience: experienceSchema,
    cameFrom: z.string(),
    availability: z.object({
        day: availabilityDaySchema,
        time: availabilityTimeSchema,
    }),
    drinks: drinksSchema.optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export interface UserEntity {
    id: string;
    name: string;
    email: string;
    phone: string;
    drivingExperience: Experience;
    cameFrom: string;
    availability: {
        day: z.infer<typeof availabilityDaySchema>;
        time: z.infer<typeof availabilityTimeSchema>;
    };
    drinks?: z.infer<typeof drinksSchema>;
    createdAt: Date;
    updatedAt: Date;
}
