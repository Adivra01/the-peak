import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event;
  index?: number;
}

const categoryColors: Record<string, string> = {
  'Conférence': 'bg-primary',
  'Salon': 'bg-rose',
  'Gastronomie': 'bg-amber',
  'Sport': 'bg-teal',
  'Art & Culture': 'bg-copper',
  'Famille': 'bg-gold',
  'Festival': 'bg-primary',
  'Concert': 'bg-accent',
  'Soirée': 'bg-rose',
  'Culture': 'bg-copper',
};

const EventCard = ({ event, index = 0 }: EventCardProps) => {
  const lowestPrice = Math.min(...event.ticketTypes.map(t => t.price));
  const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const categoryColor = categoryColors[event.category] || 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/event/${event.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 border border-border/50">
          {/* Image */}
          <div className="relative h-52 overflow-hidden">
            <img 
              src={event.image} 
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1.5 ${categoryColor} text-primary-foreground text-xs font-semibold rounded-full shadow-soft`}
              >
                {event.category}
              </motion.span>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-4 left-4">
              <span className="px-4 py-2 bg-card/95 backdrop-blur-sm text-foreground text-sm font-bold rounded-xl shadow-soft">
                À partir de {lowestPrice.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {event.name}
            </h3>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {event.description}
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formattedDate} à {event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-teal" />
                <span>{event.organizer}</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
            >
              Voir les détails
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
