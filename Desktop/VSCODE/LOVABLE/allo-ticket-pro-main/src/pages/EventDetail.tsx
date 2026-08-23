import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvents';
import Header from '@/components/Header';
import ReservationForm from '@/components/ReservationForm';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Ticket, Share2, Loader2 } from 'lucide-react';
import { useState } from 'react';

const fmtTime = (t: string) => t.slice(0, 5).replace(':', 'h');

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, isLoading, error } = useEvent(id);
  const [showReservation, setShowReservation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Événement non trouvé
          </h1>
          <Button variant="outline" onClick={() => navigate('/events')}>
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  const handlePaymentInitiated = () => {
    // User is being redirected to Wave payment
    setShowReservation(false);
  };

  const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const lowestPrice = event.ticketTypes.length > 0 
    ? Math.min(...event.ticketTypes.map(t => t.price + (t.fees || 0)))
    : 0;

  // Check if event date has passed
  // L'événement expire à minuit (fin du jour de l'événement)
  const eventDate = new Date(event.date + 'T23:59:59');
  const isExpired = eventDate < new Date();

  // Event gallery images
  const allImages = [
    event.image,
    ...event.gallery,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[400px]">
          <img 
            src={allImages[selectedImage] || event.image || '/placeholder.svg'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <Button 
                variant="glass" 
                size="sm" 
                onClick={() => navigate('/events')}
                className="mb-4 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-card rounded-2xl p-6 shadow-card"
              >
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-full mb-4">
                  {event.category}
                </span>
                
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  {event.name}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="capitalize">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  {event.organizer && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-5 h-5 text-primary" />
                      <span>{event.organizer}</span>
                    </div>
                  )}
                </div>

                <p className="text-foreground/80 leading-relaxed">
                  {event.description}
                </p>
              </motion.div>

              {/* Gallery */}
              {allImages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-card rounded-2xl p-6 shadow-card"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Galerie
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-xl overflow-hidden transition-all ${
                          selectedImage === index 
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Video Player - always shown if a video exists */}
              {event.video && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-gradient-card rounded-2xl p-6 shadow-card"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Vidéo de présentation
                  </h2>
                  <video
                    src={event.video}
                    controls
                    playsInline
                    preload="metadata"
                    poster={event.image}
                    controlsList="nodownload"
                    className="w-full rounded-xl bg-black aspect-video object-contain"
                  >
                    Votre navigateur ne prend pas en charge la lecture vidéo.
                  </video>
                </motion.div>
              )}

              {/* Ticket Types */}
              {event.ticketTypes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-card rounded-2xl p-6 shadow-card"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Types de billets
                  </h2>
                  <div className="space-y-3">
                    {event.ticketTypes.map((ticket) => {
                      const isVIP = ticket.name.toLowerCase().includes('vip') ||
                                   ticket.name.toLowerCase().includes('platinum') ||
                                   ticket.name.toLowerCase().includes('gold');
                      const hasSlot = ticket.startTime && ticket.endTime;
                      return (
                        <div
                          key={ticket.id}
                          className={`p-4 rounded-xl flex items-center justify-between gap-3 ${
                            isVIP ? 'bg-gradient-vip' : 'bg-secondary'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isVIP ? 'bg-background/20' : 'bg-primary/20'
                            }`}>
                              <Ticket className={`w-5 h-5 ${isVIP ? 'text-primary-foreground' : 'text-primary'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-semibold ${isVIP ? 'text-primary-foreground' : 'text-foreground'}`}>
                                {ticket.name}
                              </p>
                              {hasSlot && (
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${isVIP ? 'bg-background/20 text-primary-foreground' : 'bg-primary/15 text-primary'}`}>
                                  <Clock className="w-3 h-3" />
                                  {fmtTime(ticket.startTime!)} → {fmtTime(ticket.endTime!)}
                                </span>
                              )}
                              {ticket.description && (
                                <p className={`text-sm mt-0.5 ${isVIP ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                  {ticket.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`text-right shrink-0 ${isVIP ? 'text-primary-foreground' : 'text-foreground'}`}>
                            <p className="font-display text-xl font-bold">
                              {(ticket.price + (ticket.fees || 0)).toLocaleString()}
                            </p>
                            <p className="text-xs opacity-70">FCFA</p>
                            {(ticket.fees || 0) > 0 && (
                              <p className="text-xs opacity-60">dont {ticket.fees.toLocaleString()} frais</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-card rounded-2xl p-6 shadow-card sticky top-24"
              >
                {event.ticketTypes.length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-muted-foreground text-sm mb-1">À partir de</p>
                      <p className="font-display text-4xl font-bold text-gradient-gold">
                        {lowestPrice.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">FCFA</p>
                    </div>

                    {isExpired ? (
                      <div className="text-center py-4 px-3 rounded-xl bg-destructive/10 border border-destructive/20">
                        <p className="text-destructive font-semibold text-sm">
                          ⛔ Cet événement est passé. Les réservations sont fermées.
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence mode="wait">
                        {!showReservation && (
                          <motion.div
                            key="buttons"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Button 
                              variant="gold" 
                              className="w-full mb-3"
                              onClick={() => setShowReservation(true)}
                            >
                              Réserver maintenant
                            </Button>
                            <Button variant="outline" className="w-full gap-2">
                              <Share2 className="w-4 h-4" />
                              Partager
                            </Button>
                          </motion.div>
                        )}

                        {showReservation && (
                          <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <ReservationForm 
                              event={event} 
                              onPaymentInitiated={handlePaymentInitiated} 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Aucun billet disponible pour cet événement.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
