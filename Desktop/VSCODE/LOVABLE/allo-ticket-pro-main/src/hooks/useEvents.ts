import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';

interface DbEvent {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string | null;
  video_url: string | null;
  gallery: string[] | null;
  is_public: boolean;
  is_featured: boolean | null;
  organizer: string | null;
  category_id: string | null;
}

interface DbCategory {
  id: string;
  name: string;
  icon: string | null;
}

interface DbTicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number;
  event_id: string;
  start_time?: string | null;
  end_time?: string | null;
  client_price?: number | null;
  manager_fees?: number | null;
}

const transformEvent = (
  dbEvent: DbEvent,
  category: DbCategory | null,
  ticketTypes: DbTicketType[]
): Event => ({
  id: dbEvent.id,
  name: dbEvent.name,
  description: dbEvent.description || '',
  date: dbEvent.event_date,
  time: dbEvent.event_time,
  location: dbEvent.location,
  image: dbEvent.image_url || '/placeholder.svg',
  gallery: dbEvent.gallery || [],
  video: dbEvent.video_url || undefined,
  organizer: dbEvent.organizer || '',
  category: category?.name || 'Événement',
  ticketTypes: ticketTypes.map(tt => ({
    id: tt.id,
    name: tt.name,
    price: tt.price,
    fees: (tt as any).fees || 0,
    description: tt.description || '',
    available: tt.quantity_available,
    startTime: tt.start_time ?? null,
    endTime: tt.end_time ?? null,
    clientPrice: (tt as any).client_price ?? null,
    managerFees: (tt as any).manager_fees ?? 0,
  })),
});

async function fetchEventsData(isPublicOnly: boolean, limit?: number) {
  let query = supabase.from('events').select('*');
  if (isPublicOnly) query = query.eq('is_public', true);
  if (limit) {
    query = query.order('is_featured', { ascending: false }).order('event_date', { ascending: true }).limit(limit);
  } else {
    query = query.order('event_date', { ascending: true });
  }

  const { data: eventsData, error: eventsError } = await query;
  if (eventsError) throw eventsError;

  const { data: categoriesData } = await supabase.from('categories').select('id, name, icon');

  const eventIds = eventsData?.map(e => e.id) || [];
  const { data: ticketTypesData } = await supabase
    .from('ticket_types')
    .select('*')
    .in('event_id', eventIds.length > 0 ? eventIds : ['none']);

  return (eventsData || []).map(event => {
    const category = (categoriesData || []).find(c => c.id === event.category_id);
    const ticketTypes = (ticketTypesData || []).filter(tt => tt.event_id === event.id);
    return transformEvent(event as DbEvent, category || null, ticketTypes);
  });
}

export const useEvents = () => {
  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events', 'public'],
    queryFn: () => fetchEventsData(true),
  });

  return { events, isLoading, error: error as Error | null, refetch };
};

export const useEvent = (id: string | undefined) => {
  const { data: event = null, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) return null;

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!eventData) return null;

      let category: DbCategory | null = null;
      if (eventData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, name, icon')
          .eq('id', eventData.category_id)
          .maybeSingle();
        category = categoryData;
      }

      const { data: ticketTypesData } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', id);

      return transformEvent(eventData as DbEvent, category, ticketTypesData || []);
    },
    enabled: !!id,
  });

  return { event, isLoading, error: error as Error | null };
};

export const useCategories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon')
        .order('name');

      if (error) throw error;

      return [
        { name: 'Tous', value: 'all', icon: '🎯' },
        ...(data || []).map(cat => ({
          name: cat.name,
          value: cat.name,
          icon: cat.icon || '📌',
        })),
      ];
    },
  });

  return { categories, isLoading };
};

export const useFeaturedEvents = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => fetchEventsData(true, 6),
  });

  return { events, isLoading };
};
