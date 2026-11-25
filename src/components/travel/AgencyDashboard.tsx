import { useState } from 'react';
import { Lock, Plus, Trash2, Pencil, Images, Users, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  createTrip, deleteTrip, makeId, removeRegistration, setSouvenirs, updateTrip, type Registration, type TravelState, type Trip,
} from '@/lib/trips';
import { checkPin, fileToDataUrl } from '@/lib/agency';

const emptyTrip = (): Trip => ({
  id: makeId('trip'), title: '', region: '', category: 'Culture & patrimoine', date: '', duration: '',
  price: 0, capacity: 12, registered: 0, places: [], hotels: [], itinerary: [], completed: false,
});

const amount = (value: number) => new Intl.NumberFormat('fr-TN').format(value);

type Draft = Trip & { placesText: string; hotelsText: string; itineraryText: string };

function toDraft(trip: Trip): Draft {
  return { ...trip, placesText: trip.places.join(', '), hotelsText: trip.hotels.join(', '), itineraryText: trip.itinerary.join('\n') };
}

function fromDraft(draft: Draft): Trip {
  return {
    id: draft.id, title: draft.title.trim(), region: draft.region.trim(), category: draft.category, date: draft.date.trim(),
    duration: draft.duration.trim(), price: Number(draft.price) || 0, capacity: Math.max(1, Number(draft.capacity) || 1),
    registered: Math.min(Number(draft.registered) || 0, Math.max(1, Number(draft.capacity) || 1)),
    places: draft.placesText.split(',').map((s) => s.trim()).filter(Boolean),
    hotels: draft.hotelsText.split(',').map((s) => s.trim()).filter(Boolean),
    itinerary: draft.itineraryText.split('\n').map((s) => s.trim()).filter(Boolean),
    completed: draft.completed, souvenirs: draft.souvenirs,
  };
}

