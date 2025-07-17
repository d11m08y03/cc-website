export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  poster?: string | null;
  isActive: boolean;
}

export interface EventDetails extends Event {
  eventsToOrganisers: {
    user: { id: string; name: string; email: string; image?: string | null };
  }[];
  judges: {
    user: { id: string; name: string; email: string; image?: string | null };
  }[];
  participants: {
    user: { id: string; name: string; email: string; image?: string | null };
  }[];
  eventsToSponsors: {
    sponsor: {
      id: string;
      name: string;
      description?: string | null;
      logo?: string | null;
    };
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}
