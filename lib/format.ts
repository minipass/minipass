// CPF formatting function
export function formatCPF(value: string): string {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length <= 3) return cleanValue
    if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`
    if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`
}

// CPF validation function
export function validateCPF(cpf: string): boolean {
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

// CNPJ formatting function
export function formatCNPJ(value: string): string {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length <= 2) return cleanValue
    if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`
    if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`
    if (cleanValue.length <= 12)
        return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`
}

// CNPJ validation function
export function validateCNPJ(cnpj: string): boolean {
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
