export const valid_num = (mobile_no: string): boolean => {
  return /^[0-9]{10}$/.test(mobile_no)
}

export const valid_year = (year: number): boolean => {
  const currentYear = new Date().getFullYear()
  return year >= 2000 && year <= currentYear
}

export const valid_month = (month: number): boolean => {
  return month >= 1 && month <= 12
}

export const valid_address = (address: string): boolean => {
  return address.trim().length >= 7
}

export const valid_consumer_id = (id: number): boolean => {
  return Number.isInteger(id) && id > 0
}