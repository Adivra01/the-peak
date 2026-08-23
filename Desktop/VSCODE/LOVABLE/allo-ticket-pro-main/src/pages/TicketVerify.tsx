import Header from '@/components/Header';
import { ShieldAlert } from 'lucide-react';

const TicketVerify = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center px-6 max-w-md">
          <ShieldAlert className="w-20 h-20 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">
            Accès non autorisé
          </h1>
          <p className="text-muted-foreground mb-4">
            La vérification des billets est réservée exclusivement aux contrôleurs via l'application officielle de scan.
          </p>
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <p className="text-sm font-semibold text-destructive">
              🔒 Ce billet ne peut pas être vérifié depuis un navigateur ou un téléphone standard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketVerify;
