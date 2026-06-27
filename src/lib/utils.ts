import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { GstBreakdown } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function computeGST(
  price: number,
  cgstRate: number,
  sgstRate: number
): GstBreakdown {
  const cgst = price * (cgstRate / 100)
  const sgst = price * (sgstRate / 100)
  return {
    subtotal: price,
    cgst,
    sgst,
    total: price + cgst + sgst,
  }
}

export function computeItemsGST(
  items: Array<{ price: number; cgstRate: number; sgstRate: number }>
): GstBreakdown {
  let subtotal = 0
  let cgst = 0
  let sgst = 0
  items.forEach((item) => {
    subtotal += item.price
    cgst += item.price * (item.cgstRate / 100)
    sgst += item.price * (item.sgstRate / 100)
  })
  return { subtotal, cgst, sgst, total: subtotal + cgst + sgst }
}