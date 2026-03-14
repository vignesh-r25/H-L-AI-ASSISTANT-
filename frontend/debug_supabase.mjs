import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Manually parse .env file
function loadEnv() {
    const envPath = path.resolve(__dirname, '.env')
    try {
        const content = fs.readFileSync(envPath, 'utf8')
        const lines = content.split('\n')
        for (const line of lines) {
            const match = line.match(/^([^=]+)="?([^"\r\n]+)"?/)
            if (match) {
                process.env[match[1]] = match[2]
            }
        }
    } catch (err) {
        console.error('Error reading .env file:', err.message)
    }
}

loadEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseKey?.length)
console.log('Key prefix:', supabaseKey?.substring(0, 8))

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log('\n--- 1. Testing Auth ---')
    try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        if (authError) {
            console.error('Auth Error:', authError.message)
            console.error('Status:', authError.status)
        } else {
            console.log('Auth OK: Session exists?', !!authData.session)
        }
    } catch (e) {
        console.error('Auth check threw error:', e.message)
    }

    console.log('\n--- 2. Testing Storage ---')
    try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
        if (bucketError) {
            console.error('Storage Error:', bucketError.message)
            console.error('Status:', bucketError.status)
            if (bucketError.message.includes('Invalid Compact JWS') || bucketError.message.includes('JWT')) {
                console.log('\n!!! CRITICAL HINT !!!')
                console.log('Your VITE_SUPABASE_ANON_KEY is INVALID.')
                console.log('Standard Supabase keys MUST start with "eyJ...".')
                console.log('The key in your .env starts with "' + supabaseKey.substring(0, 8) + '", which looks like a different type of key.')
                console.log('Please copy the "anon" "public" key from your Supabase Dashboard > Project Settings > API.')
            }
        } else {
            console.log('Buckets found:', buckets.map(b => b.name))
            const avatarBucket = buckets.find(b => b.name === 'avatars')
            if (avatarBucket) {
                console.log('SUCCESS: "avatars" bucket exists.')
            } else {
                console.log('WARNING: "avatars" bucket MISSING.')
                console.log('You need to create a bucket named "avatars" and set it to PUBLIC.')
            }
        }
    } catch (e) {
        console.error('Storage check threw error:', e.message)
    }
}

debug()
