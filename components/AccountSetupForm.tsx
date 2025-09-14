'use client'

import { useUser } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PaymentProvider } from '@/convex/types'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { formatCNPJ, formatCPF, validateCNPJ, validateCPF } from '@/lib/format'

const formSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Please enter a valid email address'),
        birthDate: z
            .string()
            .min(1, 'Birth date is required')
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format')
            .refine(date => {
                const parsedDate = new Date(date)
                const today = new Date()
                const minDate = new Date('1900-01-01')
                return parsedDate <= today && parsedDate >= minDate
            }, 'Please enter a valid birth date'),
        personType: z.enum(['FISICA', 'JURIDICA'], {
            required_error: 'Please select a person type',
        }),
        cpfCnpj: z.string().min(1, 'CPF/CNPJ is required'),
        mobilePhone: z.string().min(1, 'Mobile phone is required'),
        incomeValue: z.number().min(0.01, 'Monthly income must be greater than 0'),
        address: z.string().min(1, 'Address is required'),
        addressNumber: z.string().min(1, 'Address number is required'),
        province: z.string().min(1, 'State/Province is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
    })
    .refine(
        data => {
            if (data.personType === 'FISICA') {
                return validateCPF(data.cpfCnpj)
            } else if (data.personType === 'JURIDICA') {
                return validateCNPJ(data.cpfCnpj)
            }
            return true
        },
        {
            message: 'Please enter a valid CPF/CNPJ',
            path: ['cpfCnpj'],
        },
    )

type FormData = z.infer<typeof formSchema>

interface AccountSetupFormProps {
    provider: PaymentProvider | null
    onSubmit: (accountData: FormData) => void
    onCancel: () => void
    isLoading?: boolean
}

export default function AccountSetupForm({ provider, onSubmit, onCancel, isLoading = false }: AccountSetupFormProps) {
    const { user } = useUser()
    const [personType, setPersonType] = useState<'FISICA' | 'JURIDICA'>('FISICA')

    const initialUserAddress = user?.emailAddresses[0]?.emailAddress

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: initialUserAddress ?? '',
            birthDate: '',
            personType: 'FISICA',
            cpfCnpj: '',
            mobilePhone: '',
            incomeValue: 0,
            address: '',
            addressNumber: '',
            province: '',
            postalCode: '',
        },
    })

    function handleSubmit(values: FormData) {
        onSubmit(values)
    }

    if (!provider) return null

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Setup {provider === 'asaas' ? 'Asaas' : 'Stripe'} Account
            </h3>
            <p className="text-sm text-gray-600 mb-6">
                Please provide the required information to create your payment account.
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your full name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <span>
                                            <Input {...field} type="email" placeholder="Enter your email" />
                                            {initialUserAddress && form.getValues().email === initialUserAddress && (
                                                <p className="text-sm text-gray-500">
                                                    This is your default email address.
                                                </p>
                                            )}
                                        </span>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Birth Date</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date" placeholder="YYYY-MM-DD" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="personType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Person Type</FormLabel>
                                    <FormControl>
                                        <ToggleGroup
                                            options={[
                                                { value: 'FISICA', label: 'Pessoa Física' },
                                                { value: 'JURIDICA', label: 'Pessoa Jurídica' },
                                            ]}
                                            value={field.value}
                                            onChange={(value: 'FISICA' | 'JURIDICA') => {
                                                field.onChange(value)
                                                setPersonType(value)
                                                form.setValue('cpfCnpj', '')
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cpfCnpj"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{personType === 'FISICA' ? 'CPF' : 'CNPJ'}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={`Enter your ${personType === 'FISICA' ? 'CPF' : 'CNPJ'}`}
                                            onChange={e => {
                                                const value = e.target.value
                                                const formattedValue =
                                                    personType === 'FISICA' ? formatCPF(value) : formatCNPJ(value)
                                                field.onChange(formattedValue)
                                            }}
                                            maxLength={personType === 'FISICA' ? 14 : 18}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mobilePhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mobile Phone</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="tel" placeholder="Enter your mobile phone" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="incomeValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monthly Income (R$)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span
                                                className="absolute left-2 
                                            top-1/2 -translate-y-1/2"
                                            >
                                                R$
                                            </span>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                                className="pl-8"
                                                placeholder="Enter your 
                                                monthly income"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your address" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="addressNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter address number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="province"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State/Province</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your state/province" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter your postal code" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
