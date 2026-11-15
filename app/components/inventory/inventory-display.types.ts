export interface InventoryDisplayBalance {
    key: string
    locationId: number
    locationName: string
    previousOnHand: number
    onHand: number
    reserved: number
    available: number
    lowStockThreshold: number
    stockStatus: string
}
