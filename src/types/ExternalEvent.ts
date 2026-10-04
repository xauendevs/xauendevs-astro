export interface ExternalEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  place: string;
  organizer: string;
  url: string;
  tags: string[];
  image?: string;
  mapQuery?: string;
}
