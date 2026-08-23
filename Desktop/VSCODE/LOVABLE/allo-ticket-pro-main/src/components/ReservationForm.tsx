import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, ReservationForm as FormData } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Loader2, Ticket as TicketIcon, ShieldCheck, Percent, CheckCircle2, Clock } from 'lucide-react';

const fmtTime = (t: string) => t.slice(0, 5).replace(':', 'h');
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface ReservationFormProps {
  event: Event;
  onPaymentInitiated?: () => void;
}

const ReservationForm = ({ event, onPaymentInitiated }: ReservationFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ticketType: event.ticketTypes[0]?.id || ''
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountVerified, setDiscountVerified] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const selectedTicket = event.ticketTypes.find(t => t.id === formData.ticketType);
  const originalPrice = (selectedTicket?.clientPrice ?? selectedTicket?.price) || 0;
  const ticketFees = selectedTicket?.fees || 0;
  const priceWithFees = originalPrice + ticketFees;
  const discountAmount = Math.round(priceWithFees * discountPercentage / 100);
  const finalPrice = priceWithFees - discountAmount;

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      newErrors.phone = 'Téléphone invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const verifyDiscount = async () => {
    if (!discountCode.trim()) return;
    setVerifyingCode(true);

    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', discountCode.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast({ title: 'Code invalide', description: 'Ce code de réduction n\'existe pas ou est inactif.', variant: 'destructive' });
      setDiscountPercentage(0);
      setDiscountVerified(false);
    } else {
      // Check max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast({ title: 'Code épuisé', description: 'Ce code a atteint son nombre maximum d\'utilisations.', variant: 'destructive' });
        setDiscountPercentage(0);
        setDiscountVerified(false);
      }
      // Check expiration
      else if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast({ title: 'Code expiré', description: 'Ce code de réduction a expiré.', variant: 'destructive' });
        setDiscountPercentage(0);
        setDiscountVerified(false);
      }
      // Check event restriction
      else if (data.event_id && data.event_id !== event.id) {
        toast({ title: 'Code invalide', description: 'Ce code n\'est pas valable pour cet événement.', variant: 'destructive' });
        setDiscountPercentage(0);
        setDiscountVerified(false);
      } else {
        setDiscountPercentage(data.percentage);
        setDiscountVerified(true);
        toast({ title: `Réduction de ${data.percentage}% appliquée !`, description: data.percentage === 100 ? 'Billet gratuit !' : `Vous économisez ${Math.round(priceWithFees * data.percentage / 100).toLocaleString()} FCFA` });
      }
    }
    setVerifyingCode(false);
  };

  const handleFreeTicket = async () => {
    if (!selectedTicket) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-free-ticket', {
        body: {
          event_id: event.id,
          ticket_type_id: selectedTicket.id,
          customer_first_name: formData.firstName,
          customer_last_name: formData.lastName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          discount_code: discountCode.trim().toUpperCase(),
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Échec de la génération du billet');

      toast({ title: 'Billet réservé !', description: 'Votre billet gratuit a été généré et envoyé par email.' });
      navigate(`/payment/success?free=true&code=${encodeURIComponent(data.ticket_code)}`);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedTicket) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-bictorys-payment', {
        body: {
          amount: finalPrice,
          customer_phone: formData.phone,
          customer_email: formData.email,
          customer_first_name: formData.firstName,
          customer_last_name: formData.lastName,
          event_id: event.id,
          ticket_type_id: selectedTicket.id,
          event_name: event.name,
          ticket_type_name: selectedTicket.name,
          discount_code: discountVerified ? discountCode.trim().toUpperCase() : null,
          discount_percentage: discountVerified ? discountPercentage : 0,
        },
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Échec de création du paiement');

      onPaymentInitiated?.();

      if (data.data.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        throw new Error('Aucun lien de paiement reçu de Bictorys');
      }

    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Erreur de paiement',
        description: err instanceof Error ? err.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-card rounded-2xl p-6 shadow-card">
      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className="text-sm font-medium hidden sm:inline">Informations</span>
        </div>
        <div className="flex-1 h-0.5 bg-secondary">
          <div className={`h-full bg-primary transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}>
            {step > 2 ? <Check className="w-4 h-4" /> : '2'}
          </div>
          <span className="text-sm font-medium hidden sm:inline">Paiement</span>
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display text-xl font-bold text-foreground mb-4">
            Vos informations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" className={errors.firstName ? 'border-destructive' : ''} />
              {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" className={errors.lastName ? 'border-destructive' : ''} />
              {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+221 77 123 45 67" className={errors.phone ? 'border-destructive' : ''} />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
          </div>

          <Button variant="gold" className="w-full mt-6" onClick={handleNextStep}>
            Continuer
          </Button>
        </motion.div>
      )}

      {/* Step 2: Ticket Selection & Payment */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display text-xl font-bold text-foreground mb-4">
            Choisissez votre billet
          </h3>

          <RadioGroup
            value={formData.ticketType}
            onValueChange={(value) => { setFormData({ ...formData, ticketType: value }); setDiscountVerified(false); setDiscountPercentage(0); setDiscountCode(''); }}
            className="space-y-3"
          >
            {event.ticketTypes.map((ticket) => {
              const isVIP = ticket.name.toLowerCase().includes('vip') || 
                           ticket.name.toLowerCase().includes('platinum') ||
                           ticket.name.toLowerCase().includes('gold');
              return (
                <Label
                  key={ticket.id}
                  htmlFor={ticket.id}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    formData.ticketType === ticket.id
                      ? isVIP 
                        ? 'bg-gradient-vip shadow-gold' 
                        : 'bg-primary/20 border-2 border-primary'
                      : 'bg-secondary hover:bg-secondary/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={ticket.id} id={ticket.id} className="sr-only" />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isVIP ? 'bg-background/20' : 'bg-primary/20'
                    }`}>
                      <TicketIcon className={`w-5 h-5 ${
                        formData.ticketType === ticket.id && isVIP 
                          ? 'text-primary-foreground' 
                          : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        formData.ticketType === ticket.id && isVIP
                          ? 'text-primary-foreground'
                          : 'text-foreground'
                      }`}>
                        {ticket.name}
                      </p>
                      {ticket.startTime && ticket.endTime && (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                          formData.ticketType === ticket.id && isVIP
                            ? 'bg-background/20 text-primary-foreground'
                            : 'bg-primary/15 text-primary'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {fmtTime(ticket.startTime)} → {fmtTime(ticket.endTime)}
                        </span>
                      )}
                      {ticket.description && (
                        <p className={`text-sm mt-0.5 ${
                          formData.ticketType === ticket.id && isVIP
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`text-right ${
                    formData.ticketType === ticket.id && isVIP 
                      ? 'text-primary-foreground' 
                      : 'text-foreground'
                  }`}>
                    <p className="font-display text-xl font-bold">
                      {((ticket.clientPrice ?? ticket.price) + (ticket.fees || 0)).toLocaleString()}
                    </p>
                    <p className="text-xs opacity-70">FCFA</p>
                    {(ticket.fees || 0) > 0 && (
                      <p className="text-xs opacity-60">dont {ticket.fees.toLocaleString()} frais</p>
                    )}
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          {/* Discount Code */}
          <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
            <Label className="flex items-center gap-2"><Percent className="w-4 h-4 text-primary" />Code de réduction</Label>
            <div className="flex gap-2">
              <Input
                value={discountCode}
                onChange={e => { setDiscountCode(e.target.value); setDiscountVerified(false); setDiscountPercentage(0); }}
                placeholder="Ex: PROMO50"
                className="flex-1"
                disabled={discountVerified}
              />
              {discountVerified ? (
                <Button variant="outline" size="sm" onClick={() => { setDiscountCode(''); setDiscountVerified(false); setDiscountPercentage(0); }}>
                  Retirer
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={verifyDiscount} disabled={verifyingCode || !discountCode.trim()}>
                  {verifyingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
                </Button>
              )}
            </div>
            {discountVerified && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span>Réduction de {discountPercentage}% appliquée{discountPercentage === 100 ? ' — Billet gratuit !' : ''}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedTicket && (
            <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Type de billet</span>
                <div className="text-right">
                  <span className="font-semibold text-foreground">{selectedTicket.name}</span>
                  {selectedTicket.startTime && selectedTicket.endTime && (
                    <p className="text-xs text-primary mt-0.5 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {fmtTime(selectedTicket.startTime)} → {fmtTime(selectedTicket.endTime)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-muted-foreground">Prix du billet</span>
                <span className="text-foreground">{originalPrice.toLocaleString()} FCFA</span>
              </div>
              {ticketFees > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted-foreground">Frais</span>
                  <span className="text-foreground">{ticketFees.toLocaleString()} FCFA</span>
                </div>
              )}
              {discountVerified && discountPercentage > 0 && (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="text-muted-foreground line-through">{priceWithFees.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-primary">Réduction ({discountPercentage}%)</span>
                    <span className="text-primary font-semibold">-{discountAmount.toLocaleString()} FCFA</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Total à payer</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {finalPrice.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={isProcessing}>
              Retour
            </Button>
            {finalPrice === 0 && discountVerified ? (
              <Button 
                variant="gold" 
                onClick={handleFreeTicket} 
                className="flex-1 gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Génération...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" />Obtenir mon billet gratuit</>
                )}
              </Button>
            ) : (
              <Button 
                variant="gold" 
                onClick={handlePayment} 
                className="flex-1 gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Redirection...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" />Payer {finalPrice.toLocaleString()} FCFA</>
                )}
              </Button>
            )}
          </div>

          <div className="mt-4 p-3 rounded-lg border bg-primary/5 border-primary/20">
            <p className="text-xs text-center text-muted-foreground">
              🔒 {finalPrice === 0 && discountVerified 
                ? 'Votre billet sera généré immédiatement' 
                : 'Vous serez redirigé vers la page sécurisée Bictorys pour choisir votre mode de paiement (Wave, Orange Money, Carte bancaire)'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReservationForm;
