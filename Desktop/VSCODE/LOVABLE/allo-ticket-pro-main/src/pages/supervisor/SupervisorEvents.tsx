import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SupervEvent {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_public: boolean;
  capacity: number;
  sold: number;
}

const SupervisorEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SupervEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data: assignments } = await supabase
          .from('event_supervisors')
          .select('event_id')
          .eq('supervisor_id', user.id);

        const eventIds = (assignments || []).map((a: any) => a.event_id);
        if (eventIds.length === 0) { setIsLoading(false); return; }

        const [{ data: eventsData }, { data: ticketTypes }, { data: tickets }] = await Promise.all([
          supabase.from('events').select('id, name, event_date, event_time, location, is_public').in('id', eventIds).order('event_date', { ascending: true }),
          supabase.from('ticket_types').select('event_id, quantity_available').in('event_id', eventIds),
          supabase.from('tickets').select('event_id').in('event_id', eventIds),
        ]);

        const capacityMap = new Map<string, number>();
        const soldMap = new Map<string, number>();
        eventIds.forEach(id => { capacityMap.set(id, 0); soldMap.set(id, 0); });
        (ticketTypes || []).forEach((tt: any) => capacityMap.set(tt.event_id, (capacityMap.get(tt.event_id) || 0) + tt.quantity_available));
        (tickets || []).forEach((t: any) => soldMap.set(t.event_id, (soldMap.get(t.event_id) || 0) + 1));

        setEvents((eventsData || []).map((ev: any) => ({
          ...ev,
          capacity: capacityMap.get(ev.id) || 0,
          sold: soldMap.get(ev.id) || 0,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Mes événements</h1>
        <p className="text-muted-foreground mt-1">{events.length} événement{events.length !== 1 ? 's' : ''} supervisé{events.length !== 1 ? 's' : ''}</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">Aucun événement supervisé pour le moment.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((ev, i) => {
            const isPast = new Date(ev.event_date) < new Date();
            const remaining = ev.capacity - ev.sold;
            const fillPct = ev.capacity > 0 ? Math.round((ev.sold / ev.capacity) * 100) : 0;

            return (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="shadow-soft hover:shadow-card transition-all duration-200 hover:-translate-y-0.5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground">{ev.name}</h3>
                          <Badge variant={ev.is_public ? 'default' : 'secondary'} className="text-xs">{ev.is_public ? 'Public' : 'Privé'}</Badge>
                          {isPast && <Badge variant="outline" className="text-xs text-muted-foreground">Terminé</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(ev.event_date), 'dd MMMM yyyy', { locale: fr })}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{ev.event_time.slice(0, 5)}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <div className="text-center bg-secondary/40 rounded-lg px-3 py-2 min-w-[60px]">
                          <p className="text-base font-bold">{ev.capacity}</p>
                          <p className="text-xs text-muted-foreground">Capacité</p>
                        </div>
                        <div className="text-center bg-secondary/40 rounded-lg px-3 py-2 min-w-[60px]">
                          <p className="text-base font-bold text-primary">{ev.sold}</p>
                          <p className="text-xs text-muted-foreground">Vendus</p>
                        </div>
                        <div className="text-center bg-secondary/40 rounded-lg px-3 py-2 min-w-[60px]">
                          <p className={`text-base font-bold ${remaining === 0 ? 'text-destructive' : remaining / ev.capacity < 0.2 ? 'text-orange-500' : 'text-green-600'}`}>{remaining}</p>
                          <p className="text-xs text-muted-foreground">Restants</p>
                        </div>
                      </div>
                    </div>

                    {ev.capacity > 0 && (
                      <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fillPct >= 90 ? 'bg-destructive' : fillPct >= 70 ? 'bg-orange-500' : 'bg-primary'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{fillPct}% de remplissage</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupervisorEvents;
