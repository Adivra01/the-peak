import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Paiement annulé
            </h1>
            <p className="text-muted-foreground mb-8">
              Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
            </p>

            {reference && (
              <p className="text-xs text-muted-foreground mb-6">
                Référence: {reference}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="gold" 
                className="gap-2"
                onClick={() => navigate(-1)}
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => navigate('/events')}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux événements
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCancel;
