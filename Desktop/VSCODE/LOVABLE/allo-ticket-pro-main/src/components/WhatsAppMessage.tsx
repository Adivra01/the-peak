import { Ticket } from '@/types/event';
import { MessageCircle, Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatsAppMessageProps {
  ticket: Ticket;
}

const WhatsAppMessage = ({ ticket }: WhatsAppMessageProps) => {
  const formattedDate = new Date(ticket.event_date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0B141A] rounded-2xl p-4 max-w-md mx-auto"
    >
      {/* WhatsApp Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#2A373F]">
        <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Allô Ticket Pro</p>
          <p className="text-xs text-muted-foreground">Confirmation de réservation</p>
        </div>
      </div>

      {/* Message Bubble */}
      <div className="bg-[#005C4B] rounded-2xl rounded-tl-sm p-4 relative">
        <p className="text-foreground leading-relaxed">
          🎟️ Votre ticket <span className="font-bold">{ticket.ticket_type}</span> – <span className="font-bold">{ticket.price.toLocaleString()} FCFA</span> pour <span className="font-bold">{ticket.event_name}</span> a été généré avec succès.
        </p>
        <p className="text-foreground mt-3">
          📅 Date : <span className="font-semibold">{formattedDate}</span>
        </p>
        <p className="text-foreground mt-1">
          📍 Lieu : <span className="font-semibold">{ticket.event_location}</span>
        </p>
        <p className="text-foreground mt-3">
          🔐 QR Code inclus
        </p>
        <p className="text-foreground mt-3 text-sm">
          Présentez ce ticket à l'entrée de l'événement. À bientôt ! 🎉
        </p>
        
        {/* Message Time */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-xs text-foreground/70">{currentTime}</span>
          <CheckCheck className="w-4 h-4 text-blue-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppMessage;
