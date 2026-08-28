import {z} from 'zod';

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  venue: z.string(),
  city: z.string(),
  eventDate: z.string(),
  price: z.union([z.number(),z.string()]), //Bug it should be only number, but its string
  totalSeats: z.number(),
  availableSeats: z.number(),
  imageUrl: z.string().nullable(), //z.string().nullable()
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateEventResponseSchema = z.object({
  success: z.boolean(),
  data: EventSchema,
  message: z.string(),
});

export const DeleteEventResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).or(z.object({
  success: z.boolean(),
  error: z.string(),
}));


export const FetchEventsResponseSchema = z.object({
  success: z.boolean(),
  data: EventSchema
});


export const PaginationSchema= z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const FetchEventsResponseListSchema = z.object({
  success: z.boolean(),
  data: EventSchema.array(),
  pagination: PaginationSchema
});

export type CreateEventResponse = z.infer<typeof CreateEventResponseSchema>;
export type DeleteEventResponse = z.infer<typeof DeleteEventResponseSchema>;
export type FetchEventsResponseList= z.infer<typeof FetchEventsResponseListSchema>;
export type FetchEventsResponse = z.infer<typeof FetchEventsResponseSchema>;

