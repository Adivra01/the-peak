import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, Smartphone, Clock, ExternalLink } from 'lucide-react';

const OrangeMoneyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const qrCode = searchParams.get('qr');
  const reference = searchParams.get('ref');
  const amount = searchParams.get('amount');
  const deepLinkMaxit = searchParams.get('maxit');
  const deepLinkOm = searchParams.get('om');
  
  const [countdown, setCountdown] = useState(300); // 5 minutes validity

  useEffect(() => {
    if (!qrCode || !reference) {
      navigate('/events');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCode, reference, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!qrCode || !reference) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              countdown < 60 ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-600'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(countdown)}</span>
              <span className="text-sm">restant</span>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Paiement Orange Money
            </h1>
            <p className="text-3xl font-bold text-amber-500">
              {parseInt(amount || '0').toLocaleString()} FCFA
            </p>
          </motion.div>

          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 shadow-card mb-6"
          >
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scannez ce QR code avec l'application Orange Money
            </p>
            <img 
              src={qrCode} 
              alt="QR Code Orange Money" 
              className="w-full max-w-[280px] mx-auto rounded-lg"
            />
          </motion.div>

          {/* Deep Links */}
          {(deepLinkMaxit || deepLinkOm) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-6"
            >
              <p className="text-sm text-center text-muted-foreground">
                Ou ouvrez directement l'application :
              </p>
              <div className="grid grid-cols-2 gap-3">
                {deepLinkMaxit && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(deepLinkMaxit, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Maxit
                  </Button>
                )}
                {deepLinkOm && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(deepLinkOm, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Orange Money
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-secondary/50 rounded-xl p-4 mb-6"
          >
            <h3 className="font-semibold text-foreground text-center mb-3">
              Comment payer ?
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-xs">1</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ouvrez l'application Orange Money ou Maxit
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-xs">2</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scannez le QR code ci-dessus
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-xs">3</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Confirmez le paiement avec votre code PIN
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-xs">4</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Votre billet sera généré automatiquement
                </p>
              </div>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center mb-6"
          >
            <p className="text-sm text-primary">
              Après le paiement, vous recevrez votre billet avec le QR code à présenter à l'entrée
            </p>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/events')}
            >
              Retour aux événements
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OrangeMoneyPayment;
