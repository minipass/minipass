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
        name: z.string().min(1, 'Nome é obrigatório'),
        email: z.string().email('Por favor, insira um endereço de email válido'),
        birthDate: z
            .string()
            .min(1, 'Data de nascimento é obrigatória')
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD')
            .refine(date => {
                const parsedDate = new Date(date)
                const today = new Date()
                const minDate = new Date('1900-01-01')
                return parsedDate <= today && parsedDate >= minDate
            }, 'Por favor, insira uma data de nascimento válida'),
        personType: z.enum(['FISICA', 'JURIDICA'], {
            required_error: 'Por favor, selecione um tipo de pessoa',
        }),
        cpfCnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
        mobilePhone: z.string().min(1, 'Telefone celular é obrigatório'),
        incomeValue: z.number().min(0.01, 'Renda mensal deve ser maior que 0'),
        address: z.string().min(1, 'Endereço é obrigatório'),
        addressNumber: z.string().min(1, 'Número do endereço é obrigatório'),
        province: z.string().min(1, 'Estado é obrigatório'),
        postalCode: z.string().min(1, 'CEP é obrigatório'),
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
            message: 'Por favor, insira um CPF/CNPJ válido',
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
                Configurar Conta {provider === 'asaas' ? 'Asaas' : 'Stripe'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
                Por favor, forneça as informações necessárias para criar sua conta de pagamento.
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Digite seu nome completo" />
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
                                            <Input {...field} type="email" placeholder="Digite seu email" />
                                            {initialUserAddress && form.getValues().email === initialUserAddress && (
                                                <p className="text-sm text-gray-500">
                                                    Este é seu endereço de email padrão.
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
                                    <FormLabel>Data de Nascimento</FormLabel>
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
                                    <FormLabel>Tipo de Pessoa</FormLabel>
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
                                            placeholder={`Digite seu ${personType === 'FISICA' ? 'CPF' : 'CNPJ'}`}
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
                                    <FormLabel>Telefone Celular</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="tel" placeholder="Digite seu telefone celular" />
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
                                    <FormLabel>Renda Mensal (R$)</FormLabel>
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
                                                placeholder="Digite sua 
                                                renda mensal"
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
                                    <FormLabel>Endereço</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Digite seu endereço" />
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
                                    <FormLabel>Número do Endereço</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Digite o número do endereço" />
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
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Digite seu estado" />
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
                                    <FormLabel>CEP</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Digite seu CEP" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Criando Conta...
                                </>
                            ) : (
                                'Criar Conta'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
