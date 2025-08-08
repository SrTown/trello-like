import { apiPost } from "./api"

// Tipos para las respuestas del CRD
export interface CRDResponse<T = any> {
    ok: boolean
    message?: string
    data?: T
}

// Construir query string desde objeto o string
function buildQueryString(params: Record<string, any> | string): string {
    if (typeof params === "string") return params

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            searchParams.set(key, value.join(","))
        } else if (value !== undefined && value !== null) {
            searchParams.set(key, String(value))
        }
    }
    return searchParams.toString()
}

// Crear registros
export async function crdCreate<T = any>(
    tableName: string,
    ...records: Record<string, any>[]
): Promise<CRDResponse<T>> {
    try {
        const response = await apiPost<CRDResponse<T>>(`/crd/create/${tableName}`, {
            data: records
        })
        return response
    } catch (error) {
        console.error(`Error creating in ${tableName}:`, error)
        return { ok: false, message: "Error de red al crear registro" }
    }
}

// Actualizar registros
export async function crdUpdate<T = any>(
    tableName: string,
    queryParams: Record<string, any> | string,
    updateData: Record<string, any>
): Promise<CRDResponse<T>> {
    try {
        const queryString = buildQueryString(queryParams)
        const response = await apiPost<CRDResponse<T>>(`/crd/update/${tableName}?${queryString}`, updateData)
        return response
    } catch (error) {
        console.error(`Error updating ${tableName}:`, error)
        return { ok: false, message: "Error de red al actualizar registro" }
    }
}

// Eliminar registros
export async function crdRemove<T = any>(
    tableName: string,
    queryParams: Record<string, any> | string
): Promise<CRDResponse<T>> {
    try {
        const queryString = buildQueryString(queryParams)
        const response = await apiPost<CRDResponse<T>>(`/crd/remove/${tableName}?${queryString}`)
        return response
    } catch (error) {
        console.error(`Error removing from ${tableName}:`, error)
        return { ok: false, message: "Error de red al eliminar registro" }
    }
}

// Obtener registros (si tu backend tiene GET /crd/read)
export async function crdRead<T = any>(
    tableName: string,
    queryParams?: Record<string, any> | string
): Promise<CRDResponse<T[]>> {
    try {
        const queryString = queryParams ? `?${buildQueryString(queryParams)}` : ""
        const response = await apiPost<CRDResponse<T[]>>(`/crd/read/${tableName}${queryString}`)
        return response
    } catch (error) {
        console.error(`Error reading from ${tableName}:`, error)
        return { ok: false, message: "Error de red al leer registros", data: [] }
    }
}
