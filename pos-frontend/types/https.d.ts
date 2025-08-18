declare module "../../https" {
  export function login(data: any): Promise<any>
  export function register(data: any): Promise<any>
  export function getUserData(): Promise<any>
  export function logout(): Promise<any>

  export function addTable(data: any): Promise<any>
  export function getTables(): Promise<any>
  export function updateTable(data: { tableId: string, [key: string]: any }): Promise<any>

  export function addCategory(data: any): Promise<any>

  export function addDish(data: any): Promise<any>
  export function getDishes(): Promise<any[]>
  export function updateDish(id: string, data: any): Promise<any>
  export function deleteDish(id: string): Promise<any>

  export function getCategories(): Promise<any[]>

  export function getPayments(): Promise<any>

  export function addOrder(data: any): Promise<any>
  export function getOrders(): Promise<any>
  export function updateOrderStatus(data: { orderId: string, orderStatus: string }): Promise<any>
  export function getPopularDishes(): Promise<any>
}
