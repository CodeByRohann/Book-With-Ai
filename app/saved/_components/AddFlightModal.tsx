import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { Loader2, Plus } from 'lucide-react'
import { handleError, handleSuccess } from '@/lib/error-handler'

interface AddFlightModalProps {
    children?: React.ReactNode;
}

function AddFlightModal({ children }: AddFlightModalProps) {
    const { user } = useUser();
    const saveFlight = useMutation(api.saved_flights.saveFlight);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        from: '',
        to: '',
        airline: '',
        flightNumber: '',
        departureDate: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
    });

    // Author: Sanket - Flight saving with proper error handling
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await saveFlight({
                searchParams: {
                    from: formData.from,
                    to: formData.to,
                    departureDate: formData.departureDate,
                    passengers: { adults: 1, children: 0, infants: 0 },
                    class: 'economy',
                    tripType: 'one_way',
                    returnDate: undefined
                },
                flightDetails: {
                    outbound: {
                        airline: formData.airline,
                        flightNumber: formData.flightNumber,
                        departure: formData.departureTime,
                        arrival: formData.arrivalTime,
                        duration: '2h 30m', // Mock calculation
                        stops: 0,
                    }
                },
                pricing: {
                    amount: parseFloat(formData.price),
                    currency: 'USD',
                    pricePerPerson: parseFloat(formData.price),
                    taxes: 0,
                    fees: 0
                },
                isPriceTracked: false,
                title: `Trip to ${formData.to}`
            });
            handleSuccess('Flight saved successfully!');
            setOpen(false);
            setFormData({
                from: '', to: '', airline: '', flightNumber: '',
                departureDate: '', departureTime: '', arrivalTime: '', price: ''
            });
        } catch (error) {
            handleError(error, 'Failed to save flight. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-blue-600 rounded-xl gap-2">
                        <Plus className="w-4 h-4" /> Add Flight
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle>Add Manual Flight</DialogTitle>
                    <DialogDescription>
                        Manually save a flight option to track it.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from">Origin (Code)</Label>
                            <Input id="from" name="from" placeholder="JFK" value={formData.from} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to">Dest (Code)</Label>
                            <Input id="to" name="to" placeholder="LHR" value={formData.to} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="airline">Airline</Label>
                            <Input id="airline" name="airline" placeholder="Delta" value={formData.airline} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="flightNumber">Flight No</Label>
                            <Input id="flightNumber" name="flightNumber" placeholder="DL123" value={formData.flightNumber} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="departureDate">Date</Label>
                            <Input id="departureDate" name="departureDate" type="date" value={formData.departureDate} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" name="price" type="number" placeholder="500" value={formData.price} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="departureTime">Dep Time</Label>
                            <Input id="departureTime" name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="arrivalTime">Arr Time</Label>
                            <Input id="arrivalTime" name="arrivalTime" type="time" value={formData.arrivalTime} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading} className="bg-blue-600">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Flight"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddFlightModal
