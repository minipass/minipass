'use client'

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

// CPF validation function
function validateCPF(cpf: string): boolean {
    // Remove non-digits
    const cleanCPF = cpf.replace(/\D/g, '')

    // Check if it has 11 digits
    if (cleanCPF.length !== 11) return false

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false

    // Validate first digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false

    // Validate second digit
    sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false

    return true
}

// CNPJ validation function
function validateCNPJ(cnpj: string): boolean {
    // Remove non-digits
    const cleanCNPJ = cnpj.replace(/\D/g, '')

    // Check if it has 14 digits
    if (cleanCNPJ.length !== 14) return false

    // Check if all digits are the same
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false

    // Validate first digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i]
    }
    let remainder = sum % 11
    let digit1 = remainder < 2 ? 0 : 11 - remainder
    if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false

    // Validate second digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum = 0
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i]
    }
    remainder = sum % 11
    let digit2 = remainder < 2 ? 0 : 11 - remainder
    if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false

    return true
}

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
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

type FormData = z.infer<typeof formSchema>

interface AccountSetupFormProps {
    provider: PaymentProvider
    onSubmit: (accountData: FormData) => void
    onCancel: () => void
    isLoading?: boolean
}

export default function AccountSetupForm({ provider, onSubmit, onCancel, isLoading = false }: AccountSetupFormProps) {
    const [personType, setPersonType] = useState<'FISICA' | 'JURIDICA'>('FISICA')

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
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
        // Validate CPF/CNPJ based on person type
        if (values.personType === 'FISICA') {
            if (!validateCPF(values.cpfCnpj)) {
                form.setError('cpfCnpj', {
                    type: 'manual',
                    message: 'Please enter a valid CPF',
                })
                return
            }
        } else if (values.personType === 'JURIDICA') {
            if (!validateCNPJ(values.cpfCnpj)) {
                form.setError('cpfCnpj', {
                    type: 'manual',
                    message: 'Please enter a valid CNPJ',
                })
                return
            }
        }

        onSubmit(values)
    }

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
                                        <Input {...field} type="email" placeholder="Enter your email" />
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
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2">R$</span>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                                className="pl-6"
                                                placeholder="Enter your monthly income"
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
