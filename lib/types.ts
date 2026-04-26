export type User = {
  id: string
  name: string
  emoji: string
  coins: number
  created_at: string
}

export type Listing = {
  id: string
  user_id: string
  title: string
  price: number
  image_url: string
  sold: boolean
  buyer_id: string | null
  created_at: string
  users?: { name: string; emoji: string }
}
