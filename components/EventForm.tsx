'use client'

import { useUser } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStorageUrl } from '@/hooks/useStorageUrl'
import { useToast } from '@/hooks/useToast'
import dayjs from '@/lib/dayjs'

const formSchema = z.object({
    name: z.string().min(1, 'Nome do evento é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    location: z.string().min(1, 'Local é obrigatório'),
    eventDate: z.date().min(dayjs().toDate(), 'Data do evento deve ser no futuro'),
    price: z.number().min(0, 'Preço deve ser 0 ou maior'),
    totalTickets: z.number().min(1, 'Deve ter pelo menos 1 ingresso'),
    displayTotalTickets: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface InitialEventData {
    _id: Id<'events'>
    name: string
    description: string
    location: string
    eventDate: number
    price: number
    totalTickets: number
    displayTotalTickets: boolean
    imageStorageId?: Id<'_storage'>
}

interface EventFormProps {
    mode: 'create' | 'edit'
    initialData?: InitialEventData
}

export default function EventForm({ mode, initialData }: EventFormProps) {
    const { user } = useUser()
    const createEvent = useMutation(api.events.create)
    const updateEvent = useMutation(api.events.updateEvent)
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const currentImageUrl = useStorageUrl(initialData?.imageStorageId)

    // Image upload
    const imageInput = useRef<HTMLInputElement>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
    const updateEventImage = useMutation(api.storage.updateEventImage)
    const deleteImage = useMutation(api.storage.deleteImage)

    const [removedCurrentImage, setRemovedCurrentImage] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? '',
            description: initialData?.description ?? '',
            location: initialData?.location ?? '',
            eventDate: initialData ? dayjs(initialData.eventDate).toDate() : dayjs().toDate(),
            totalTickets: initialData?.totalTickets ?? 1,
            displayTotalTickets: initialData?.displayTotalTickets ?? false,
        },
    })

    async function onSubmit(values: FormData) {
        if (!user?.id) return

        startTransition(async () => {
            try {
                let imageStorageId = null

                // Handle image changes
                if (selectedImage) {
                    // Upload new image
                    imageStorageId = await handleImageUpload(selectedImage)
                }

                // Handle image deletion/update in edit mode
                if (mode === 'edit' && initialData?.imageStorageId) {
                    if (removedCurrentImage || selectedImage) {
                        // Delete old image from storage
                        await deleteImage({
                            storageId: initialData.imageStorageId,
                        })
                    }
                }

                if (mode === 'create') {
                    const eventId = await createEvent({
                        ...values,
                        userId: user.id,
                        eventDate: dayjs(values.eventDate).toDate().getTime(),
                    })

                    if (imageStorageId) {
                        await updateEventImage({
                            eventId,
                            storageId: imageStorageId as Id<'_storage'>,
                        })
                    }

                    router.push(`/dashboard/event/${eventId}`)
                } else {
                    // Ensure initialData exists before proceeding with update
                    if (!initialData) {
                        throw new Error('Initial event data is required for updates')
                    }

                    // Update event details
                    await updateEvent({
                        eventId: initialData._id,
                        ...values,
                        eventDate: dayjs(values.eventDate).toDate().getTime(),
                    })

                    // Update image - this will now handle both adding new image and removing existing image
                    if (imageStorageId || removedCurrentImage) {
                        await updateEventImage({
                            eventId: initialData._id,
                            // If we have a new image, use its ID, otherwise if we're removing the image, pass null
                            storageId: imageStorageId ? (imageStorageId as Id<'_storage'>) : null,
                        })
                    }

                    toast({
                        title: 'Evento atualizado',
                        description: 'Seu evento foi atualizado com sucesso.',
                    })

                    router.push(`/dashboard/event/${initialData._id}`)
                }
            } catch (error) {
                console.error('Failed to handle event:', error)
                toast({
                    variant: 'destructive',
                    title: 'Ops! Algo deu errado.',
                    description: 'Houve um problema com sua solicitação.',
                })
            }
        })
    }

    async function handleImageUpload(file: File): Promise<string | null> {
        try {
            const postUrl = await generateUploadUrl()
            const result = await fetch(postUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            })
            const { storageId } = await result.json()
            return storageId
        } catch (error) {
            console.error('Failed to upload image:', error)
            return null
        }
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Form fields */}
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Evento</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Local</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data do Evento</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        {...field}
                                        onChange={e => {
                                            console.log(
                                                'e.target.value',
                                                e.target.value,
                                                dayjs(e.target.value).toDate(),
                                            )
                                            field.onChange(dayjs(e.target.value).toDate())
                                        }}
                                        value={field.value ? dayjs(field.value).format('YYYY-MM-DDTHH:mm') : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço por Ingresso</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">R$</span>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                            className="pl-8"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="totalTickets"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total de Ingressos Disponíveis</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="displayTotalTickets"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="mt-1"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Exibir disponibilidade de ingressos</FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                        Quando desabilitado, a disponibilidade de ingressos não será mostrada
                                        publicamente
                                    </p>
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-foreground">Imagem do Evento</label>
                        <div className="mt-4 flex items-center gap-4">
                            {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                                <div className="relative w-32 aspect-square bg-gray-100 rounded-sm">
                                    <Image
                                        src={imagePreview || currentImageUrl!}
                                        alt="Preview"
                                        fill
                                        className="object-contain rounded-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null)
                                            setImagePreview(null)
                                            setRemovedCurrentImage(true)
                                            if (imageInput.current) {
                                                imageInput.current.value = ''
                                            }
                                        }}
                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-sm w-6 h-6 flex items-center justify-center hover:bg-destructive/90 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={imageInput}
                                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Imagem do evento será exibida na página do evento, na lista de eventos e no ingresso.
                            Tamanho recomendado: 1000x500px.
                        </p>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium py-2 px-4 rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {mode === 'create' ? 'Criando Evento...' : 'Atualizando Evento...'}
                        </>
                    ) : mode === 'create' ? (
                        'Criar Evento'
                    ) : (
                        'Atualizar Evento'
                    )}
                </Button>
            </form>
        </Form>
    )
}
