import { APIResponse } from "@playwright/test";

export interface CreateEventPayload {
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  price: number;
  totalSeats: number;
  imageUrl: string;
}
