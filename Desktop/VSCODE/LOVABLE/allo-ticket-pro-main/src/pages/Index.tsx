import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Sparkles, Ticket, Star, Shield, Zap, Users, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { useFeaturedEvents, useCategories } from '@/hooks/useEvents';
import HeroSlider from '@/components/HeroSlider';
import TicketShowcase from '@/components/TicketShowcase';
import logo from '@/assets/logo-allo-ticket-pro.png';

const Index = () => {
  const { events: featuredEvents, isLoading: isLoadingEvents } = useFeaturedEvents();
  const { categories, isLoading: isLoadingCategories } = useCategories();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Get slides for HeroSlider from featured events
  const heroSlides = featuredEvents.length > 0
    ? featuredEvents.slice(0, 5).map((e) => ({
        src: e.image,
        alt: `Photo de l'événement ${e.name}`,
        label: e.category,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Top slider section (tous les événements) */}
      <section className="pt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="rounded-3xl border border-border bg-card shadow-soft"
          >
            <div className="flex flex-col gap-3 px-6 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold tracking-[0.22em] text-muted-foreground">EN CE MOMENT</div>
                <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Événements en vedette</h2>
              </div>
              <div className="text-xs text-muted-foreground">Défilement automatique toutes les 5 secondes</div>
            </div>

            <div className="px-6 pb-6 pt-4">
              {isLoadingEvents ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : heroSlides.length > 0 ? (
                <HeroSlider
                  intervalMs={5000}
                  aspectClassName="aspect-[16/7]"
                  slides={heroSlides}
                />
              ) : (
                <div className="aspect-[16/7] bg-secondary/50 rounded-3xl flex items-center justify-center">
                  <p className="text-muted-foreground">Aucun événement à afficher</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero pt-24">
        <div className="absolute inset-0 pattern-grid opacity-40" />

        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Billetterie simple & rapide</span>
              </div>

              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Trouvez des événements incroyables
                <span className="block">
                  dans votre <span className="underline decoration-border underline-offset-8">ville</span>.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Conférences, salons, sport, art, gastronomie… Parcourez, réservez, et recevez un ticket digital avec QR code.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/events">
                  <Button variant="default" size="lg" className="w-full sm:w-auto">
                    Explorer les événements
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/my-tickets">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Ticket className="h-5 w-5" />
                    Mes billets
                  </Button>
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
                {[{ value: '500+', label: 'Événements', icon: Calendar }, { value: '50K+', label: 'Billets', icon: Ticket }, { value: '98%', label: 'Satisfaction', icon: Star }].map(
                  (stat, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card px-4 py-4 shadow-soft">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-4 w-4 text-primary" />
                        <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  )
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="lg:col-span-5"
            >
              <TicketShowcase />
            </motion.div>
          </div>
        </div>

        <div className="h-16" />
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl font-bold mb-3">
              Explorez par <span className="text-gradient-gold">catégorie</span>
            </h2>
            <p className="text-muted-foreground">
              Trouvez l'événement parfait selon vos centres d'intérêt
            </p>
          </motion.div>

          {isLoadingCategories ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3"
            >
              {categories.filter(c => c.value !== 'all').map((category, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Link to="/events">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-full shadow-soft hover:shadow-card hover:border-primary/30 transition-all"
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-foreground">{category.name}</span>
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
          >
            <div>
              <h2 className="font-display text-4xl font-bold mb-3">
                Événements à la <span className="text-gradient-gold">Une</span>
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Ne manquez pas ces événements exceptionnels. Réservez dès maintenant 
                pour garantir votre place.
              </p>
            </div>
            <Link to="/events" className="mt-4 md:mt-0">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary">
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {isLoadingEvents ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Aucun événement disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              Comment ça <span className="text-gradient-gold">marche</span> ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Réservez vos billets en 3 étapes simples
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            {[
              {
                step: '01',
                icon: Calendar,
                title: 'Choisissez',
                description: 'Parcourez notre sélection d\'événements et trouvez celui qui vous correspond.',
                color: 'bg-primary'
              },
              {
                step: '02',
                icon: Ticket,
                title: 'Réservez',
                description: 'Sélectionnez vos places et validez votre réservation en quelques clics.',
                color: 'bg-accent'
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Profitez',
                description: 'Recevez votre billet digital avec QR code et présentez-le à l\'entrée.',
                color: 'bg-teal'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-card p-8 rounded-3xl shadow-card border border-border/50 text-center hover:shadow-elevated transition-all hover:-translate-y-1">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${item.color} flex items-center justify-center shadow-soft`}
                  >
                    <item.icon className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                  <span className="text-sm font-bold text-primary mb-2 block">Étape {item.step}</span>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              Pourquoi <span className="text-gradient-gold">Allô Ticket Pro</span> ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              La plateforme de confiance pour tous vos événements
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'Réservation rapide',
                description: 'Réservez en moins de 2 minutes avec notre processus simplifié.',
                gradient: 'from-primary to-primary/60'
              },
              {
                icon: Shield,
                title: 'Paiement sécurisé',
                description: 'Transactions protégées et données personnelles sécurisées.',
                gradient: 'from-teal to-teal/60'
              },
              {
                icon: Ticket,
                title: 'Billet digital',
                description: 'QR code unique directement sur votre téléphone.',
                gradient: 'from-accent to-accent/60'
              },
              {
                icon: Users,
                title: 'Support 24/7',
                description: 'Une équipe disponible pour vous accompagner.',
                gradient: 'from-rose to-rose/60'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border/50 h-full hover:shadow-card transition-all">
                  <div className={`w-14 h-14 mb-5 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              Ce qu'ils <span className="text-gradient-gold">disent</span>
            </h2>
            <p className="text-muted-foreground">
              Des milliers de clients satisfaits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Fatou Diallo',
                role: 'Entrepreneuse',
                content: 'J\'ai réservé mes billets pour le Tech Summit en quelques minutes. Le QR code fonctionne parfaitement !',
                avatar: '👩🏾'
              },
              {
                name: 'Moussa Ndiaye',
                role: 'Étudiant',
                content: 'Enfin une plateforme simple et moderne pour les événements au Sénégal. Je recommande à 100% !',
                avatar: '👨🏾'
              },
              {
                name: 'Aïssatou Sarr',
                role: 'Organisatrice',
                content: 'En tant qu\'organisatrice, Allô Ticket Pro m\'a simplifié la gestion des billets. Interface intuitive et support réactif.',
                avatar: '👩🏾‍💼'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{testimonial.avatar}</span>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-vip rounded-3xl p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0 pattern-grid opacity-20" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                  Prêt à découvrir les meilleurs événements ?
                </h2>
                <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
                  Rejoignez des milliers de passionnés et ne manquez plus jamais un événement.
                </p>
                <Link to="/events">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Commencer maintenant
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img src={logo} alt="Allô Ticket Pro" className="h-10 mb-4" />
              <p className="text-muted-foreground max-w-sm">
                La plateforme de billetterie moderne pour tous vos événements au Sénégal et en Afrique de l'Ouest.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-foreground mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link></li>
                <li><Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">Événements</Link></li>
                <li><Link to="/my-tickets" className="text-muted-foreground hover:text-primary transition-colors">Mes billets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>contact@alloticketpro.com</li>
                <li>+221 77 123 45 67</li>
                <li>Dakar, Sénégal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            © 2026 Allô Ticket Pro. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
