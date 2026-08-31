import { APIRequestContext } from "@playwright/test";
import { config } from "../config/environment";
import { CreateEventResponse, CreateEventResponseSchema, DeleteEventResponse, DeleteEventResponseSchema, FetchEventsResponse, FetchEventsResponseSchema } from "./schemas/events.schemas";
import { CreateEventPayload } from "./types/events.types";
import { ApiResult } from "./types";

export class EventsAPI {

    readonly baseURI = config.apiBaseURL
    constructor(private request: APIRequestContext) { }

    async createEvent(token: string, eventPayload: CreateEventPayload): Promise<ApiResult<CreateEventResponse>> {
        const eventJsonResponse = await (await this.request.post(this.baseURI + '/events', {
            data: eventPayload, headers: {
                Authorization: `Bearer ${token}`,
            }
        }))

        return{
            raw_response: eventJsonResponse,
            custom_response: CreateEventResponseSchema.parse(await eventJsonResponse.json())
        }
    }

    async fetchEvent(queryParams: Map<string, string>, eventId: number, token: string): Promise<ApiResult<FetchEventsResponse>> {
        const fetchEventResponse = await this.request.get(this.baseURI + '/events' + `/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: Object.fromEntries(queryParams)
        });

        return {
            raw_response: fetchEventResponse,
            custom_response: FetchEventsResponseSchema.parse(await fetchEventResponse.json())
        }
    }

    async deleteEvent(eventId: number, token: string): Promise<ApiResult<DeleteEventResponse>> {
        const deleteEventResponse = await this.request.delete(this.baseURI + '/events' + `/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return {
            raw_response: deleteEventResponse,
            custom_response: DeleteEventResponseSchema.parse(await deleteEventResponse.json())
        }
    }
}