import { RentalDetails } from '../types/rental';

export const dummyRentals: RentalDetails[] = [
    {
        id: '1',
        propertyId: 'p1',
        propertyName: 'Sunset Gardens',
        unit: '3',
        type: 'residential',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        rentAmount: 1500,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '123-456-7890'
        },
        owner: 'Sarah Wilson',
        manager: 'Mike Thompson',
        status: 'active',
        agreementFile: 'rental-agreement-001.pdf'
    },
    {
        id: '2',
        propertyId: 'p2',
        propertyName: 'Downtown Business Center',
        unit: '12',
        type: 'commercial',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        rentAmount: 5000,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r2',
            name: 'Tech Solutions Inc.',
            email: 'contact@techsolutions.com',
            phone: '987-654-3210'
        },
        owner: 'Robert Brown',
        manager: 'Lisa Chen',
        status: 'active',
        agreementFile: 'rental-agreement-002.pdf'
    },
    {
        id: '3',
        propertyId: 'p3',
        propertyName: 'Harbor View Apartments',
        unit: '5',
        type: 'residential',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        rentAmount: 2200,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r3',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            phone: '555-123-4567'
        },
        owner: 'David Miller',
        manager: 'Emily White',
        status: 'active',
        agreementFile: 'rental-agreement-003.pdf'
    },
    {
        id: '4',
        propertyId: 'p4',
        propertyName: 'Innovation Hub',
        unit: '8',
        type: 'commercial',
        startDate: '2024-01-15',
        endDate: '2026-01-14',
        rentAmount: 7500,
        paymentFrequency: 'quarterly',
        resident: {
            id: 'r4',
            name: 'Digital Dynamics LLC',
            email: 'info@digitaldynamics.com',
            phone: '888-999-0000'
        },
        owner: 'Jennifer Lee',
        manager: 'Alex Rodriguez',
        status: 'active',
        agreementFile: 'rental-agreement-004.pdf'
    },
    {
        id: '5',
        propertyId: 'p5',
        propertyName: 'Green Valley Residences',
        unit: '2',
        type: 'residential',
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        rentAmount: 1800,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r5',
            name: 'Michael Brown',
            email: 'michael@example.com',
            phone: '777-888-9999'
        },
        owner: 'Patricia Wang',
        manager: 'James Wilson',
        status: 'pending',
        agreementFile: null
    },
    {
        id: '6',
        propertyId: 'p6',
        propertyName: 'Retail Plaza',
        unit: '15',
        type: 'commercial',
        startDate: '2024-02-01',
        endDate: '2029-01-31',
        rentAmount: 4500,
        paymentFrequency: 'monthly',
        resident: {
            id: 'r6',
            name: 'Fashion Forward Co.',
            email: 'contact@fashionforward.com',
            phone: '444-555-6666'
        },
        owner: 'Thomas Anderson',
        manager: 'Maria Garcia',
        status: 'active',
        agreementFile: 'rental-agreement-006.pdf'
    }
];
