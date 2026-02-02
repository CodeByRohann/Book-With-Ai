import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { Loader2, Upload, File as FileIcon } from 'lucide-react'
import { handleError, handleSuccess } from '@/lib/error-handler'

interface UploadDocumentModalProps {
    children?: React.ReactNode;
}

function UploadDocumentModal({ children }: UploadDocumentModalProps) {
    const { user } = useUser();
    const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
    const createDocument = useMutation(api.documents.createDocument);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('passport');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!title) {
                setTitle(e.target.files[0].name.split('.')[0]);
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !file) return;

        setLoading(true);
        try {
            // Step 1: Get a short-lived upload URL
            const postUrl = await generateUploadUrl();

            // Step 2: POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // Step 3: Save the newly allocated storageId to the database
            await createDocument({
                storageId,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                documentType: type,
                title: title,
                tags: [],
                isEncrypted: true,
            });

            handleSuccess('Document uploaded successfully!');
            setOpen(false);
            setTitle('');
            setFile(null);
            setType('passport');
        } catch (error) {
            handleError(error, 'Failed to upload document. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2">
                        <Upload className="w-4 h-4" /> Upload Document
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Securely store your travel documents.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Document Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Passport" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="docType">Document Type</Label>
                        <select
                            id="docType"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="passport">Passport</option>
                            <option value="visa">Visa</option>
                            <option value="tickets">Tickets</option>
                            <option value="insurance">Insurance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>File</Label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {file ? (
                                <div className="flex flex-col items-center text-center">
                                    <FileIcon className="w-8 h-8 text-blue-500 mb-2" />
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload</p>
                                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Secure Upload"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default UploadDocumentModal
