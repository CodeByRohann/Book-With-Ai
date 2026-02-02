import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { handleError, handleSuccess } from '@/lib/error-handler'

interface CreateGroupTripModalProps {
    children?: React.ReactNode;
}

function CreateGroupTripModal({ children }: CreateGroupTripModalProps) {
    const { user } = useUser();
    const router = useRouter();
    const createTrip = useMutation(api.group_trips.createGroupTrip);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        country: '',
        startDate: '',
        endDate: '',
        budgetTotal: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const tripId = await createTrip({
                name: formData.name,
                description: formData.description,
                destination: {
                    city: formData.city,
                    country: formData.country,
                },
                startDate: formData.startDate,
                endDate: formData.endDate,
                budget: {
                    total: parseFloat(formData.budgetTotal) || 0,
                    currency: 'USD',
                    perPerson: 0,
                    splitMethod: 'equal'
                }
            });

            setOpen(false);
            setFormData({ name: '', description: '', city: '', country: '', startDate: '', endDate: '', budgetTotal: '' });
            router.push(`/group-planning/${tripId}`);
        } catch (error) {
            handleError(error, 'Failed to create group trip. Please try again.');
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
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl gap-2">
                        <Plus className="w-4 h-4" /> New Group Trip
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle>Create Group Trip</DialogTitle>
                    <DialogDescription>
                        Start planning a new adventure with your squad.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Trip Name</Label>
                        <Input id="name" name="name" placeholder="Girls Trip to Bali 2024" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Short Description (Optional)</Label>
                        <Input id="description" name="description" placeholder="Relaxing beach vibes..." value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" placeholder="Ubud" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" name="country" placeholder="Indonesia" value={formData.country} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budgetTotal">Estimated Total Budget ($)</Label>
                        <Input id="budgetTotal" name="budgetTotal" type="number" placeholder="5000" value={formData.budgetTotal} onChange={handleChange} />
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Invite Friends"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateGroupTripModal
