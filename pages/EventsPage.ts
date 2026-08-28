import type { Page, Locator } from '@playwright/test';

export class EventsPage {
  readonly page: Page;
  readonly addEventLink: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly cityInput: Locator;
  readonly venueInput: Locator;
  readonly dateInput: Locator;
  readonly priceInput: Locator;
  readonly seatsInput: Locator;
  readonly addEventButton: Locator;
  readonly eventRows: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addEventLink = page.getByRole('link', {
      name: 'Add New Event',
    });

    this.titleInput = page.getByLabel('Title');
    this.descriptionInput = page.getByPlaceholder('Describe the event…');
    this.cityInput = page.getByLabel('City');
    this.venueInput = page.getByLabel('Venue');
    this.dateInput = page.getByLabel('Event Date & Time*');
    this.priceInput = page.getByLabel('Price ($)');
    this.seatsInput = page.getByLabel('Total Seats');
    this.addEventButton = page.getByTestId('add-event-btn');
    this.eventRows = page.locator('.event-table-row, tr');
  }

  async openAddEvent() {
    await this.addEventLink.click();
  }

  async createEvent(
    eventName: string,
    description: string,
    city: string,
    venue: string,
    dateTime: string,
    price: string,
    totalSeats: string
  ) {
    await this.titleInput.fill(eventName);
    await this.descriptionInput.fill(description);
    await this.cityInput.fill(city);
    await this.venueInput.fill(venue);
    await this.dateInput.fill(dateTime);
    await this.priceInput.fill(price);
    await this.seatsInput.fill(totalSeats);

    const responsePromise = this.page.waitForResponse('**/api/events');

    await this.addEventButton.click();

    return await responsePromise;
  }

   getEventRow(eventName: string): Locator {
    return this.eventRows.filter({ hasText: eventName });
  }
}