import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Loader2, Shield, Calendar, MapPin, User, Ticket as TicketIcon } from 'lucide-react';

interface TicketInfo {
  ticket_code: string;
  event_name: string;
  event_date: string;
  event_time: string;
  event_location: string;
  ticket_type: string;
  price: number;
  customer_name: string;
  customer_phone: string;
  status: string;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  ticket_info?: TicketInfo;
  used_at?: string;
}

const ScanTicket = () => {
  const [qrInput, setQrInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateTicket = async (action: 'mark_used' | undefined = 'mark_used') => {
    if (!qrInput.trim()) return;
    
    setIsValidating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-ticket', {
        body: { qr_data: qrInput.trim(), action },
      });

      if (error) throw new Error(error.message);
      setResult(data);
    } catch (err) {
      setResult({
        valid: false,
        message: err instanceof Error ? err.message : 'Erreur de validation',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const resetScan = () => {
    setQrInput('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Contrôle d'accès
            </h1>
            <p className="text-muted-foreground">
              Scannez ou collez les données du QR code pour vérifier et valider immédiatement le billet
            </p>
          </div>

          {/* Input */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Collez les données du QR code ici..."
                  className="pl-10 py-6 text-base"
                />
              </div>
              <Button
                onClick={() => validateTicket()}
                disabled={!qrInput.trim() || isValidating}
                className="w-full py-6 text-lg"
              >
                {isValidating ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Vérification...</>
                ) : (
                  <><QrCode className="w-5 h-5 mr-2" /> Vérifier le billet</>
                )}
              </Button>
            </motion.div>
          )}

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Status Banner */}
              <div className={`rounded-2xl p-6 text-center ${
                result.valid 
                  ? 'bg-green-500/10 border-2 border-green-500/30' 
                  : 'bg-destructive/10 border-2 border-destructive/30'
              }`}>
                {result.valid ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                ) : (
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
                )}
                <h2 className={`text-2xl font-bold mb-2 ${result.valid ? 'text-green-600' : 'text-destructive'}`}>
                  {result.valid ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ'}
                </h2>
                <p className="text-muted-foreground">{result.message}</p>
                {result.used_at && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Utilisé le : {new Date(result.used_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>

              {/* Ticket Details */}
              {result.ticket_info && (
                <div className="bg-card rounded-2xl p-6 border space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">Détails du billet</h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <TicketIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Code</p>
                        <p className="font-mono font-bold">{result.ticket_info.ticket_code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Événement</p>
                        <p className="font-medium">{result.ticket_info.event_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.ticket_info.event_date} à {result.ticket_info.event_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Lieu</p>
                        <p className="font-medium">{result.ticket_info.event_location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Titulaire</p>
                        <p className="font-medium">{result.ticket_info.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{result.ticket_info.customer_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TicketIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Type & Prix</p>
                        <p className="font-medium">{result.ticket_info.ticket_type} — {result.ticket_info.price?.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={resetScan} variant="outline" className="flex-1 py-6">
                  Nouveau scan
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanTicket;
