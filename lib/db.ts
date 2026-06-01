import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'leads.db')
const DB_DIR = path.dirname(DB_PATH)

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

const db = new Database(DB_PATH)
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    company    TEXT,
    service    TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    status     TEXT DEFAULT 'new'
  );
  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
`)

export type Lead = {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string
  message: string
  created_at: string
  status: 'new' | 'contacted' | 'won' | 'lost'
}

export type NewLead = Omit<Lead, 'id' | 'created_at' | 'status'>

export function insertLead(data: NewLead) {
  db.prepare(
    'INSERT INTO leads (name, email, phone, company, service, message) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.name, data.email, data.phone, data.company, data.service, data.message)
}

export function getLeads(): Lead[] {
  return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as Lead[]
}

export function updateStatus(id: number, status: string) {
  db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, id)
}
