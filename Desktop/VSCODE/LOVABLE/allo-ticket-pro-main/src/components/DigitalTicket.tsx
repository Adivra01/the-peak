import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';
import logo from '@/assets/logo-allo-ticket-pro.png';
import { Ticket as TicketType } from '@/types/event';
import { Calendar, MapPin, User, Hash, Clock, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';


interface DigitalTicketProps {
  ticket: TicketType;
  showDownloadWarning?: boolean;
}

const DigitalTicket = ({ ticket, showDownloadWarning = false }: DigitalTicketProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // QR contient uniquement le code brut — illisible par un téléphone standard
  const qrData = ticket.ticket_id;

  const formattedEventDate = new Date(ticket.event_date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedReservationDate = new Date(ticket.reservation_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isVIP = ticket.ticket_type.toLowerCase().includes('vip') || 
                ticket.ticket_type.toLowerCase().includes('platinum') ||
                ticket.ticket_type.toLowerCase().includes('gold');

  const downloadTicket = async () => {
    setIsDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = ticketRef.current;
      if (!el) throw new Error('Ticket element not found');

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `billet-${ticket.ticket_id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsDownloaded(true);
    } catch (error) {
      console.error('Error downloading ticket:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Ticket Card */}
      <div
        ref={ticketRef}
        className="rounded-2xl overflow-hidden shadow-elevated"
        style={{
          background: isVIP
            ? 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)'
        }}
      >
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <span
                className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-2"
                style={{
                  background: isVIP
                    ? 'linear-gradient(135deg, #d4a017, #f0c040)'
                    : 'rgba(255,255,255,0.15)',
                  color: isVIP ? '#1a1a2e' : '#ffffff'
                }}
              >
                {ticket.ticket_type}
              </span>
              <h2
                className="text-xl font-bold leading-tight"
                style={{ color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {ticket.event_name}
              </h2>
            </div>
            <div className="text-right ml-3 flex-shrink-0">
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Prix</p>
              <p
                className="text-2xl font-bold"
                style={{ color: isVIP ? '#f0c040' : '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {ticket.price.toLocaleString()}
              </p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>FCFA</p>
            </div>
          </div>

          <div className="flex justify-center py-1">
            <img src={logo} alt="Allô Ticket Pro" className="h-7" />
          </div>
        </div>

        {/* Perforation divider */}
        <div className="relative py-1">
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-10 rounded-r-full"
            style={{ background: 'hsl(var(--background))' }}
          />
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-10 rounded-l-full"
            style={{ background: 'hsl(var(--background))' }}
          />
          <div className="mx-7" style={{ borderTop: '2px dashed rgba(255,255,255,0.2)' }} />
        </div>

        {/* Details */}
        <div className="p-5 pt-3">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <DetailItem icon={<User className="w-3.5 h-3.5" />} label="Titulaire" value={`${ticket.customer_firstname} ${ticket.customer_name}`} />
            <DetailItem icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={formattedEventDate} />
            <DetailItem icon={<Clock className="w-3.5 h-3.5" />} label="Heure" value={ticket.event_time} />
            <DetailItem icon={<MapPin className="w-3.5 h-3.5" />} label="Lieu" value={ticket.event_location} />
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG 
                value={qrData}
                size={150}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Scannable uniquement par l'application officielle
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between mt-4 pt-3 text-[11px]"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
          >
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span className="font-mono">{ticket.ticket_id}</span>
            </div>
            <span>Réservé le {formattedReservationDate}</span>
          </div>
        </div>
      </div>

      {/* Urgent Download Warning Banner */}
      {!isDownloaded && (
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0)',
              '0 0 20px 4px rgba(239, 68, 68, 0.5)',
              '0 0 0 0 rgba(239, 68, 68, 0)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-xl overflow-hidden"
        >
          <div className="bg-red-600 p-4 text-white text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <span className="font-bold text-sm uppercase tracking-wider">
                ⚠️ TÉLÉCHARGEMENT OBLIGATOIRE
              </span>
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <p className="text-xs text-red-100">
              Téléchargez votre billet maintenant. Il ne sera plus accessible après fermeture de cette page !
            </p>
          </div>
        </motion.div>
      )}

      {/* Download Button */}
      <Button 
        onClick={downloadTicket}
        disabled={isDownloading}
        className={`w-full py-6 text-base gap-2 ${
          isDownloaded 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
        }`}
      >
        {isDownloading ? (
          <>
            <Download className="w-5 h-5 animate-spin" />
            Téléchargement...
          </>
        ) : isDownloaded ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Billet téléchargé ✓
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            ⚠️ Télécharger mon billet MAINTENANT
          </>
        )}
      </Button>

      {isDownloaded && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-green-700">
            Votre billet est prêt ! Présentez-le à l'entrée.
          </p>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-2">
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
      <p className="text-sm font-medium capitalize" style={{ color: '#ffffff' }}>{value}</p>
    </div>
  </div>
);

export default DigitalTicket;
