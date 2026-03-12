import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Car, Utensils, Zap, ChevronRight, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType, View } from '../App';

interface LifestyleSurveyProps {
    user: NonNullable<UserType>;
    onNavigate: (view: View) => void;
}

export function LifestyleSurvey({ user, onNavigate }: LifestyleSurveyProps) {
    const sectionRef = useRef<HTMLElement>(null);

    // Transport
    const [transportMode, setTransportMode] = useState('');
    const [dailyDistance, setDailyDistance] = useState('');
    const [fuelType, setFuelType]           = useState('petrol');

    // Food
    const [dietType, setDietType]                     = useState('');
    const [mealsPerDay, setMealsPerDay]               = useState('3');
    const [eatingOutFrequency, setEatingOutFrequency] = useState('');

    // Energy
    const [monthlyElectricity, setMonthlyElectricity] = useState('');
    const [renewableEnergy, setRenewableEnergy]       = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [prefillDone, setPrefillDone]   = useState(false); // guards one-time prefill only

    // Pre-fill form from existing survey — never blocks rendering
    useEffect(() => {
        if (prefillDone) return;
        setPrefillDone(true);
        api.survey.get()
            .then((s: any) => {
                if (!s || !s.primaryTransport) return; // no survey yet
                setTransportMode(s.primaryTransport ?? '');
                setDailyDistance(s.weeklyDrivingKm ? String(Math.round(s.weeklyDrivingKm / 7)) : '');
                setFuelType(s.carType ?? s.fuelType ?? 'petrol');
                setDietType(s.dietType ?? '');
                setMealsPerDay(s.meatMealsPerWeek ? String(s.meatMealsPerWeek) : '3');
                setEatingOutFrequency(s.eatingOutFrequency ?? '');
                setMonthlyElectricity(s.monthlyElectricityKwh ? String(s.monthlyElectricityKwh) : '');
                setRenewableEnergy(s.hasRenewableEnergy ?? false);
            })
            .catch(() => { /* no existing survey — that's fine, form stays blank */ });
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(
            (es) => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
        );
        sectionRef.current?.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    const validate = () => {
        if (!transportMode)       { toast.error('Please select a transport mode');         return false; }
        if (!dietType)            { toast.error('Please select a diet type');              return false; }
        if (!eatingOutFrequency)  { toast.error('Please select eating-out frequency');     return false; }
        if (!monthlyElectricity || parseFloat(monthlyElectricity) < 0) {
            toast.error('Please enter a valid monthly electricity usage');                 return false;
        }
        if (dailyDistance && parseFloat(dailyDistance) < 0) {
            toast.error('Daily distance cannot be negative');                              return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const usesVehicle = transportMode === 'car' || transportMode === 'electric_vehicle' || transportMode === 'motorcycle';
            await api.survey.save({
                primaryTransport:      transportMode,
                weeklyDrivingKm:       (parseFloat(dailyDistance) || 0) * 7,
                carType:               usesVehicle ? fuelType : undefined,
                fuelType:              usesVehicle ? fuelType : undefined,
                monthlyElectricityKwh: parseFloat(monthlyElectricity) || 0,
                hasRenewableEnergy:    renewableEnergy,
                dietType,
                meatMealsPerWeek:      parseInt(mealsPerDay) || 3,
                eatingOutFrequency,
                buysLocalFood:         false,
                shoppingHabits:        'average',
                buysSecondHand:        false,
                shortFlightsPerYear:   0,
                longFlightsPerYear:    0,
            });
            toast.success('Footprint calculated! Carbon logs updated. Redirecting to dashboard...');
            setTimeout(() => onNavigate('dashboard'), 1500);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save. Make sure the backend is running at localhost:8080.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showFuelType = transportMode === 'car' || transportMode === 'electric_vehicle' || transportMode === 'motorcycle';

    return (
        <section ref={sectionRef} className="min-h-screen bg-eco-bg pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

                {/* Breadcrumb */}
                <div className="mb-4 scroll-reveal">
                    <span className="text-sm text-eco-green font-medium">Lifestyle Survey</span>
                    <span className="text-sm text-eco-sage mx-2">·</span>
                    <span className="text-sm text-eco-sage">Carbon footprint calculation</span>
                </div>

                {/* Title */}
                <div className="mb-8 scroll-reveal">
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-eco-forest mb-2">
                        Lifestyle Assessment
                    </h1>
                    <p className="text-sm text-eco-sage leading-relaxed">
                        Answer a few questions about your daily habits. After submitting, your carbon logs are
                        automatically created and your dashboard updates with real calculated values.
                    </p>
                </div>

                <div className="space-y-6">

                    {/* ── Transport ── */}
                    <div className="eco-card p-6 scroll-reveal">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Car className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-eco-forest">Transport Information</h3>
                                <p className="text-xs text-eco-sage">How do you get around on a daily basis?</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-eco-forest mb-1.5">
                                    Primary Transport Mode <span className="text-red-500">*</span>
                                </label>
                                <select value={transportMode} onChange={e => setTransportMode(e.target.value)}
                                    className="eco-input appearance-none cursor-pointer">
                                    <option value="" disabled>Select mode...</option>
                                    <option value="car">Car</option>
                                    <option value="motorcycle">Motorcycle / Bike</option>
                                    <option value="electric_vehicle">Electric Vehicle</option>
                                    <option value="bus">Bus</option>
                                    <option value="train">Train / Metro</option>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="walking">Walking</option>
                                    <option value="wfh">Work From Home</option>
                                </select>
                            </div>

                            {/* Fuel Type — conditional on vehicle type (milestone requirement) */}
                            {showFuelType && (
                                <div>
                                    <label className="block text-sm font-medium text-eco-forest mb-1.5">
                                        Fuel Type <span className="text-red-500">*</span>
                                    </label>
                                    <select value={fuelType} onChange={e => setFuelType(e.target.value)}
                                        className="eco-input appearance-none cursor-pointer">
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                    <p className="mt-1.5 text-xs text-eco-sage flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                        Electric: 0.05 kg/km · Hybrid: 0.10 · Diesel: 0.17 · Petrol: 0.21
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-eco-forest mb-1.5">
                                    Average Distance per Day (km)
                                </label>
                                <div className="relative">
                                    <input type="number" value={dailyDistance}
                                        onChange={e => setDailyDistance(e.target.value)}
                                        placeholder="e.g. 15" min="0" className="eco-input pr-12" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-eco-sage">km</span>
                                </div>
                                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-eco-sage">
                                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                    Include commute and errands. Leave blank for walking / cycling / WFH.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Food & Diet ── */}
                    <div className="eco-card p-6 scroll-reveal">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Utensils className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-eco-forest">Food & Diet Information</h3>
                                <p className="text-xs text-eco-sage">What does your typical plate look like?</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-eco-forest mb-1.5">
                                        Diet Type <span className="text-red-500">*</span>
                                    </label>
                                    <select value={dietType} onChange={e => setDietType(e.target.value)}
                                        className="eco-input appearance-none cursor-pointer">
                                        <option value="" disabled>Select diet...</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="pescatarian">Pescatarian</option>
                                        <option value="omnivore">Omnivore (Non-Veg)</option>
                                        <option value="heavy_meat">Heavy Meat Eater</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-eco-forest mb-1.5">
                                        Meals Per Day
                                    </label>
                                    <input type="number" value={mealsPerDay}
                                        onChange={e => setMealsPerDay(e.target.value)}
                                        placeholder="3" min="1" max="6" className="eco-input" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-eco-forest mb-1.5">
                                    How often do you eat outside? <span className="text-red-500">*</span>
                                </label>
                                <select value={eatingOutFrequency} onChange={e => setEatingOutFrequency(e.target.value)}
                                    className="eco-input appearance-none cursor-pointer">
                                    <option value="" disabled>Select frequency...</option>
                                    <option value="rarely">Rarely (1–2 times/month)</option>
                                    <option value="sometimes">Sometimes (1–2 times/week)</option>
                                    <option value="often">Often (3–5 times/week)</option>
                                    <option value="daily">Daily</option>
                                </select>
                                <p className="mt-1.5 text-xs text-eco-sage">
                                    Restaurant meals generate 2–3× more emissions than home cooking.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Home Energy ── */}
                    <div className="eco-card p-6 scroll-reveal">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-eco-forest">Home Energy Usage</h3>
                                <p className="text-xs text-eco-sage">Understanding your utility footprint.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-eco-forest mb-1.5">
                                    Monthly Electricity Usage (kWh) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input type="number" value={monthlyElectricity}
                                        onChange={e => setMonthlyElectricity(e.target.value)}
                                        placeholder="e.g. 200" min="0" className="eco-input pr-14" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-eco-sage">kWh</span>
                                </div>
                                <p className="mt-1.5 text-xs text-eco-sage">Check your electricity bill for monthly kWh.</p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-eco-bg rounded-xl">
                                <div className="flex-1 mr-4">
                                    <p className="text-sm font-medium text-eco-forest">Renewable Energy Source</p>
                                    <p className="text-xs text-eco-sage mt-0.5">
                                        Solar panels or green energy provider? Reduces emission factor by ~80%.
                                    </p>
                                </div>
                                <button type="button" onClick={() => setRenewableEnergy(!renewableEnergy)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${renewableEnergy ? 'bg-eco-green' : 'bg-gray-300'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${renewableEnergy ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 scroll-reveal">
                        <button type="button" onClick={() => onNavigate('dashboard')} disabled={isSubmitting}
                            className="eco-button-outline px-6 py-2.5 text-sm">
                            Cancel
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                            className="eco-button flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-70">
                            {isSubmitting
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
                                : <>Calculate Footprint <ChevronRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