export function AgencyDashboard({ open, onOpenChange, state, onMutate }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: TravelState;
  onMutate: (next: TravelState) => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [view, setView] = useState<'list' | 'edit' | 'souvenirs' | 'registrations'>('list');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [souvenirTripId, setSouvenirTripId] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [highlightsText, setHighlightsText] = useState('');
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);

  const reset = () => { setView('list'); setDraft(null); setSouvenirTripId(null); setPin(''); setPinError(''); setHighlightsText(''); setDraftPhotos([]); };

  const tryPin = (event: React.FormEvent) => {
    event.preventDefault();
    if (checkPin(pin)) { setUnlocked(true); setPinError(''); }
    else setPinError('Code incorrect. Réessayez.');
  };

  const startEdit = (trip: Trip) => { setDraft(toDraft({ ...trip })); setView('edit'); };
  const startAdd = () => { setDraft(toDraft(emptyTrip())); setView('edit'); };
  const saveDraft = () => {
    if (!draft) return;
    const trip = fromDraft(draft);
    const exists = state.trips.some((item) => item.id === trip.id);
    onMutate(exists ? updateTrip(state, trip.id, trip) : createTrip(state, trip));
    setDraft(null);
    setView('list');
  };
  const remove = (trip: Trip) => {
    if (window.confirm(`Supprimer le voyage « ${trip.title} » et ses inscriptions ?`)) onMutate(deleteTrip(state, trip.id));
  };

  const startSouvenirs = (trip: Trip) => {
    setSouvenirTripId(trip.id);
    setDraftPhotos(trip.souvenirs?.photos ?? []);
    setHighlightsText(trip.souvenirs?.highlights.join('\n') ?? '');
    setView('souvenirs');
  };
  const onPhotos = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setPhotoBusy(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < Math.min(files.length, 2); i += 1) urls.push(await fileToDataUrl(files[i]));
      setDraftPhotos((prev) => [...prev, ...urls].slice(0, 2));
    } catch { /* ignore unreadable file */ }
    finally { setPhotoBusy(false); }
  };
  const saveSouvenirs = () => {
    if (!souvenirTripId) return;
    onMutate(setSouvenirs(state, souvenirTripId, {
      photos: draftPhotos,
      highlights: highlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
    }));
    reset();
  };

  const removeReg = (registration: Registration) => {
    if (window.confirm(`Retirer l’inscription de ${registration.fullName} ?`)) onMutate(removeRegistration(state, registration.id));
  };

  const souvenirTrip = state.trips.find((trip) => trip.id === souvenirTripId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) reset(); onOpenChange(isOpen); }}>
      <DialogContent className="agency-dialog">
        <DialogTitle className="agency-title">
          {unlocked ? 'Espace Agence' : 'Accès réservé'}
          {unlocked && <button className="agency-close" aria-label="Fermer" onClick={() => onOpenChange(false)}><X size={18} /></button>}
        </DialogTitle>
        <DialogDescription>
          {unlocked ? 'Gérez les voyages, les souvenirs et les inscriptions. Modifié sur cet appareil.' : 'Cet espace est protégé par un code. Réservé à la maison de voyage.'}
        </DialogDescription>

        {!unlocked ? (
          <form className="pin-form" onSubmit={tryPin}>
            <Lock size={22} />
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Code agence" autoFocus maxLength={8} />
            <Button type="submit">Entrer</Button>
            {pinError && <p className="form-error" role="alert">{pinError}</p>}
            <p className="form-notice">Espace de démonstration — code par défaut : 1962.</p>
          </form>
        ) : view === 'list' ? (
          <div className="agency-list">
            <div className="agency-toolbar">
              <div className="agency-tabs">
                <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Voyages</button>
                <button onClick={() => setView('registrations')}>Inscriptions ({state.registrations.length})</button>
              </div>
              <Button onClick={startAdd}><Plus size={14} /> Ajouter un voyage</Button>
            </div>
            <div className="agency-table">
              {state.trips.map((trip) => (
                <div className="agency-row" key={trip.id}>
                  <div className="agency-row-main">
                    <strong>{trip.title || 'Sans titre'}</strong>
                    <span>{trip.category} <span>·</span> {trip.date || '—'}</span>
                    <span className="agency-row-meta">{trip.registered}/{trip.capacity} inscrits{trip.completed ? ' · réalisé' : ''}{trip.souvenirs ? ' · souvenirs' : ''}</span>
                  </div>
                  <div className="agency-row-actions">
                    <button title="Éditer" onClick={() => startEdit(trip)}><Pencil size={14} /></button>
                    <button title="Souvenirs" onClick={() => startSouvenirs(trip)}><Images size={14} /></button>
                    <button title="Supprimer" onClick={() => remove(trip)} className="danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : view === 'edit' && draft ? (
          <div className="agency-form">
            <div className="form-grid">
              <label className="form-field">Titre<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
              <label className="form-field">Région<input value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })} /></label>
              <label className="form-field">Catégorie<input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></label>
              <label className="form-field">Date<input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="18 – 22 déc. 2026" /></label>
              <label className="form-field">Durée<input value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} placeholder="5 jours · 4 nuits" /></label>
              <label className="form-field">Prix (TND)<input type="number" min={0} value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></label>
              <label className="form-field">Capacité<input type="number" min={1} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} /></label>
              <label className="form-field">Inscrits<input type="number" min={0} value={draft.registered} onChange={(e) => setDraft({ ...draft, registered: Number(e.target.value) })} /></label>
            </div>
            <label className="form-field">Lieux à visiter (séparés par des virgules)<input value={draft.placesText} onChange={(e) => setDraft({ ...draft, placesText: e.target.value })} /></label>
            <label className="form-field">Hôtels inclus (séparés par des virgules)<input value={draft.hotelsText} onChange={(e) => setDraft({ ...draft, hotelsText: e.target.value })} /></label>
            <label className="form-field">Programme (un jour par ligne)<textarea rows={5} value={draft.itineraryText} onChange={(e) => setDraft({ ...draft, itineraryText: e.target.value })} /></label>
            <label className="form-check"><input type="checkbox" checked={!!draft.completed} onChange={(e) => setDraft({ ...draft, completed: e.target.checked })} /> Voyage réalisé (souvenirs)</label>
            <div className="agency-form-actions">
              <Button variant="outline" onClick={() => { setDraft(null); setView('list'); }}>Annuler</Button>
              <Button onClick={saveDraft}><Check size={14} /> Enregistrer</Button>
            </div>
          </div>
        ) : view === 'souvenirs' ? (
          <div className="agency-form">
            <p className="form-notice">Souvenirs pour « {souvenirTrip?.title ?? '—'} ». Ajoutez 2 photos et les temps forts.</p>
            <div className="souvenir-upload">
              {draftPhotos.map((photo, i) => <img key={i} src={photo} alt={`Souvenir ${i + 1}`} />)}
              {draftPhotos.length < 2 && (
                <label className="upload-slot">
                  {photoBusy ? 'Chargement…' : '+'}
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => onPhotos(e.target.files)} />
                </label>
              )}
            </div>
            {draftPhotos.length > 0 && (
              <button className="link-button" onClick={() => setDraftPhotos([])}>Vider les photos</button>
            )}
            <label className="form-field">Temps forts (un par ligne)<textarea rows={4} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} /></label>
            <div className="agency-form-actions">
              <Button variant="outline" onClick={reset}>Annuler</Button>
              <Button onClick={saveSouvenirs}><Check size={14} /> Enregistrer les souvenirs</Button>
            </div>
          </div>
        ) : (
          <div className="agency-registrations">
            <div className="agency-toolbar">
              <div className="agency-tabs">
                <button onClick={() => setView('list')}>Voyages</button>
                <button className="active">Inscriptions ({state.registrations.length})</button>
              </div>
            </div>
            {state.registrations.length === 0 ? (
              <p className="souvenirs-empty">Aucune inscription enregistrée sur cet appareil.</p>
            ) : state.registrations.map((registration) => {
              const trip = state.trips.find((item) => item.id === registration.tripId);
              return (
                <div className="reg-row" key={registration.id}>
                  <div className="reg-main">
                    <strong>{registration.fullName}</strong>
                    <span>{trip?.title ?? 'Voyage supprimé'} <span>·</span> {registration.travelers} voyageur(s)</span>
                    <span className="reg-meta">{registration.email} <span>·</span> {registration.phone}</span>
                  </div>
                  <button title="Retirer" className="danger" onClick={() => removeReg(registration)}><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
