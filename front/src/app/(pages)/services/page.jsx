import { Suspense } from 'react'
import ServicesContent from './ServicesContent'

export default function ServicesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServicesContent />
        </Suspense>
    )
}